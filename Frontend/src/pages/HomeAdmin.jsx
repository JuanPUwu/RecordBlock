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

export default function HomeAdmin() {
  const {
    user,
    isLoading,
    setIsLoading,
    // Clientes
    clienteSeleccionado,
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
    setDraftCrear,
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
    // Editar información
    handleEditarInfo,
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
    // Formularios
    registerCambiar,
    handleSubmitCambiar,
    resetCambiar,
    errorsCambiar,
    isSubmittingCambiar,
    registerCrear,
    handleSubmitCrear,
    resetCrear,
    errorsCrear,
    isSubmittingCrear,
    verPassword,
    setVerPassword,
    verPassword2,
    setVerPassword2,
    // Handlers
    handleEditarContraseña,
    crearCliente,
    eliminarCliente,
    eliminarInformacionCliente,
    cerrarSesion,
  } = useHomeBase(true);

  return (
    <>
      {/* Loader */}
      {isLoading && <Spinner />}

      {/* Nav */}
      <HomeNav
        isAdmin={true}
        user={user}
        clienteSeleccionado={clienteSeleccionado}
        opcionesClientes={opcionesClientes}
        refBusquedaCliente={refBusquedaCliente}
        resultadosBusquedaClientes={resultadosBusquedaClientes}
        obtenerClientes={obtenerClientes}
        buscarCliente={buscarCliente}
        seleccionBusqueda={seleccionBusqueda}
        limpiarClienteSeleccionado={limpiarClienteSeleccionado}
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
        onUsuarioClick={() => {
          obtenerClientes();
          setPopUpUsuarios(true);
        }}
        onRefrescarClick={() => {}}
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
        isAdmin={true}
        user={user}
        popUpUsuarios={popUpUsuarios}
        setPopUpUsuarios={setPopUpUsuarios}
        popUpEditarContrasena={popUpEditarContrasena}
        setPopUpEditarContrasena={setPopUpEditarContrasena}
        popUpCrearCliente={popUpCrearCliente}
        setPopUpCrearCliente={setPopUpCrearCliente}
        popUpCrearInfo={popUpCrearInfo}
        setPopUpCrearInfo={setPopUpCrearInfo}
        popUpEditarInfo={popUpEditarInfo}
        setPopUpEditarInfo={setPopUpEditarInfo}
        popUpEditarDatosMinimos={popUpEditarDatosMinimos}
        setPopUpEditarDatosMinimos={setPopUpEditarDatosMinimos}
        usuarioSeleccionado={usuarioSeleccionado}
        setUsuarioSeleccionado={setUsuarioSeleccionado}
        registerCambiar={registerCambiar}
        handleSubmitCambiar={handleSubmitCambiar}
        resetCambiar={resetCambiar}
        errorsCambiar={errorsCambiar}
        isSubmittingCambiar={isSubmittingCambiar}
        registerCrear={registerCrear}
        handleSubmitCrear={handleSubmitCrear}
        resetCrear={resetCrear}
        errorsCrear={errorsCrear}
        isSubmittingCrear={isSubmittingCrear}
        verPassword={verPassword}
        setVerPassword={setVerPassword}
        verPassword2={verPassword2}
        setVerPassword2={setVerPassword2}
        opcionesClientes={opcionesClientes}
        opcionesClientesTabla={opcionesClientesTabla}
        obtenerClientes={obtenerClientes}
        buscarClienteTabla={buscarClienteTabla}
        crearCliente={crearCliente}
        eliminarCliente={eliminarCliente}
        clienteSeleccionado={clienteSeleccionado}
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
        draftDatosMinimos={draftDatosMinimos}
        setDraftDatosMinimos={setDraftDatosMinimos}
        cambiarDatoMinimo={cambiarDatoMinimo}
        eliminarDatoMinimo={eliminarDatoMinimo}
        agregarDatoMinimo={agregarDatoMinimo}
        scrollDatosMinimosRef={scrollDatosMinimosRef}
        inputDatosMinimosRef={inputDatosMinimosRef}
        guardarDatosMinimos={guardarDatosMinimos}
        setIsLoading={setIsLoading}
        handleEditarContraseña={handleEditarContraseña}
      />
    </>
  );
}
