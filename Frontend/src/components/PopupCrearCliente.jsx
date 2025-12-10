import Popup from "reactjs-popup";
import PropTypes from "prop-types";
import SepHrz from "./SepHrz.jsx";
import Spinner from "./Spinner.jsx";
import imgCrearCliente from "../assets/img/añadir.webp";
import imgVisibility from "../assets/img/ojo.webp";

export default function PopupCrearCliente({
  open,
  onClose,
  registerCrear,
  handleSubmitCrear,
  errorsCrear,
  isSubmittingCrear,
  verPassword,
  setVerPassword,
  verPassword2,
  setVerPassword2,
  onSubmit,
}) {
  return (
    <Popup open={open} onClose={onClose} modal nested>
      <div className="cont-popUp">
        <h2>Crear cliente</h2>
        <form onSubmit={handleSubmitCrear(onSubmit)}>
          {/* Nombre */}
          <div className="cont-label">
            <label htmlFor="crear-nombre">Nombre de usuario:</label>
            {errorsCrear.nombre && <span>{errorsCrear.nombre.message}</span>}
          </div>
          <input
            id="crear-nombre"
            type="text"
            {...registerCrear("nombre")}
            placeholder="alpina"
          />

          {/* Email */}
          <div className="cont-label">
            <label htmlFor="crear-email">Correo:</label>
            {errorsCrear.email && <span>{errorsCrear.email.message}</span>}
          </div>
          <input
            id="crear-email"
            type="text"
            {...registerCrear("email")}
            placeholder="alpina@example.com"
          />

          {/* Password */}
          <div className="cont-label">
            <label htmlFor="crear-password">Contraseña:</label>
            {errorsCrear.password && (
              <span>{errorsCrear.password.message}</span>
            )}
          </div>
          <div className="cont-pass">
            <input
              id="crear-password"
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
            <label htmlFor="crear-password2">Confirmar contraseña:</label>
            {errorsCrear.password2 && (
              <span>{errorsCrear.password2.message}</span>
            )}
          </div>
          <div className="cont-pass">
            <input
              id="crear-password2"
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
            className="btn-form-success"
            title="Crear cliente"
          >
            <img src={imgCrearCliente} alt="" />
            Crear
            {isSubmittingCrear && <Spinner />}
          </button>
        </form>
      </div>
    </Popup>
  );
}

PopupCrearCliente.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  registerCrear: PropTypes.func.isRequired,
  handleSubmitCrear: PropTypes.func.isRequired,
  errorsCrear: PropTypes.object.isRequired,
  isSubmittingCrear: PropTypes.bool.isRequired,
  verPassword: PropTypes.string.isRequired,
  setVerPassword: PropTypes.func.isRequired,
  verPassword2: PropTypes.string.isRequired,
  setVerPassword2: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

