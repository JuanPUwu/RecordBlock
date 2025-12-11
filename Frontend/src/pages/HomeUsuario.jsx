// Estilos
import "../css/home.css";
import "../css/swalStyles.css";
import "../css/swalTableCSVStyles.css";

// Hooks
import { useHomeBase } from "../hooks/useHomeBase.js";

// Componentes
import SepHrz from "../components/SepHrz.jsx";
import Spinner from "../components/Spinner.jsx";
import HomeNav from "../components/HomeNav.jsx";
import HomePopups from "../components/HomePopups.jsx";
import ContenidoPrincipal from "../components/ContenidoPrincipal.jsx";

export default function HomeUsuario() {
  const {
    user,
    isLoading,
    setIsLoading,
    isRefrescarInfo,
    // Información
    whichInfo,
    terminosBusqueda,
    isInfoCargando,
    filtrarPorFecha,
    setFiltrarPorFecha,
    refDato,
    refDetalle,
    filtroInformacion,
    isDatoValue,
    isDetalleValue,
    handleInputDato,
    handleInputDetalle,
    exportarComoPDF,
    exportarComoExcell,
    // Datos mínimos
    obtenerDatosMin,
    // Crear información
    setDraftCrear,
    // Editar información
    handleEditarInfo,
    // Popups
    popUpUsuarios,
    setPopUpUsuarios,
    popUpEditarContrasena,
    setPopUpEditarContrasena,
    popUpCrearInfo,
    setPopUpCrearInfo,
    popUpEditarInfo,
    setPopUpEditarInfo,
    usuarioSeleccionado,
    setUsuarioSeleccionado,
    // Formularios
    registerCambiar,
    handleSubmitCambiar,
    resetCambiar,
    errorsCambiar,
    isSubmittingCambiar,
    verPassword,
    setVerPassword,
    verPassword2,
    setVerPassword2,
    // Información
    clienteSeleccionadoSimulado,
    datosMinimos,
    draftCrear,
    scrollCrearRef,
    inputCrearRef,
    cambiarLlaveCrear,
    cambiarValorCrear,
    eliminarDatoCrear,
    agregarDatoCrear,
    refInputFile,
    handleSubirCSV,
    handleCrearRegistro,
    infoAEditar,
    setInfoSeleccionada,
    setInfoAEditar,
    draftDatos,
    scrollRef,
    inputRef,
    cambiarLlaveDraft,
    cambiarValorDraft,
    eliminarDatoDraft,
    agregarDatoDraft,
    handleEditarRegistro,
    // Handlers
    handleEditarContraseña,
    refrescarInfo,
    eliminarInformacionCliente,
    cerrarSesion,
  } = useHomeBase(false);

  return (
    <>
      {/* Loader */}
      {isLoading && <Spinner />}

      {/* Nav */}
      <HomeNav
        isAdmin={false}
        user={user}
        whichInfo={whichInfo}
        filtrarPorFecha={filtrarPorFecha}
        setFiltrarPorFecha={setFiltrarPorFecha}
        refDato={refDato}
        refDetalle={refDetalle}
        filtroInformacion={filtroInformacion}
        isDatoValue={isDatoValue}
        isDetalleValue={isDetalleValue}
        handleInputDato={handleInputDato}
        handleInputDetalle={handleInputDetalle}
        isRefrescarInfo={isRefrescarInfo}
        onUsuarioClick={() => setPopUpUsuarios(true)}
        onRefrescarClick={refrescarInfo}
        onCrearRegistroClick={async () => {
          await obtenerDatosMin(setIsLoading, setDraftCrear);
          setPopUpCrearInfo(true);
        }}
        exportarComoPDF={exportarComoPDF}
        exportarComoExcell={exportarComoExcell}
        cerrarSesion={cerrarSesion}
      />
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

      {/* Popups */}
      <HomePopups
        isAdmin={false}
        user={user}
        popUpUsuarios={popUpUsuarios}
        setPopUpUsuarios={setPopUpUsuarios}
        popUpEditarContrasena={popUpEditarContrasena}
        setPopUpEditarContrasena={setPopUpEditarContrasena}
        popUpCrearCliente={false}
        setPopUpCrearCliente={() => {}}
        popUpCrearInfo={popUpCrearInfo}
        setPopUpCrearInfo={setPopUpCrearInfo}
        popUpEditarInfo={popUpEditarInfo}
        setPopUpEditarInfo={setPopUpEditarInfo}
        popUpEditarDatosMinimos={false}
        setPopUpEditarDatosMinimos={() => {}}
        usuarioSeleccionado={usuarioSeleccionado}
        setUsuarioSeleccionado={setUsuarioSeleccionado}
        registerCambiar={registerCambiar}
        handleSubmitCambiar={handleSubmitCambiar}
        resetCambiar={resetCambiar}
        errorsCambiar={errorsCambiar}
        isSubmittingCambiar={isSubmittingCambiar}
        registerCrear={null}
        handleSubmitCrear={null}
        resetCrear={() => {}}
        errorsCrear={{}}
        isSubmittingCrear={false}
        verPassword={verPassword}
        setVerPassword={setVerPassword}
        verPassword2={verPassword2}
        setVerPassword2={setVerPassword2}
        opcionesClientes={[]}
        opcionesClientesTabla={[]}
        obtenerClientes={() => {}}
        buscarClienteTabla={() => {}}
        crearCliente={() => {}}
        eliminarCliente={() => {}}
        clienteSeleccionado={null}
        clienteSeleccionadoSimulado={clienteSeleccionadoSimulado}
        datosMinimos={datosMinimos}
        obtenerDatosMin={obtenerDatosMin}
        draftCrear={draftCrear}
        setDraftCrear={setDraftCrear}
        scrollCrearRef={scrollCrearRef}
        inputCrearRef={inputCrearRef}
        cambiarLlaveCrear={cambiarLlaveCrear}
        cambiarValorCrear={cambiarValorCrear}
        eliminarDatoCrear={eliminarDatoCrear}
        agregarDatoCrear={agregarDatoCrear}
        refInputFile={refInputFile}
        handleSubirCSV={handleSubirCSV}
        handleCrearRegistro={handleCrearRegistro}
        infoAEditar={infoAEditar}
        setInfoSeleccionada={setInfoSeleccionada}
        setInfoAEditar={setInfoAEditar}
        draftDatos={draftDatos}
        scrollRef={scrollRef}
        inputRef={inputRef}
        cambiarLlaveDraft={cambiarLlaveDraft}
        cambiarValorDraft={cambiarValorDraft}
        eliminarDatoDraft={eliminarDatoDraft}
        agregarDatoDraft={agregarDatoDraft}
        handleEditarRegistro={handleEditarRegistro}
        draftDatosMinimos={[]}
        setDraftDatosMinimos={() => {}}
        cambiarDatoMinimo={() => {}}
        eliminarDatoMinimo={() => {}}
        agregarDatoMinimo={() => {}}
        scrollDatosMinimosRef={{ current: null }}
        inputDatosMinimosRef={{ current: null }}
        guardarDatosMinimos={async () => false}
        setIsLoading={setIsLoading}
        handleEditarContraseña={handleEditarContraseña}
      />
    </>
  );
}
