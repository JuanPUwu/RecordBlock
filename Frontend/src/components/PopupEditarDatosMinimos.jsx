import Popup from "reactjs-popup";
import PropTypes from "prop-types";
import imgAgregarFila from "../assets/img/agregarFila.webp";
import imgGuardar from "../assets/img/guardar.webp";
import imgBorrar from "../assets/img/basura.webp";

export default function PopupEditarDatosMinimos({
  open,
  onClose,
  draftDatosMinimos,
  cambiarDatoMinimo,
  eliminarDatoMinimo,
  agregarDatoMinimo,
  scrollDatosMinimosRef,
  inputDatosMinimosRef,
  onSave,
}) {
  return (
    <Popup open={open} onClose={onClose} modal nested>
      <div className="cont-popUp-editarInfo">
        <h2>Editar datos mínimos</h2>
        <div ref={scrollDatosMinimosRef} className="cont-datos-minimos">
          {draftDatosMinimos.map((dato, i, array) => {
            // Usar solo el índice como key para evitar que React re-renderice y pierda el foco
            const uniqueKey = `dato-min-${i}`;
            return (
              <div key={uniqueKey} className="cont-dato-editar">
                <input
                  type="text"
                  placeholder="Dato mínimo..."
                  className="inp-dato-minimo"
                  value={dato}
                  onChange={(e) => cambiarDatoMinimo(i, e.target.value)}
                  ref={i === array.length - 1 ? inputDatosMinimosRef : null}
                />
                <button
                  type="button"
                  onClick={() => eliminarDatoMinimo(i)}
                  title="Eliminar dato"
                >
                  <img src={imgBorrar} alt="Eliminar" />
                </button>
              </div>
            );
          })}
        </div>
        <div className="sep-hrz"></div>
        <div className="cont-btns">
          <button
            type="button"
            onClick={agregarDatoMinimo}
            title="Agregar dato"
          >
            <img src={imgAgregarFila} alt="" />
            <span>Agregar dato</span>
          </button>
          <button
            type="button"
            className="btn-crear"
            onClick={onSave}
            title="Guardar datos mínimos"
          >
            <img src={imgGuardar} alt="" />
            <span>Guardar</span>
          </button>
        </div>
      </div>
    </Popup>
  );
}

PopupEditarDatosMinimos.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  draftDatosMinimos: PropTypes.array.isRequired,
  cambiarDatoMinimo: PropTypes.func.isRequired,
  eliminarDatoMinimo: PropTypes.func.isRequired,
  agregarDatoMinimo: PropTypes.func.isRequired,
  scrollDatosMinimosRef: PropTypes.object.isRequired,
  inputDatosMinimosRef: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

