// Estilos
import "../css/home.css";
import "../css/swalStyles.css";
import "../css/swalTableCSVStyles.css";

// Hooks
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

// Hooks personalizados
import { useFiltros } from "../hooks/useFiltros.js";
import { useCrearInfo } from "../hooks/useCrearInfo.js";
import { useEditarInfo } from "../hooks/useEditarInfo.js";
import { useCSV } from "../hooks/useCSV.js";
import { useDatosMinimosAdmin } from "../hooks/useDatosMinimosAdmin.js";

// Servicios
import { useUsuarioService } from "../services/usuarioService.js";
import { useInfoUsuarioService } from "../services/infoUsuarioServices.js";

// Eschemas
import { schemaCambiarContraseña } from "../validations/eschemas";

// Componentes
import Nav from "../components/Nav.jsx";
import SepHrz from "../components/SepHrz.jsx";
import SearchNav from "../components/SearchNav.jsx";
import Spinner from "../components/Spinner.jsx";
import Popup from "reactjs-popup";
import CardAdmin from "../components/CardAdmin.jsx";
import PopupEditarContrasena from "../components/PopupEditarContrasena.jsx";
import PopupCrearInfo from "../components/PopupCrearInfo.jsx";
import PopupEditarInfo from "../components/PopupEditarInfo.jsx";
import ContenidoPrincipal from "../components/ContenidoPrincipal.jsx";

// Imagenes
import imgUsuario from "../assets/img/usuario.webp";
import imgLimpiar from "../assets/img/reset.webp";
import imgCrearRegistro from "../assets/img/flecha.webp";
import imgExcell from "../assets/img/excell.webp";
import imgPdf from "../assets/img/pdf.webp";
import imgSalir from "../assets/img/salir.webp";
import swalStyles from "../css/swalStyles.js";

export default function HomeUsuario() {
  // ? Inicio Manejo formularios ->
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

  const [isRefrescarInfo, setIsRefrescarInfo] = useState(false);
  function refrescarInfo() {
    setIsRefrescarInfo(true);
    cargarInformacion();
    toast.success("Registros refrescados");
    setTimeout(() => {
      setIsRefrescarInfo(false);
    }, 300);
  }
  // ? <- Fin utils

  // * <-------------------------------------------------------------------------------->

  // ? Inicio editar contraseña cliente/acciones ->
  const [popUpUsuarios, setPopUpUsuarios] = useState(false);
  const [popUpEditarContrasena, setPopUpEditarContrasena] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [verPassword, setVerPassword] = useState("password");
  const [verPassword2, setVerPassword2] = useState("password");
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
    const userId = user?.id || user?.value;
    const response = await obtenerInformacion(userId);
    refInformacion.current = response.data.data;
    filtroInformacion();
  };

  // Cargar información al montar el componente
  useEffect(() => {
    cargarInformacion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Crear opciones de cliente para exportación (solo el usuario actual)
  const opcionesClientesExportacion = user
    ? [
        {
          value: user.id || user.value,
          label: user.nombre,
        },
      ]
    : [];

  // Exportar como PDF
  const exportarComoPDF = async () => {
    setIsLoading(true);
    const { exportarPDF } = await import("../utils/pdfUtils.js");
    try {
      await exportarPDF(whichInfo, opcionesClientesExportacion);
    } finally {
      setIsLoading(false);
    }
  };

  // Exportar como excell
  const exportarComoExcell = async () => {
    setIsLoading(true);
    const { exportarExcel } = await import("../utils/excellUtils.js");
    try {
      await exportarExcel(whichInfo, opcionesClientesExportacion);
    } finally {
      setIsLoading(false);
    }
  };
  // ? <- Fin ver info cliente

  // * <-------------------------------------------------------------------------------->

  // ? -> Inicio crear info cliente
  const [popUpCrearInfo, setPopUpCrearInfo] = useState(false);

  // Crear un objeto clienteSeleccionado simulado para usar con los hooks
  // El usuario siempre será el que inició sesión
  const clienteSeleccionadoSimulado = {
    value: user?.id || user?.value || null,
  };

  // Obtener datos mínimos (solo lectura, no se pueden editar)
  const { datosMinimos, obtenerDatosMin } = useDatosMinimosAdmin();

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
            setPopUpUsuarios(true);
          }}
          className="btn-nav btn-nav-primary btn-user"
          title="Gestión de usuario"
        >
          <img src={imgUsuario} alt="" />
          <span>{user.nombre}</span>
        </button>
        <button
          onClick={() => refrescarInfo()}
          className={`btn-nav btn-nav-secondary ${
            isRefrescarInfo ? "btn-disabled" : ""
          }`}
          disabled={isRefrescarInfo}
          title="Refrescar registros"
        >
          <img src={imgLimpiar} alt="" />
        </button>
        <button
          className="btn-nav btn-nav-success"
          title="Crear registro"
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
      <Popup
        open={popUpUsuarios}
        onClose={() => {
          setPopUpUsuarios(false);
          setUsuarioSeleccionado(null);
        }}
        modal
        nested
      >
        <div className="cont-popUp">
          <h2>Gestión de usuario</h2>
          <CardAdmin
            nameAdmin={user.nombre}
            rolAdmin={user.isAdmin ? "Administrador" : "Usuario"}
            onClick={() => {
              setPopUpEditarContrasena(true);
              setUsuarioSeleccionado(user);
            }}
          />
          <input className="inp-hiden" />
        </div>
      </Popup>

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
        mostrarNombreUsuario={false}
      />

      {/* PopUp crear informacion */}
      <PopupCrearInfo
        open={popUpCrearInfo}
        onClose={() => {
          setPopUpCrearInfo(false);
          setDraftCrear([]);
        }}
        clienteSeleccionado={clienteSeleccionadoSimulado}
        opcionesClientes={[]}
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
        onEditarDatosMinimos={() => {}}
        onCreate={handleCrearRegistro}
        mostrarEditarDatosMinimos={false}
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
        opcionesClientes={[]}
        draftDatos={draftDatos}
        cambiarLlaveDraft={cambiarLlaveDraft}
        cambiarValorDraft={cambiarValorDraft}
        eliminarDatoDraft={eliminarDatoDraft}
        agregarDatoDraft={agregarDatoDraft}
        scrollRef={scrollRef}
        inputRef={inputRef}
        onSave={handleEditarRegistro}
      />
    </>
  );
}
