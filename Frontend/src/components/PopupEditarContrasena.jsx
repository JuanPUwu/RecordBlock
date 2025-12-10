import Popup from "reactjs-popup";
import PropTypes from "prop-types";
import Spinner from "./Spinner.jsx";
import imgVisibility from "../assets/img/ojo.webp";
import imgCandado from "../assets/img/candado.webp";

export default function PopupEditarContrasena({
  open,
  onClose,
  registerCambiar,
  handleSubmitCambiar,
  errorsCambiar,
  isSubmittingCambiar,
  verPassword,
  setVerPassword,
  verPassword2,
  setVerPassword2,
  usuarioSeleccionado,
  onSubmit,
}) {
  return (
    <Popup open={open} onClose={onClose} modal nested>
      <div className="cont-popUp">
        <h2>
          Cambio de contraseña
          <br />
          {usuarioSeleccionado?.nombre}
        </h2>
        <form onSubmit={handleSubmitCambiar(onSubmit)}>
          {/* Password 1*/}
          <div className="cont-label">
            <label htmlFor="cambiar-password">Contraseña:</label>
            {errorsCambiar.password && (
              <span>{errorsCambiar.password.message}</span>
            )}
          </div>
          <div className="cont-pass">
            <input
              id="cambiar-password"
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
            <label htmlFor="cambiar-password2">Confirmar contraseña:</label>
            {errorsCambiar.password2 && (
              <span>{errorsCambiar.password2.message}</span>
            )}
          </div>
          <div className="cont-pass">
            <input
              id="cambiar-password2"
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
            className="btn-form-warning"
            type="submit"
            disabled={isSubmittingCambiar}
            title="Cambiar contraseña"
          >
            <img src={imgCandado} alt="" />
            Cambiar
            {isSubmittingCambiar && <Spinner />}
          </button>
        </form>
      </div>
    </Popup>
  );
}

PopupEditarContrasena.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  registerCambiar: PropTypes.func.isRequired,
  handleSubmitCambiar: PropTypes.func.isRequired,
  errorsCambiar: PropTypes.object.isRequired,
  isSubmittingCambiar: PropTypes.bool.isRequired,
  verPassword: PropTypes.string.isRequired,
  setVerPassword: PropTypes.func.isRequired,
  verPassword2: PropTypes.string.isRequired,
  setVerPassword2: PropTypes.func.isRequired,
  usuarioSeleccionado: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
};

