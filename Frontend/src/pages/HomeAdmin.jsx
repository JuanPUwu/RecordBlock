// Estilos
import "../css/home.css";
import "../css/swalStyles.css";
import "../css/swalTableCSVStyles.css";
import selectNavStyles from "../css/selectNavStyles.js";

// Hooks
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

// Hooks personalizados
import { useClientes } from "../hooks/useClientes.js";
import { useFiltros } from "../hooks/useFiltros.js";
import { useCrearInfo } from "../hooks/useCrearInfo.js";
import { useEditarInfo } from "../hooks/useEditarInfo.js";
import { useCSV } from "../hooks/useCSV.js";
import { useDatosMinimosAdmin } from "../hooks/useDatosMinimosAdmin.js";

// Servicios
import { useUsuarioService } from "../services/usuarioService.js";
import { useInfoUsuarioService } from "../services/infoUsuarioServices.js";

// Eschemas
import {
  schemaCrearUsuario,
  schemaCambiarContraseña,
} from "../validations/eschemas";

// Componentes
import Nav from "../components/Nav.jsx";
import SepHrz from "../components/SepHrz.jsx";
import Select from "react-select";
import SearchNav from "../components/SearchNav.jsx";
import Spinner from "../components/Spinner.jsx";
import PopupUsuarios from "../components/PopupUsuarios.jsx";
import PopupCrearCliente from "../components/PopupCrearCliente.jsx";
import PopupEditarContrasena from "../components/PopupEditarContrasena.jsx";
import PopupCrearInfo from "../components/PopupCrearInfo.jsx";
import PopupEditarInfo from "../components/PopupEditarInfo.jsx";
import PopupEditarDatosMinimos from "../components/PopupEditarDatosMinimos.jsx";
import ContenidoPrincipal from "../components/ContenidoPrincipal.jsx";

// Imagenes
import imgUsuario from "../assets/img/usuario.webp";
import imgLimpiar from "../assets/img/reset.webp";
import imgSearch from "../assets/img/busqueda.webp";
import imgCrearRegistro from "../assets/img/flecha.webp";
import imgExcell from "../assets/img/excell.webp";
import imgPdf from "../assets/img/pdf.webp";
import imgSalir from "../assets/img/salir.webp";
import swalStyles from "../css/swalStyles.js";

export default function HomeAdmin() {
  // ? Inicio Manejo formularios ->
  // Formulario Crear Usuario
  const {
    register: registerCrear,
    handleSubmit: handleSubmitCrear,
    reset: resetCrear,
    formState: { errors: errorsCrear, isSubmitting: isSubmittingCrear },
  } = useForm({
    resolver: yupResolver(schemaCrearUsuario),
  });

  // Formulario Cambiar Contraseña
  const {
    register: registerCambiar,
    handleSubmit: handleSubmitCambiar,
    reset: resetCambiar,
    formState: { errors: errorsCambiar, isSubmitting: isSubmittingCambiar },
  } = useForm({
    resolver: yupResolver(schemaCambiarContraseña),
  });
  // ? <- Fin Manejo formularios

  // * <-------------------------------------------------------------------------------->

  // ? -> Inicio utils
  // Usuario actual
  const { user, logout } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  // ? <- Fin utils

  // * <-------------------------------------------------------------------------------->

  // ? Inicio traer clientes/acciones ->
  const {
    opcionesClientes,
    opcionesClientesTabla,
    resultadosBusquedaClientes,
    clienteSeleccionado,
    setClienteSeleccionado,
    refBusquedaCliente,
    obtenerClientes,
    buscarCliente,
    buscarClienteTabla,
    seleccionBusqueda,
    limpiarClienteSeleccionado,
  } = useClientes();
  // ? <- Fin traer clientes/acciones

  // * <-------------------------------------------------------------------------------->

  // ? Inicio crear cliente/acciones ->
  // Estado popUp formulario crear cliente
  const [popUpCrearCliente, setPopUpCrearCliente] = useState(false);

  // Estado para ver las contraseñas
  const [verPassword, setVerPassword] = useState("password");
  const [verPassword2, setVerPassword2] = useState("password");

  // Crear cliente
  const { crearUsuario } = useUsuarioService();
  const crearCliente = async (data) => {
    // Quitamos password2 antes de enviar
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
  // ? <- Fin Crear cliente/acciones

  // * <-------------------------------------------------------------------------------->

  // ? Inicio editar contraseña cliente/acciones ->
  const [popUpUsuarios, setPopUpUsuarios] = useState(false);
  const [popUpEditarContrasena, setPopUpEditarContrasena] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const { actualizarUsuario } = useUsuarioService();
  const editarContraseña = async (data) => {
    setIsLoading(true);
    const response = await actualizarUsuario(
      usuarioSeleccionado.id,
      data.password
    );
    if (response.success) {
      setIsLoading(false);
      toast.success("Contraseña cambiada con éxito");
      setUsuarioSeleccionado(null);
      setPopUpEditarContrasena(false);
    } else {
      setIsLoading(false);
      toast.error(response.error);
    }
  };
  // ? <- Fin editar cliente/acciones

  // * <-------------------------------------------------------------------------------->

  // ? -> Inicio eliminar cliente/acciones
  const { eliminarUsuario } = useUsuarioService();
  const eliminarCliente = async (cliente) => {
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
      // Si el usuario confirma, eliminamos el cliente
      const response = await eliminarUsuario(cliente.id);

      if (response.success) {
        setIsLoading(false);
        toast.success(`Cliente ${cliente.nombre} eliminado`);
        // Si el cliente eliminado estaba seleccionado, limpiar la selección
        if (clienteSeleccionado?.value === cliente.id) {
          setClienteSeleccionado(null);
          refBusquedaCliente.current.value = "";
          resultadosBusquedaClientes.length = 0;
        }
        // Actualizar la lista de clientes
        obtenerClientes();
      } else {
        setIsLoading(false);
        toast.error(response.error || "No se pudo eliminar el cliente");
      }
    }
  };
  // ? <- Fin eliminar cliente/acciones

  // * <-------------------------------------------------------------------------------->

  // ? -> Inicio ver info cliente
  const { obtenerInformacion } = useInfoUsuarioService();
  const refInformacion = useRef(null);

  const {
    terminosBusqueda,
    filtrarPorFecha,
    setFiltrarPorFecha,
    isDatoValue,
    isDetalleValue,
    whichInfo,
    isInfoCargando,
    setIsInfoCargando,
    refDato,
    refDetalle,
    filtroInformacion,
  } = useFiltros(refInformacion);

  const cargarInformacion = async () => {
    setIsInfoCargando(true);
    const response = await obtenerInformacion(clienteSeleccionado?.value);
    refInformacion.current = response.data.data;
    filtroInformacion();
  };

  // Cargar información cuando cambia el cliente seleccionado
  // Si hay cliente seleccionado, carga sus registros
  // Si no hay cliente seleccionado (null), carga todos los registros
  useEffect(() => {
    cargarInformacion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteSeleccionado]);

  // Exportar como PDF
  const exportarComoPDF = async () => {
    setIsLoading(true);
    const { exportarPDF } = await import("../utils/pdfUtils.js");
    try {
      await exportarPDF(whichInfo, opcionesClientes);
    } finally {
      setIsLoading(false);
    }
  };

  // Exportar como excell
  const exportarComoExcell = async () => {
    setIsLoading(true);
    const { exportarExcel } = await import("../utils/excellUtils.js");
    try {
      await exportarExcel(whichInfo, opcionesClientes);
    } finally {
      setIsLoading(false);
    }
  };
  // ? <- Fin ver info cliente

  // * <-------------------------------------------------------------------------------->

  // ? -> Inicio crear info cliente
  const [popUpCrearInfo, setPopUpCrearInfo] = useState(false);

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
  } = useCrearInfo(clienteSeleccionado, cargarInformacion);

  const { refInputFile, onFileSelected } = useCSV(
    clienteSeleccionado,
    cargarInformacion
  );

  const [popUpEditarDatosMinimos, setPopUpEditarDatosMinimos] = useState(false);

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
  // ? <- Fin crear info cliente

  // * <-------------------------------------------------------------------------------->

  // ? -> Inicio editar info cliente
  const [popUpEditarInfo, setPopUpEditarInfo] = useState(false);

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

  const handleEditarRegistro = async () => {
    const success = await editarRegistro(setIsLoading);
    if (success) {
      setPopUpEditarInfo(false);
    }
  };
  // ? <- Fin editar info cliente

  // * <-------------------------------------------------------------------------------->

  // ? -> Inicio eliminar informacion cliente
  const { eliminarInformacion } = useInfoUsuarioService();
  const eliminarInformacionCliente = async (info) => {
    const result = await Swal.fire({
      title: `¿Estás seguro de eliminar el registro °${info.info_id}?`,
      text: "Esta acción es irreversible",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, Eliminar",
      cancelButtonText: "Cancelar",
      ...swalStyles,
    });

    if (result.isConfirmed) {
      // Crear objeto con solo las propiedades necesarias
      const infoEliminar = {
        info_id: info.info_id,
        usuario_id: info.usuario_id,
      };

      setIsLoading(true);
      const response = await eliminarInformacion(infoEliminar);
      if (response.success) {
        setIsLoading(false);
        toast.success(`Información °${info.info_id} eliminada`);
        cargarInformacion();
      } else {
        setIsLoading(false);
        toast.error(response.error);
      }
    }
  };
  // ? <- Fin eliminar informacion cliente

  // * <-------------------------------------------------------------------------------->

  // ? -> Inicio editar datos minimos
  useEffect(() => {
    inicializarDraft(popUpEditarDatosMinimos);
  }, [popUpEditarDatosMinimos]);
  // ? <- Fin editar datos minimos

  // * <-------------------------------------------------------------------------------->

  // ? -> Inicio logout/acciones
  // Cerrar sesion
  const cerrarSesion = async () => {
    const result = await Swal.fire({
      title: "¿Estás seguro de cerrar sesión?",
      text: "Tendrás que iniciar sesión nuevamente",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, Salir",
      cancelButtonText: "No, Volver",
      ...swalStyles,
    });

    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        await logout();
      } catch (error) {
        console.error("Error en logout:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  // ? <- Fin logout/acciones

  return (
    <>
      {/* Loader */}
      {isLoading && <Spinner />}

      {/* Nav */}
      <Nav>
        <button
          onClick={() => {
            obtenerClientes();
            setPopUpUsuarios(true);
          }}
          className="btn-nav btn-nav-primary"
          title="Gestión de usuarios"
        >
          <img src={imgUsuario} alt="" />
        </button>
        <Select
          styles={selectNavStyles}
          options={opcionesClientes}
          onChange={seleccionBusqueda}
          onMenuOpen={() => obtenerClientes()}
          value={clienteSeleccionado}
          isSearchable={false}
          placeholder="Seleccione un cliente..."
        />
        <span>o</span>
        <div className="cont-inpNav">
          <input
            type="text"
            placeholder="Busque por cliente..."
            onInput={(e) => buscarCliente(e)}
            ref={refBusquedaCliente}
          />
          <img src={imgSearch} alt="" />
          {resultadosBusquedaClientes.length > 0 && (
            <div>
              {resultadosBusquedaClientes.map((c) => (
                <button key={c.value} onClick={() => seleccionBusqueda(c)}>
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={limpiarClienteSeleccionado}
          className={`btn-nav btn-nav-secondary ${
            clienteSeleccionado === null ? "btn-disabled" : ""
          }`}
          title="Restablecer cliente seleccionado"
          disabled={clienteSeleccionado === null}
        >
          <img src={imgLimpiar} alt="" />
        </button>
        <button
          className={`btn-nav btn-nav-success ${
            clienteSeleccionado === null ? "btn-disabled" : ""
          }`}
          title="Crear registro"
          disabled={clienteSeleccionado === null}
          onClick={async () => {
            await obtenerDatosMin(setIsLoading, setDraftCrear);
            setPopUpCrearInfo(true);
          }}
        >
          <img src={imgCrearRegistro} alt="" />
        </button>
        <SearchNav
          refDato={refDato}
          onInputDato={filtroInformacion}
          refDetalle={refDetalle}
          onInputDetalle={filtroInformacion}
          clearDato={() => {
            refDato.current.value = "";
            filtroInformacion();
          }}
          clearDetalle={() => {
            refDetalle.current.value = "";
            filtroInformacion();
          }}
          isDatoValue={isDatoValue}
          isDetalleValue={isDetalleValue}
        />
        <button
          onClick={() => exportarComoPDF()}
          className="btn-nav btn-nav-danger"
          title="Exportar a pdf"
        >
          <img src={imgPdf} alt="" />
        </button>
        <button
          onClick={() => exportarComoExcell()}
          className="btn-nav btn-nav-success"
          title="Exportar a excel"
        >
          <img src={imgExcell} alt="" />
        </button>
        <div className="cont-cant-resultados">
          <span>{whichInfo.length} Resultados</span>
          <label
            className="checkbox-moderno"
            aria-label="Mostrar licenamiento proximo a vencer"
            title="Mostrar licenamiento proximo a vencer"
          >
            <input
              type="checkbox"
              checked={filtrarPorFecha}
              onChange={(e) => {
                const nuevoValor = e.target.checked;
                setFiltrarPorFecha(nuevoValor);
                filtroInformacion(nuevoValor);
              }}
            />
            <span className="checkbox-slider"></span>
          </label>
        </div>
        <button
          onClick={cerrarSesion}
          className="btn-nav btn-nav-danger"
          title="Cerrar sesión"
        >
          <img src={imgSalir} alt="" />
        </button>
      </Nav>
      <SepHrz />

      {/* Contenido principal */}
      <section>
        <ContenidoPrincipal
          isInfoCargando={isInfoCargando}
          whichInfo={whichInfo}
          terminosBusqueda={terminosBusqueda}
          onEditarInfo={(info) => {
            handleEditarInfo(info);
            setPopUpEditarInfo(true);
          }}
          onEliminarInfo={eliminarInformacionCliente}
        />
      </section>

      {/* PopUp usuarios */}
      <PopupUsuarios
        open={popUpUsuarios}
        onClose={() => {
          setPopUpUsuarios(false);
          setUsuarioSeleccionado(null);
          obtenerClientes();
        }}
        user={user}
        opcionesClientesTabla={opcionesClientesTabla}
        buscarClienteTabla={buscarClienteTabla}
        onCrearCliente={() => setPopUpCrearCliente(true)}
        onEditarContrasena={(usuario) => {
          setPopUpEditarContrasena(true);
          setUsuarioSeleccionado(usuario);
        }}
        onEliminarCliente={eliminarCliente}
      />

      {/* PopUp crear cliente */}
      <PopupCrearCliente
        open={popUpCrearCliente}
        onClose={() => {
          setPopUpCrearCliente(false);
          resetCrear();
        }}
        registerCrear={registerCrear}
        handleSubmitCrear={handleSubmitCrear}
        errorsCrear={errorsCrear}
        isSubmittingCrear={isSubmittingCrear}
        verPassword={verPassword}
        setVerPassword={setVerPassword}
        verPassword2={verPassword2}
        setVerPassword2={setVerPassword2}
        onSubmit={crearCliente}
      />

      {/* PopUp editar contraseña */}
      <PopupEditarContrasena
        open={popUpEditarContrasena}
        onClose={() => {
          setPopUpEditarContrasena(false);
          setUsuarioSeleccionado(null);
          resetCambiar();
        }}
        registerCambiar={registerCambiar}
        handleSubmitCambiar={handleSubmitCambiar}
        errorsCambiar={errorsCambiar}
        isSubmittingCambiar={isSubmittingCambiar}
        verPassword={verPassword}
        setVerPassword={setVerPassword}
        verPassword2={verPassword2}
        setVerPassword2={setVerPassword2}
        usuarioSeleccionado={usuarioSeleccionado}
        onSubmit={editarContraseña}
      />

      {/* PopUp crear informacion */}
      <PopupCrearInfo
        open={popUpCrearInfo}
        onClose={() => {
          setPopUpCrearInfo(false);
          setDraftCrear([]);
        }}
        clienteSeleccionado={clienteSeleccionado}
        opcionesClientes={opcionesClientes}
        draftCrear={draftCrear}
        datosMinimos={datosMinimos}
        cambiarLlaveCrear={cambiarLlaveCrear}
        cambiarValorCrear={cambiarValorCrear}
        eliminarDatoCrear={eliminarDatoCrear}
        agregarDatoCrear={agregarDatoCrear}
        scrollCrearRef={scrollCrearRef}
        inputCrearRef={inputCrearRef}
        onSubirCSV={handleSubirCSV}
        refInputFile={refInputFile}
        onEditarDatosMinimos={() => setPopUpEditarDatosMinimos(true)}
        onCreate={handleCrearRegistro}
      />

      {/* PopUp editar informacion */}
      <PopupEditarInfo
        open={popUpEditarInfo}
        onClose={() => {
          setPopUpEditarInfo(false);
          setInfoSeleccionada(null);
          setInfoAEditar(null);
        }}
        infoAEditar={infoAEditar}
        opcionesClientes={opcionesClientes}
        draftDatos={draftDatos}
        cambiarLlaveDraft={cambiarLlaveDraft}
        cambiarValorDraft={cambiarValorDraft}
        eliminarDatoDraft={eliminarDatoDraft}
        agregarDatoDraft={agregarDatoDraft}
        scrollRef={scrollRef}
        inputRef={inputRef}
        onSave={handleEditarRegistro}
      />

      {/* PopUp editar datos minimos */}
      <PopupEditarDatosMinimos
        open={popUpEditarDatosMinimos}
        onClose={async () => {
          setPopUpEditarDatosMinimos(false);
          setDraftDatosMinimos([]);
        }}
        draftDatosMinimos={draftDatosMinimos}
        cambiarDatoMinimo={cambiarDatoMinimo}
        eliminarDatoMinimo={eliminarDatoMinimo}
        agregarDatoMinimo={agregarDatoMinimo}
        scrollDatosMinimosRef={scrollDatosMinimosRef}
        inputDatosMinimosRef={inputDatosMinimosRef}
        onSave={async () => {
          const success = await guardarDatosMinimos(
            setIsLoading,
            obtenerDatosMin,
            setDraftCrear
          );
          if (success) {
            setPopUpEditarDatosMinimos(false);
          }
        }}
      />
    </>
  );
}
