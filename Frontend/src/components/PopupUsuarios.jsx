import Popup from "reactjs-popup";
import PropTypes from "prop-types";
import CardAdmin from "./CardAdmin.jsx";
import CardUsuario from "./CardUsuario.jsx";
import imgCrearCliente from "../assets/img/añadir.webp";
import imgSearch from "../assets/img/busqueda.webp";

export default function PopupUsuarios({
  open,
  onClose,
  user,
  opcionesClientesTabla,
  buscarClienteTabla,
  onCrearCliente,
  onEditarContrasena,
  onEliminarCliente,
}) {
  return (
    <Popup open={open} onClose={onClose} modal nested>
      <div className="cont-popUp">
        <h2>Gestión de usuarios</h2>
        <CardAdmin
          nameAdmin={user.nombre}
          rolAdmin={user.isAdmin ? "Administrador" : "Usuario"}
          onClick={() => onEditarContrasena(user)}
        />
        <div className="cont-tb-usuarios">
          <div className="cont-search-new">
            <label
              className="cont-searcher"
              aria-label="Buscar usuario o cliente"
            >
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
              onClick={onCrearCliente}
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
                  onClick1={() => onEditarContrasena(cliente)}
                  onClick2={() => onEliminarCliente(cliente)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Popup>
  );
}

PopupUsuarios.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  opcionesClientesTabla: PropTypes.array.isRequired,
  buscarClienteTabla: PropTypes.func.isRequired,
  onCrearCliente: PropTypes.func.isRequired,
  onEditarContrasena: PropTypes.func.isRequired,
  onEliminarCliente: PropTypes.func.isRequired,
};

