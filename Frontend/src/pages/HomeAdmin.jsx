// Estilos
import "../css/home.css";
import "../css/swalStyles.css";
import selectNavStyles from "../css/selectNavStyles.js";
import swalStyles from "../css/swalStyles.js";

// Hooks
import { useAuth } from "../context/AuthContext";

// Servicios
import { useUsuarioService } from "../services/usuarioService.js";
import { useInfoUsuarioService } from "../services/infoUsuarioServices.js";

// Librerias
import { useRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Popup from "reactjs-popup";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

// Eschemas
import {
  schemaCrearUsuario,
  schemaCambiarContraseña,
} from "../validations/eschemas";

// Utils
import { exportarPDF } from "../utils/pdfUtils.js";
import { exportarExcel } from "../utils/excellUtils.js";
import { resaltarTexto } from "../utils/textUtils.jsx";

// Componentes
import Nav from "../components/Nav.jsx";
import SepHrz from "../components/SepHrz.jsx";
import Select from "react-select";
import SearchNav from "../components/SearchNav.jsx";
import CardAdmin from "../components/CardAdmin.jsx";
import CardUsuario from "../components/CardUsuario.jsx";
import Spinner from "../components/Spinner.jsx";

// Imagenes
import imgCrearCliente from "../assets/img/añadir.webp";
import imgSalir from "../assets/img/salir.webp";
import imgUsuario from "../assets/img/usuario.webp";
import imgVisibility from "../assets/img/ojo.webp";
import imgLimpiar from "../assets/img/reset.webp";
import imgSearch from "../assets/img/busqueda.webp";
import imgCandado from "../assets/img/candado.webp";
import imgBorrar from "../assets/img/basura.webp";
import imgEditar from "../assets/img/editar.webp";
import imgAgregarFila from "../assets/img/agregarFila.webp";
import imgCrearRegistro from "../assets/img/flecha.webp";
import imgExcell from "../assets/img/excell.webp";
import imgPdf from "../assets/img/pdf.webp";
import imgVacio from "../assets/img/vacio.webp";

export default function HomeAdmin() {
  // Todo Funciones Nav

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
  // Estado del cliente actualmente seleccionado
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Usuario actual
  const { user } = useAuth();

  // Terminsmo de busqueda dato/detalle
  const [terminosBusqueda, setTerminosBusqueda] = useState({
    dato: "",
    detalle: "",
  });

  // Exportar como PDF
  const exportarComoPDF = async () => {
    setIsLoading(true);
    await exportarPDF(whichInfo, opcionesClientes);
    setIsLoading(false);
  };
  // Exportar como excell
  const exportarComoExcell = async () => {
    setIsLoading(true);
    await exportarExcel(whichInfo, opcionesClientes);
    setIsLoading(false);
  };

  const [isLoading, setIsLoading] = useState(false);

  const [isInfoCargando, setIsInfoCargando] = useState(true);
  // ? <- Fin utils

  // * <-------------------------------------------------------------------------------->

  // ? Inicio traer clientes/acciones ->
  // traer clientes
  const [clientes, setClientes] = useState([]);
  const [opcionesClientes, setOpcionesClientes] = useState([]);
  const { obtenerUsuarios } = useUsuarioService();
  const obtenerClientes = async () => {
    const response = await obtenerUsuarios();
    setClientes(response.data.data);
    setOpcionesClientes(
      response.data.data
        .filter((c) => c.verificado === 1)
        .map((c) => ({
          value: c.id,
          label: c.nombre,
        }))
    );
    setOpcionesClientesTabla(response.data.data);
  };

  useEffect(() => {
    obtenerClientes();
  }, []);

  // Buscar clientes nav
  const [resultadosBusquedaClientes, setResultadosBusquedaClientes] = useState(
    []
  );
  const buscarCliente = async (e) => {
    if (e.target.value === "") {
      setResultadosBusquedaClientes([]);
      return;
    }
    const resultados = opcionesClientes.filter((o) =>
      o.label.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setResultadosBusquedaClientes(resultados);
  };

  // Buscar clientes tabla usuarios
  const [opcionesClientesTabla, setOpcionesClientesTabla] = useState([]);
  const buscarClienteTabla = async (e) => {
    const valor = e.target.value.toLowerCase();

    if (valor === "") {
      setOpcionesClientesTabla(clientes);
      return;
    }

    const resultados = clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(valor) ||
        c.email.toLowerCase().includes(valor)
    );

    setOpcionesClientesTabla(resultados);
  };

  // Accion al selecionar un cliente en select o busqueda
  const refBusquedaCliente = useRef();
  const seleccionBusqueda = (cliente) => {
    if (clienteSeleccionado === cliente) {
      refBusquedaCliente.current.value = "";
      setResultadosBusquedaClientes([]);
      return;
    }
    refBusquedaCliente.current.value = "";
    setResultadosBusquedaClientes([]);
    setClienteSeleccionado(cliente);
  };
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
    const response = await actualizarUsuario(
      usuarioSeleccionado.id,
      data.password
    );
    if (response.success) {
      toast.success("Contraseña cambiada con éxito");
      setUsuarioSeleccionado(null);
      setPopUpEditarContrasena(false);
    } else {
      toast.error(response.error);
      return;
    }
  };
  // ? <- Fin editar cliente/acciones

  // * <-------------------------------------------------------------------------------->

  // ? -> Inicio eliminar cliente/acciones
  const { eliminarUsuario } = useUsuarioService();
  const eliminarCliente = async (cliente) => {
    // Mostramos el confirmador
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
      // Si el usuario confirma, eliminamos el cliente
      const response = await eliminarUsuario(cliente.id);

      if (response.success) {
        toast.success(`Cliente ${cliente.nombre} eliminado`);
        obtenerClientes();
        cargarInformacion();
        if (clienteSeleccionado?.id === cliente.id) {
          setClienteSeleccionado(null);
        }
      } else {
        toast.error(response.error || "No se pudo eliminar el cliente");
      }
    }
  };
  // ? <- Fin eliminar cliente/acciones

  // Todo Funciones section

  // ? -> Inicio ver info cliente
  const { obtenerInformacion } = useInfoUsuarioService();
  const [whichInfo, setWhichInfo] = useState([]);
  const refInformacion = useRef(null);
  const cargarInformacion = async () => {
    setIsInfoCargando(true);
    const response = await obtenerInformacion(clienteSeleccionado?.value);
    refInformacion.current = response.data.data;
    filtroInformacion();
  };

  useEffect(() => {
    cargarInformacion();
  }, [clienteSeleccionado]);

  // Filtrador de informacion
  const refDato = useRef();
  const refDetalle = useRef();
  const [isDatoValue, setIsDatoValue] = useState(false);
  const [isDetalleValue, setIsDetalleValue] = useState(false);
  const filtroInformacion = () => {
    const dato = refDato.current.value.trim().toLowerCase();
    const detalle = refDetalle.current.value.trim().toLowerCase();

    setTerminosBusqueda({ dato, detalle });

    // Si no hay filtros, retorna todo
    if (!dato && !detalle) {
      setWhichInfo(refInformacion.current);
      setIsInfoCargando(false);
      setIsDatoValue(false);
      setIsDetalleValue(false);
      return;
    }

    if (dato) {
      setIsDatoValue(true);
    } else {
      setIsDatoValue(false);
    }

    if (detalle) {
      setIsDetalleValue(true);
    } else {
      setIsDetalleValue(false);
    }

    const filtrados = refInformacion.current.filter((info) => {
      const dataObj = info.datos[0] || {};
      const keys = Object.keys(dataObj);

      return keys.some((k) => {
        const keyLower = k.toLowerCase();
        const valueLower = String(dataObj[k]).toLowerCase();

        const matchDato = dato ? keyLower.includes(dato) : true;
        const matchDetalle = detalle ? valueLower.includes(detalle) : true;

        return matchDato && matchDetalle;
      });
    });

    setWhichInfo(filtrados);
    setIsInfoCargando(false);
  };
  // ? <- Fin ver info cliente

  // * <-------------------------------------------------------------------------------->

  // ? -> Inicio crear info cliente
  const [popUpCrearInfo, setPopUpCrearInfo] = useState(false);
  const [draftCrear, setDraftCrear] = useState([]);

  const { crearInformacion } = useInfoUsuarioService();

  // Cambiar clave
  const cambiarLlaveCrear = (index, newKey) => {
    const copy = [...draftCrear];
    copy[index].key = newKey;
    setDraftCrear(copy);
  };

  // Cambiar valor
  const cambiarValorCrear = (index, newValue) => {
    const copy = [...draftCrear];
    copy[index].value = newValue;
    setDraftCrear(copy);
  };

  // Eliminar par
  const eliminarDatoCrear = (index) => {
    if (draftCrear.length > 1) {
      const copy = [...draftCrear];
      copy.splice(index, 1);
      setDraftCrear(copy);
    }
  };

  // Agregar par nuevo
  const scrollCrearRef = useRef(null);
  const inputCrearRef = useRef(null);
  const agregarDatoCrear = () => {
    setDraftCrear([...draftCrear, { key: "", value: "" }]);

    requestAnimationFrame(() => {
      if (scrollCrearRef.current) {
        scrollCrearRef.current.scrollTo({
          top: scrollCrearRef.current.scrollHeight,
          behavior: "smooth",
        });
      }

      setTimeout(() => {
        if (inputCrearRef.current) {
          inputCrearRef.current.focus();
        }
      }, 250);
    });
  };

  // Guardar nueva información
  const crearRegistro = async () => {
    const noEmojisRegex = /^[^\p{Extended_Pictographic}]*$/u;

    // Limpiar campos vacíos
    const cleanedDraft = draftCrear.filter(
      (d) => d.key.trim() !== "" || d.value.trim() !== ""
    );

    // Validaciones
    const emptyKey = cleanedDraft.find(
      (d) => d.key.trim() === "" && d.value.trim() !== ""
    );
    if (emptyKey) {
      toast.error(`El detalle "${emptyKey.value}" no tiene dato`);
      return;
    }

    const emptyValue = cleanedDraft.find(
      (d) => d.value.trim() === "" && d.key.trim() !== ""
    );
    if (emptyValue) {
      toast.error(`El dato "${emptyValue.key}" no tiene detalle`);
      return;
    }

    // Verificar mínimo 1 par válido
    if (cleanedDraft.length === 0) {
      toast.error("Ingresa por lo menos un dato válido");
      return;
    }

    // Validar que no haya emojis
    for (const { key, value } of cleanedDraft) {
      if (!noEmojisRegex.test(key.trim())) {
        toast.error(`El dato "${key}" contiene emojis, no es valido`);
        return;
      }
      if (!noEmojisRegex.test(value.trim())) {
        toast.error(`El detalle "${value}" contiene emojis, no es valido`);
        return;
      }
    }

    const keys = cleanedDraft.map((d) => d.key.trim());
    const lowerKeys = keys.map((k) => k.toLowerCase());
    const seen = new Map();
    for (let i = 0; i < lowerKeys.length; i++) {
      if (seen.has(lowerKeys[i])) {
        toast.error(`El dato "${keys[i]}" ya existe`);
        return;
      }
      seen.set(lowerKeys[i], true);
    }

    // Convertir a objeto
    const obj = cleanedDraft.reduce((acc, { key, value }) => {
      acc[key.trim()] = value.trim();
      return acc;
    }, {});

    // Crear payload
    const nuevaInfo = {
      usuario_id: clienteSeleccionado.value,
      datos: obj,
    };

    setIsLoading(true);
    const response = await crearInformacion(nuevaInfo);

    if (response.success) {
      toast.success(`Registro creado con éxito`);
      cargarInformacion();
      setPopUpCrearInfo(false);
      setIsLoading(false);
    } else {
      toast.error(response.error);
      setIsLoading(false);
    }
  };
  // ? <- Fin crear info cliente

  // * <-------------------------------------------------------------------------------->

  // ? -> Inicio editar info cliente
  const [popUpEditarInfo, setPopUpEditarInfo] = useState(false);
  const [infoSeleccionada, setInfoSeleccionada] = useState(null);
  const [infoAEditar, setInfoAEditar] = useState(null);
  const [draftDatos, setDraftDatos] = useState([]);

  useEffect(() => {
    if (infoAEditar) {
      // Pasamos los datos de objeto -> array de pares clave/valor
      const entries = Object.entries(infoAEditar.datos[0]).map(([k, v]) => ({
        key: k,
        value: v,
      }));
      setDraftDatos(entries);
    }
  }, [infoAEditar]);

  // Cambiar clave
  const cambiarLlaveDraft = (index, newKey) => {
    const copy = [...draftDatos];
    copy[index].key = newKey;
    setDraftDatos(copy);
  };

  // Cambiar valor
  const cambiarValorDraft = (index, newValue) => {
    const copy = [...draftDatos];
    copy[index].value = newValue;
    setDraftDatos(copy);
  };

  // Eliminar par
  const eliminarDatoDraft = (index) => {
    const copy = [...draftDatos];
    copy.splice(index, 1);
    setDraftDatos(copy);
  };

  // Agregar par nuevo
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const agregarDatoDraft = () => {
    setDraftDatos([...draftDatos, { key: "", value: "" }]);

    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 250);
    });
  };

  // Guardar cambios
  const { actualizarInformacion } = useInfoUsuarioService();
  const editarRegistro = async () => {
    const noEmojisRegex = /^[^\p{Extended_Pictographic}]*$/u;

    // 🔹 Limpiar campos vacíos totalmente {"": ""}
    const cleanedDraft = draftDatos.filter(
      (d) => d.key.trim() !== "" || d.value.trim() !== ""
    );

    // 🔹 Validar claves vacías
    const emptyKey = cleanedDraft.find(
      (d) => d.key.trim() === "" && d.value.trim() !== ""
    );
    if (emptyKey) {
      toast.error(`El detalle "${emptyKey.value}" no tiene dato`);
      return;
    }

    // 🔹 Validar valores vacíos
    const emptyValue = cleanedDraft.find(
      (d) => d.value.trim() === "" && d.key.trim() !== ""
    );
    if (emptyValue) {
      toast.error(`El dato "${emptyValue.key}" no tiene detalle`);
      return;
    }

    // 🔹 Validar que no haya emojis en keys ni values
    for (const { key, value } of cleanedDraft) {
      if (!noEmojisRegex.test(key.trim())) {
        toast.error(`El dato "${key}" contiene emojis, no es valido`);
        return;
      }
      if (!noEmojisRegex.test(value.trim())) {
        toast.error(`El detalle "${value}" contiene emojis, no es valido`);
        return;
      }
    }

    // 🔹 Validar duplicados (ignorando mayúsculas/minúsculas)
    const keys = cleanedDraft.map((d) => d.key.trim());
    const lowerKeys = keys.map((k) => k.toLowerCase());
    const seen = new Map();
    for (let i = 0; i < lowerKeys.length; i++) {
      const k = lowerKeys[i];
      if (seen.has(k)) {
        toast.error(`El dato "${keys[i]}" ya existe`);
        return;
      }
      seen.set(k, true);
    }

    // 🔹 Convertir a objeto limpio
    const obj = cleanedDraft.reduce((acc, { key, value }) => {
      acc[key.trim()] = value.trim();
      return acc;
    }, {});

    // 🔹 Crear info actualizada
    const infoActualizada = { ...infoAEditar, datos: obj };

    // 🔹 Normalizar datos de infoSeleccionada para comparación
    const datosSeleccionados = Array.isArray(infoSeleccionada.datos)
      ? infoSeleccionada.datos[0] // asumimos un solo objeto
      : infoSeleccionada.datos;

    const infoSeleccionadaNormalized = {
      ...infoSeleccionada,
      datos: datosSeleccionados,
    };

    // 🔹 Si no hay cambios no hace nada
    if (
      JSON.stringify(infoSeleccionadaNormalized) ===
      JSON.stringify(infoActualizada)
    ) {
      setPopUpEditarInfo(false);
      return;
    }

    // 🔹 Enviar actualización
    setIsLoading(true);
    const response = await actualizarInformacion(infoActualizada);
    if (response.success) {
      toast.success(`Registro °${infoActualizada.info_id} actualizado`);
      cargarInformacion();
      setPopUpEditarInfo(false);
      setIsLoading(false);
    } else {
      toast.error(response.error);
      setIsLoading(false);
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

      const response = await eliminarInformacion(infoEliminar);
      if (response.success) {
        toast.success(`Información °${info.info_id} eliminada`);
        cargarInformacion();
      } else {
        toast.error(response.error);
      }
    }
  };
  // ? <- Fin eliminar informacion cliente

  // * <-------------------------------------------------------------------------------->

  // ? -> Inicio logout/acciones
  // Cerrar sesion
  const { logout } = useAuth();
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
          className="btn-nav"
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
          onClick={() => {
            setClienteSeleccionado(null);
            refBusquedaCliente.current.value = "";
            setResultadosBusquedaClientes([]);
            toast.success("Cliente restablecido");
          }}
          className={`btn-nav ${!clienteSeleccionado ? "btn-disabled" : ""}`}
          title="Restablecer cliente seleccionado"
          disabled={!clienteSeleccionado}
        >
          <img src={imgLimpiar} alt="" />
        </button>
        <button
          className={`btn-nav ${!clienteSeleccionado ? "btn-disabled" : ""}`}
          title="Crear registro"
          disabled={!clienteSeleccionado}
          onClick={() => {
            setDraftCrear([
              { key: "Hostname", value: "" },
              { key: "Plataforma", value: "" },
              { key: "Marca/Modelo", value: "" },
              { key: "Tipo", value: "" },
              { key: "Firmware/Versión S.O", value: "" },
              { key: "Ubicación", value: "" },
              { key: "Licenciamiento", value: "" },
            ]);

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
          className="btn-nav"
          title="Exportar a pdf"
        >
          <img src={imgPdf} alt="" />
        </button>
        <button
          onClick={() => exportarComoExcell()}
          className="btn-nav"
          title="Exportar a excel"
        >
          <img src={imgExcell} alt="" />
        </button>
        <div className="cont-cant-resultados">
          <span>{whichInfo.length} Resultados</span>
        </div>
        <button
          onClick={cerrarSesion}
          className="btn-nav"
          title="Cerrar sesión"
        >
          <img src={imgSalir} alt="" />
        </button>
      </Nav>
      <SepHrz />

      {/* Contenido principal */}
      <section>
        {whichInfo.length === 0 && !isInfoCargando ? (
          <div className="cont-sin-resultados">
            <img src={imgVacio} alt="" />
            <span>No se encontraron resultados</span>
          </div>
        ) : (
          [0, 1].map((col) => (
            <div key={col}>
              {isInfoCargando
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div className="item skeleton" key={i}>
                      <div className="skeleton-header"></div>
                      <div className="skeleton-divColumns">
                        <div className="skeleton-body">
                          <div className="skeleton-line one-4"></div>
                          <div className="skeleton-line three-4"></div>
                          <div className="skeleton-line two-4"></div>
                          <div className="skeleton-line four-4"></div>
                          <div className="skeleton-line three-4"></div>
                          <div className="skeleton-line two-4"></div>
                          <div className="skeleton-line four-4"></div>
                        </div>
                        <div className="skeleton-body">
                          <div className="skeleton-line four-4"></div>
                          <div className="skeleton-line one-4"></div>
                          <div className="skeleton-line three-4"></div>
                          <div className="skeleton-line two-4"></div>
                          <div className="skeleton-line four-4"></div>
                          <div className="skeleton-line two-4"></div>
                          <div className="skeleton-line three-4"></div>
                        </div>
                      </div>
                    </div>
                  ))
                : whichInfo.map((info, index) =>
                    index % 2 === col ? (
                      <div className="item" key={info.info_id}>
                        <h3>
                          <button
                            onClick={() => {
                              setInfoSeleccionada(info);
                              setInfoAEditar({
                                ...info,
                                datos: info.datos.map((dato) => ({ ...dato })),
                              });
                              setPopUpEditarInfo(true);
                            }}
                          >
                            <img src={imgEditar} alt="" />
                          </button>
                          {`${info.usuario_nombre} - Registro °${info.info_id}`}
                          <button
                            onClick={() => eliminarInformacionCliente(info)}
                          >
                            <img src={imgBorrar} alt="" />
                          </button>
                        </h3>

                        {info.datos.map((dato, i) => {
                          const entries = Object.entries(dato);
                          const mitad = Math.ceil(entries.length / 2);
                          const colIzq = entries.slice(0, mitad);
                          const colDer = entries.slice(mitad);

                          return (
                            <div className="cont-dato" key={i}>
                              <div className="columna">
                                {colIzq.map(([key, value]) => (
                                  <p key={key}>
                                    <strong>
                                      {resaltarTexto(
                                        key,
                                        terminosBusqueda.dato,
                                        true
                                      )}
                                      :
                                    </strong>{" "}
                                    {resaltarTexto(
                                      value,
                                      terminosBusqueda.detalle,
                                      false
                                    )}
                                  </p>
                                ))}
                              </div>
                              <div className="columna">
                                {colDer.map(([key, value]) => (
                                  <p key={key}>
                                    <strong>
                                      {resaltarTexto(
                                        key,
                                        terminosBusqueda.dato,
                                        true
                                      )}
                                      :
                                    </strong>{" "}
                                    {resaltarTexto(
                                      value,
                                      terminosBusqueda.detalle,
                                      false
                                    )}
                                  </p>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null
                  )}
            </div>
          ))
        )}
      </section>

      {/* PopUp usuarios */}
      <Popup
        open={popUpUsuarios}
        onClose={() => {
          setPopUpUsuarios(false);
          setUsuarioSeleccionado(null);
          obtenerClientes();
        }}
        modal
        nested
      >
        <div className="cont-popUp">
          <h2>Gestión de usuarios</h2>
          <CardAdmin
            nameAdmin={user.nombre}
            rolAdmin={user.rol}
            onClick={() => {
              setPopUpEditarContrasena(true);
              setUsuarioSeleccionado(user);
            }}
          />
          <div className="cont-tb-usuarios">
            <div className="cont-search-new">
              <label className="cont-searcher">
                <input
                  type="text"
                  placeholder="Buscar usuario/cliente..."
                  onInput={buscarClienteTabla}
                />
                <img src={imgSearch} alt="" />
              </label>
              <button
                className="newUsuario"
                title="Crear usuario"
                onClick={() => setPopUpCrearCliente(true)}
              >
                <img src={imgCrearCliente} alt="" />
              </button>
            </div>
            <div className="tb-overflow-scroll-hiden">
              <div className="tb-usuarios">
                {opcionesClientesTabla.map((cliente) => (
                  <CardUsuario
                    key={cliente.id}
                    nameUsuario={cliente.nombre}
                    correoUsuario={cliente.email}
                    estado={cliente.verificado ? "" : "(No verificado)"}
                    onClick1={() => {
                      setPopUpEditarContrasena(true);
                      setUsuarioSeleccionado(cliente);
                    }}
                    onClick2={() => eliminarCliente(cliente)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Popup>

      {/* PopUp crear cliente */}
      <Popup
        open={popUpCrearCliente}
        onClose={() => {
          setPopUpCrearCliente(false);
          resetCrear();
        }}
        modal
        nested
      >
        <div className="cont-popUp">
          <h2>Crear cliente</h2>
          <form onSubmit={handleSubmitCrear(crearCliente)}>
            {/* Nombre */}
            <div className="cont-label">
              <label>Nombre de usuario:</label>
              {errorsCrear.nombre && <span>{errorsCrear.nombre.message}</span>}
            </div>
            <input
              type="text"
              {...registerCrear("nombre")}
              placeholder="alpina"
            />

            {/* Email */}
            <div className="cont-label">
              <label>Correo:</label>
              {errorsCrear.email && <span>{errorsCrear.email.message}</span>}
            </div>
            <input
              type="text"
              {...registerCrear("email")}
              placeholder="alpina@example.com"
            />

            {/* Password */}
            <div className="cont-label">
              <label>Contraseña:</label>
              {errorsCrear.password && (
                <span>{errorsCrear.password.message}</span>
              )}
            </div>
            <div className="cont-pass">
              <input
                type={verPassword}
                {...registerCrear("password")}
                placeholder="∗∗∗∗∗∗∗∗∗∗"
              />
              <button
                type="button"
                onMouseDown={() => setVerPassword("text")}
                onMouseUp={() => setVerPassword("password")}
                onMouseLeave={() => setVerPassword("password")}
              >
                <img src={imgVisibility} alt="" />
              </button>
            </div>

            {/* Password2 */}
            <div className="cont-label">
              <label>Confirmar contraseña:</label>
              {errorsCrear.password2 && (
                <span>{errorsCrear.password2.message}</span>
              )}
            </div>
            <div className="cont-pass">
              <input
                type={verPassword2}
                {...registerCrear("password2")}
                placeholder="∗∗∗∗∗∗∗∗∗∗"
              />
              <button
                type="button"
                onMouseDown={() => setVerPassword2("text")}
                onMouseUp={() => setVerPassword2("password")}
                onMouseLeave={() => setVerPassword2("password")}
              >
                <img src={imgVisibility} alt="" />
              </button>
            </div>
            <SepHrz />
            <button
              type="submit"
              disabled={isSubmittingCrear}
              title="Crear cliente"
            >
              <img src={imgCrearCliente} alt="" />
              Crear
              {isSubmittingCrear ? <Spinner /> : "Crear"}
            </button>
          </form>
        </div>
      </Popup>

      {/* PopUp editar contraseña */}
      <Popup
        open={popUpEditarContrasena}
        onClose={() => {
          setPopUpEditarContrasena(false);
          setUsuarioSeleccionado(null);
          resetCambiar();
        }}
        modal
        nested
      >
        <div className="cont-popUp">
          <h2>
            Cambio de contraseña
            <br />
            {usuarioSeleccionado?.nombre}
          </h2>
          <form onSubmit={handleSubmitCambiar(editarContraseña)}>
            {/* Password 1*/}
            <div className="cont-label">
              <label>Contraseña:</label>
              {errorsCambiar.password && (
                <span>{errorsCambiar.password.message}</span>
              )}
            </div>
            <div className="cont-pass">
              <input
                type={verPassword}
                {...registerCambiar("password")}
                placeholder="∗∗∗∗∗∗∗∗∗∗"
              />
              <button
                type="button"
                onMouseDown={() => setVerPassword("text")}
                onMouseUp={() => setVerPassword("password")}
                onMouseLeave={() => setVerPassword("password")}
              >
                <img src={imgVisibility} alt="" />
              </button>
            </div>

            {/* Password 2*/}
            <div className="cont-label">
              <label>Confirmar contraseña:</label>
              {errorsCambiar.password2 && (
                <span>{errorsCambiar.password2.message}</span>
              )}
            </div>
            <div className="cont-pass">
              <input
                type={verPassword2}
                {...registerCambiar("password2")}
                placeholder="∗∗∗∗∗∗∗∗∗∗"
              />
              <button
                type="button"
                onMouseDown={() => setVerPassword2("text")}
                onMouseUp={() => setVerPassword2("password")}
                onMouseLeave={() => setVerPassword2("password")}
              >
                <img src={imgVisibility} alt="" />
              </button>
            </div>
            <div className="sep-hrz"></div>
            <button
              className="btn-cambio-contraseña"
              type="submit"
              disabled={isSubmittingCambiar}
              title="Cambiar contraseña"
            >
              <img src={imgCandado} alt="" />
              {isSubmittingCambiar ? "Cambiando..." : "Cambiar"}
            </button>
          </form>
        </div>
      </Popup>

      {/* PopUp crear informacion */}
      <Popup
        open={popUpCrearInfo}
        onClose={() => {
          setPopUpCrearInfo(false);
          setDraftCrear([]);
        }}
        modal
        nested
      >
        <div className="cont-popUp-editarInfo">
          <h2>
            {`${
              opcionesClientes.find(
                (c) => c.value === clienteSeleccionado?.value
              )?.label
            } - Nuevo registro`}
          </h2>

          <div ref={scrollCrearRef}>
            {draftCrear.map(({ key, value }, i, array) => {
              const esObligatorio = i < 7;

              return (
                <div key={i} className="cont-dato-editar">
                  {esObligatorio ? (
                    <span>{key}</span>
                  ) : (
                    <input
                      type="text"
                      placeholder="Dato..."
                      value={key}
                      onChange={(e) => cambiarLlaveCrear(i, e.target.value)}
                      ref={i === array.length - 1 ? inputCrearRef : null}
                    />
                  )}

                  <input
                    type="text"
                    placeholder="Detalle..."
                    value={value}
                    onChange={(e) => cambiarValorCrear(i, e.target.value)}
                    className={esObligatorio ? "input-obligatorio" : ""}
                  />

                  {!esObligatorio && (
                    <button
                      type="button"
                      onClick={() => eliminarDatoCrear(i)}
                      title="Eliminar campo"
                    >
                      <img src={imgBorrar} alt="Eliminar" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="sep-hrz"></div>
          <div className="cont-btns">
            <button
              type="button"
              onClick={agregarDatoCrear}
              title="Agregar campo"
            >
              <img src={imgAgregarFila} alt="" />
              Agregar campo
            </button>
            <button
              type="button"
              className="btn-crear"
              onClick={crearRegistro}
              title="Crear registro"
            >
              <img src={imgCrearRegistro} alt="" />
              Crear
            </button>
          </div>
        </div>
      </Popup>

      {/* PopUp editar informacion */}
      <Popup
        open={popUpEditarInfo}
        onClose={() => {
          setPopUpEditarInfo(false);
          setInfoSeleccionada(null);
          setInfoAEditar(null);
        }}
        modal
        nested
      >
        <div className="cont-popUp-editarInfo">
          <h2>
            {` ${
              opcionesClientes.find((c) => c.value === infoAEditar?.usuario_id)
                ?.label
            } -
      Registro °${infoAEditar?.info_id}`}
          </h2>

          <div ref={scrollRef}>
            {draftDatos.map(({ key, value }, i, array) => {
              const esObligatorio = i < 7;

              return (
                <div key={i} className="cont-dato-editar">
                  {esObligatorio ? (
                    <span>{key}</span>
                  ) : (
                    <input
                      type="text"
                      placeholder="Dato..."
                      value={key}
                      onChange={(e) => cambiarLlaveDraft(i, e.target.value)}
                      ref={i === array.length - 1 ? inputRef : null}
                    />
                  )}

                  <input
                    type="text"
                    placeholder="Detalle..."
                    value={value}
                    onChange={(e) => cambiarValorDraft(i, e.target.value)}
                    className={esObligatorio ? "input-obligatorio" : ""}
                  />

                  {!esObligatorio && (
                    <button
                      type="button"
                      onClick={() => eliminarDatoDraft(i)}
                      title="Eliminar campo"
                    >
                      <img src={imgBorrar} alt="Eliminar" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="sep-hrz"></div>
          <div className="cont-btns">
            <button
              type="button"
              onClick={agregarDatoDraft}
              title="Agregar campo"
            >
              <img src={imgAgregarFila} alt="" />
              Agregar campo
            </button>
            <button
              type="button"
              onClick={editarRegistro}
              title="Guardar registro"
            >
              <img src={imgEditar} alt="" />
              Guardar
            </button>
          </div>
        </div>
      </Popup>
    </>
  );
}
