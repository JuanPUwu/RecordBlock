import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useClientes } from "./useClientes.js";
import { useHomeInfo } from "./useHomeInfo.js";
import { useHomeForms } from "./useHomeForms.js";
import { useCrearInfo } from "./useCrearInfo.js";
import { useEditarInfo } from "./useEditarInfo.js";
import { useCSV } from "./useCSV.js";
import { useDatosMinimosAdmin } from "./useDatosMinimosAdmin.js";
import { useEliminarInfo } from "./useEliminarInfo.js";
import { useLogout } from "./useLogout.js";
import { useEditarContrasena } from "./useEditarContrasena.js";
import { useUsuarioService } from "../services/usuarioService.js";
import Swal from "sweetalert2";
import swalStyles from "../css/swalStyles.js";

/**
 * Hook maestro que contiene toda la lógica común de HomeUsuario y HomeAdmin
 */
export const useHomeBase = (isAdmin = false) => {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Formularios
  const forms = useHomeForms(isAdmin);

  // Clientes (solo admin)
  const clientesHook = isAdmin ? useClientes() : null;
  const clienteSeleccionado = clientesHook?.clienteSeleccionado || null;
  const setClienteSeleccionado = clientesHook?.setClienteSeleccionado || null;
  const opcionesClientes = clientesHook?.opcionesClientes || [];
  const opcionesClientesTabla = clientesHook?.opcionesClientesTabla || [];
  const refBusquedaCliente = clientesHook?.refBusquedaCliente || null;
  const resultadosBusquedaClientes = clientesHook?.resultadosBusquedaClientes || [];
  const obtenerClientes = clientesHook?.obtenerClientes || (() => {});
  const buscarCliente = clientesHook?.buscarCliente || (() => {});
  const buscarClienteTabla = clientesHook?.buscarClienteTabla || (() => {});
  const seleccionBusqueda = clientesHook?.seleccionBusqueda || (() => {});
  const limpiarClienteSeleccionado = clientesHook?.limpiarClienteSeleccionado || (() => {});

  // Información
  const homeInfo = useHomeInfo(user, clienteSeleccionado, opcionesClientes, isAdmin, setIsLoading);
  const { cargarInformacion } = homeInfo;

  // Para usuario: crear clienteSeleccionado simulado
  const clienteSeleccionadoSimulado = isAdmin
    ? clienteSeleccionado
    : {
        value: user?.id || user?.value || null,
      };

  // Datos mínimos
  const {
    datosMinimos,
    obtenerDatosMin,
    inicializarDraft,
    cambiarDatoMinimo,
    eliminarDatoMinimo,
    agregarDatoMinimo,
    guardarDatosMinimos,
    scrollDatosMinimosRef,
    inputDatosMinimosRef,
    draftDatosMinimos,
    setDraftDatosMinimos,
  } = useDatosMinimosAdmin();

  // Crear información
  const {
    draftCrear,
    setDraftCrear,
    scrollCrearRef,
    inputCrearRef,
    cambiarLlaveCrear,
    cambiarValorCrear,
    eliminarDatoCrear,
    agregarDatoCrear,
    crearRegistro,
  } = useCrearInfo(clienteSeleccionadoSimulado, cargarInformacion);

  const { refInputFile, onFileSelected } = useCSV(
    clienteSeleccionadoSimulado,
    cargarInformacion
  );

  // Editar información
  const {
    setInfoSeleccionada,
    infoAEditar,
    setInfoAEditar,
    draftDatos,
    scrollRef,
    inputRef,
    cambiarLlaveDraft,
    cambiarValorDraft,
    eliminarDatoDraft,
    agregarDatoDraft,
    editarRegistro,
    handleEditarInfo,
  } = useEditarInfo(cargarInformacion);

  // Eliminar información
  const { eliminarInformacionCliente } = useEliminarInfo(
    cargarInformacion,
    setIsLoading
  );

  // Logout
  const { cerrarSesion } = useLogout(logout, setIsLoading);

  // Editar contraseña
  const { editarContraseña } = useEditarContrasena(setIsLoading);

  // Estados de popups
  const [popUpUsuarios, setPopUpUsuarios] = useState(false);
  const [popUpEditarContrasena, setPopUpEditarContrasena] = useState(false);
  const [popUpCrearCliente, setPopUpCrearCliente] = useState(false);
  const [popUpCrearInfo, setPopUpCrearInfo] = useState(false);
  const [popUpEditarInfo, setPopUpEditarInfo] = useState(false);
  const [popUpEditarDatosMinimos, setPopUpEditarDatosMinimos] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [isRefrescarInfo, setIsRefrescarInfo] = useState(false);

  // Handlers
  const handleEditarContraseña = async (data) => {
    await editarContraseña(usuarioSeleccionado, data, () => {
      setUsuarioSeleccionado(null);
      setPopUpEditarContrasena(false);
    });
  };

  const handleCrearRegistro = async () => {
    const success = await crearRegistro(setIsLoading);
    if (success) {
      setPopUpCrearInfo(false);
    }
  };

  const handleSubirCSV = async (e) => {
    await onFileSelected(e, setIsLoading);
    setPopUpCrearInfo(false);
  };

  const handleEditarRegistro = async () => {
    const success = await editarRegistro(setIsLoading);
    if (success) {
      setPopUpEditarInfo(false);
    }
  };

  const refrescarInfo = () => {
    setIsRefrescarInfo(true);
    cargarInformacion();
    toast.success("Registros refrescados");
    setTimeout(() => {
      setIsRefrescarInfo(false);
    }, 300);
  };

  // Crear cliente (solo admin)
  const usuarioService = useUsuarioService();
  const crearUsuario = isAdmin ? usuarioService.crearUsuario : null;
  const eliminarUsuario = isAdmin ? usuarioService.eliminarUsuario : null;

  const crearCliente = async (data) => {
    if (!crearUsuario) return;
    const { password2, ...usuario } = data;
    const response = await crearUsuario(usuario);
    if (response.success) {
      toast.success("Cliente creado con éxito\n¡Verificación pendiente!");
      obtenerClientes();
    } else {
      toast.error(response.error);
      return;
    }
    setPopUpCrearCliente(false);
  };

  const eliminarCliente = async (cliente) => {
    if (!eliminarUsuario) return;
    const result = await Swal.fire({
      title: `¿Eliminar cliente ${cliente.nombre}?`,
      text: "Esta acción es irreversible",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, Eliminar",
      cancelButtonText: "Cancelar",
      ...swalStyles,
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      const response = await eliminarUsuario(cliente.id);

      if (response.success) {
        setIsLoading(false);
        toast.success(`Cliente ${cliente.nombre} eliminado`);
        if (clienteSeleccionado?.value === cliente.id) {
          setClienteSeleccionado(null);
          refBusquedaCliente.current.value = "";
          resultadosBusquedaClientes.length = 0;
        }
        obtenerClientes();
      } else {
        setIsLoading(false);
        toast.error(response.error || "No se pudo eliminar el cliente");
      }
    }
  };

  // Cargar información al montar o cuando cambia cliente seleccionado
  useEffect(() => {
    cargarInformacion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, isAdmin ? [clienteSeleccionado] : []);

  // Inicializar draft de datos mínimos cuando se abre el popup
  useEffect(() => {
    if (isAdmin) {
      inicializarDraft(popUpEditarDatosMinimos);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popUpEditarDatosMinimos, isAdmin]);

  return {
    // Usuario
    user,
    isLoading,
    setIsLoading,
    isRefrescarInfo,
    // Formularios
    ...forms,
    // Clientes (solo admin)
    clienteSeleccionado,
    setClienteSeleccionado,
    opcionesClientes,
    opcionesClientesTabla,
    refBusquedaCliente,
    resultadosBusquedaClientes,
    obtenerClientes,
    buscarCliente,
    buscarClienteTabla,
    seleccionBusqueda,
    limpiarClienteSeleccionado,
    // Información
    ...homeInfo,
    clienteSeleccionadoSimulado,
    // Datos mínimos
    datosMinimos,
    obtenerDatosMin,
    cambiarDatoMinimo,
    eliminarDatoMinimo,
    agregarDatoMinimo,
    guardarDatosMinimos,
    scrollDatosMinimosRef,
    inputDatosMinimosRef,
    draftDatosMinimos,
    setDraftDatosMinimos,
    // Crear información
    draftCrear,
    setDraftCrear,
    scrollCrearRef,
    inputCrearRef,
    cambiarLlaveCrear,
    cambiarValorCrear,
    eliminarDatoCrear,
    agregarDatoCrear,
    refInputFile,
    // Editar información
    setInfoSeleccionada,
    infoAEditar,
    setInfoAEditar,
    draftDatos,
    scrollRef,
    inputRef,
    cambiarLlaveDraft,
    cambiarValorDraft,
    eliminarDatoDraft,
    agregarDatoDraft,
    handleEditarInfo,
    // Popups
    popUpUsuarios,
    setPopUpUsuarios,
    popUpEditarContrasena,
    setPopUpEditarContrasena,
    popUpCrearCliente,
    setPopUpCrearCliente,
    popUpCrearInfo,
    setPopUpCrearInfo,
    popUpEditarInfo,
    setPopUpEditarInfo,
    popUpEditarDatosMinimos,
    setPopUpEditarDatosMinimos,
    usuarioSeleccionado,
    setUsuarioSeleccionado,
    // Handlers
    handleEditarContraseña,
    handleCrearRegistro,
    handleSubirCSV,
    handleEditarRegistro,
    refrescarInfo,
    crearCliente,
    eliminarCliente,
    eliminarInformacionCliente,
    cerrarSesion,
    cargarInformacion,
  };
};

