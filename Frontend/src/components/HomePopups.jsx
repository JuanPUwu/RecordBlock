import PropTypes from "prop-types";
import Popup from "reactjs-popup";
import CardAdmin from "./CardAdmin.jsx";
import PopupUsuarios from "./PopupUsuarios.jsx";
import PopupCrearCliente from "./PopupCrearCliente.jsx";
import PopupEditarContrasena from "./PopupEditarContrasena.jsx";
import PopupCrearInfo from "./PopupCrearInfo.jsx";
import PopupEditarInfo from "./PopupEditarInfo.jsx";
import PopupEditarDatosMinimos from "./PopupEditarDatosMinimos.jsx";

/**
 * Componente que maneja todos los popups de HomeUsuario y HomeAdmin
 */
export default function HomePopups({
  isAdmin,
  user,
  // Estados de popups
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
  // Clientes (solo admin)
  opcionesClientes,
  opcionesClientesTabla,
  obtenerClientes,
  buscarClienteTabla,
  crearCliente,
  eliminarCliente,
  // Información
  clienteSeleccionado,
  clienteSeleccionadoSimulado,
  datosMinimos,
  obtenerDatosMin,
  draftCrear,
  setDraftCrear,
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
  // Datos mínimos (solo admin)
  draftDatosMinimos,
  setDraftDatosMinimos,
  cambiarDatoMinimo,
  eliminarDatoMinimo,
  agregarDatoMinimo,
  scrollDatosMinimosRef,
  inputDatosMinimosRef,
  guardarDatosMinimos,
  setIsLoading,
  // Handlers
  handleEditarContraseña,
}) {
  return (
    <>
      {/* PopUp usuarios */}
      {isAdmin ? (
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
      ) : (
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
      )}

      {/* PopUp crear cliente (solo admin) */}
      {isAdmin && (
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
      )}

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
        onSubmit={handleEditarContraseña}
        mostrarNombreUsuario={!isAdmin}
      />

      {/* PopUp crear informacion */}
      <PopupCrearInfo
        open={popUpCrearInfo}
        onClose={() => {
          setPopUpCrearInfo(false);
          setDraftCrear([]);
        }}
        clienteSeleccionado={clienteSeleccionadoSimulado}
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
        onEditarDatosMinimos={
          isAdmin ? () => setPopUpEditarDatosMinimos(true) : () => {}
        }
        onCreate={handleCrearRegistro}
        mostrarEditarDatosMinimos={isAdmin}
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

      {/* PopUp editar datos minimos (solo admin) */}
      {isAdmin && (
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
      )}
    </>
  );
}

HomePopups.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
  popUpUsuarios: PropTypes.bool.isRequired,
  setPopUpUsuarios: PropTypes.func.isRequired,
  popUpEditarContrasena: PropTypes.bool.isRequired,
  setPopUpEditarContrasena: PropTypes.func.isRequired,
  popUpCrearCliente: PropTypes.bool.isRequired,
  setPopUpCrearCliente: PropTypes.func.isRequired,
  popUpCrearInfo: PropTypes.bool.isRequired,
  setPopUpCrearInfo: PropTypes.func.isRequired,
  popUpEditarInfo: PropTypes.bool.isRequired,
  setPopUpEditarInfo: PropTypes.func.isRequired,
  popUpEditarDatosMinimos: PropTypes.bool.isRequired,
  setPopUpEditarDatosMinimos: PropTypes.func.isRequired,
  usuarioSeleccionado: PropTypes.object,
  setUsuarioSeleccionado: PropTypes.func.isRequired,
  registerCambiar: PropTypes.func.isRequired,
  handleSubmitCambiar: PropTypes.func.isRequired,
  resetCambiar: PropTypes.func.isRequired,
  errorsCambiar: PropTypes.object.isRequired,
  isSubmittingCambiar: PropTypes.bool.isRequired,
  registerCrear: PropTypes.func,
  handleSubmitCrear: PropTypes.func,
  resetCrear: PropTypes.func,
  errorsCrear: PropTypes.object,
  isSubmittingCrear: PropTypes.bool,
  verPassword: PropTypes.string.isRequired,
  setVerPassword: PropTypes.func.isRequired,
  verPassword2: PropTypes.string.isRequired,
  setVerPassword2: PropTypes.func.isRequired,
  opcionesClientes: PropTypes.array.isRequired,
  opcionesClientesTabla: PropTypes.array,
  obtenerClientes: PropTypes.func,
  buscarClienteTabla: PropTypes.func,
  crearCliente: PropTypes.func,
  eliminarCliente: PropTypes.func,
  clienteSeleccionado: PropTypes.object,
  clienteSeleccionadoSimulado: PropTypes.object.isRequired,
  datosMinimos: PropTypes.array.isRequired,
  obtenerDatosMin: PropTypes.func.isRequired,
  draftCrear: PropTypes.array.isRequired,
  setDraftCrear: PropTypes.func.isRequired,
  scrollCrearRef: PropTypes.object.isRequired,
  inputCrearRef: PropTypes.object.isRequired,
  cambiarLlaveCrear: PropTypes.func.isRequired,
  cambiarValorCrear: PropTypes.func.isRequired,
  eliminarDatoCrear: PropTypes.func.isRequired,
  agregarDatoCrear: PropTypes.func.isRequired,
  refInputFile: PropTypes.object.isRequired,
  handleSubirCSV: PropTypes.func.isRequired,
  handleCrearRegistro: PropTypes.func.isRequired,
  infoAEditar: PropTypes.object,
  setInfoSeleccionada: PropTypes.func.isRequired,
  setInfoAEditar: PropTypes.func.isRequired,
  draftDatos: PropTypes.array.isRequired,
  scrollRef: PropTypes.object.isRequired,
  inputRef: PropTypes.object.isRequired,
  cambiarLlaveDraft: PropTypes.func.isRequired,
  cambiarValorDraft: PropTypes.func.isRequired,
  eliminarDatoDraft: PropTypes.func.isRequired,
  agregarDatoDraft: PropTypes.func.isRequired,
  handleEditarRegistro: PropTypes.func.isRequired,
  draftDatosMinimos: PropTypes.array.isRequired,
  setDraftDatosMinimos: PropTypes.func.isRequired,
  cambiarDatoMinimo: PropTypes.func.isRequired,
  eliminarDatoMinimo: PropTypes.func.isRequired,
  agregarDatoMinimo: PropTypes.func.isRequired,
  scrollDatosMinimosRef: PropTypes.object.isRequired,
  inputDatosMinimosRef: PropTypes.object.isRequired,
  guardarDatosMinimos: PropTypes.func.isRequired,
  setIsLoading: PropTypes.func.isRequired,
  handleEditarContraseña: PropTypes.func.isRequired,
};

