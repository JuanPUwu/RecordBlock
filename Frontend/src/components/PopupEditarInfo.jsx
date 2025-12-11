import Popup from "reactjs-popup";
import PropTypes from "prop-types";
import imgEditar from "../assets/img/editar.webp";
import imgAgregarFila from "../assets/img/agregarFila.webp";
import imgBorrar from "../assets/img/basura.webp";

export default function PopupEditarInfo({
  open,
  onClose,
  infoAEditar,
  opcionesClientes,
  draftDatos,
  cambiarLlaveDraft,
  cambiarValorDraft,
  eliminarDatoDraft,
  agregarDatoDraft,
  scrollRef,
  inputRef,
  onSave,
}) {
  return (
    <Popup open={open} onClose={onClose} modal nested>
      <div className="cont-popUp-editarInfo">
        <h2>
          {(() => {
            const cliente = opcionesClientes.find(
              (c) => c.value === infoAEditar?.usuario_id
            );
            return cliente
              ? `${cliente.label} - Registro °${infoAEditar?.info_id}`
              : `Registro °${infoAEditar?.info_id}`;
          })()}
        </h2>

        <div ref={scrollRef}>
          {draftDatos.map(({ key, value }, i, array) => {
            const esObligatorio =
              i < infoAEditar?.datos_minimos_iniciales?.length;
            // Usar solo el índice como key para evitar que React re-renderice y pierda el foco
            const uniqueKey = `editar-${i}`;

            return (
              <div key={uniqueKey} className="cont-dato-editar">
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
            <span>Agregar campo</span>
          </button>
          <button type="button" onClick={onSave} title="Guardar registro">
            <img src={imgEditar} alt="" />
            <span>Guardar</span>
          </button>
        </div>
      </div>
    </Popup>
  );
}

PopupEditarInfo.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  infoAEditar: PropTypes.object,
  opcionesClientes: PropTypes.array.isRequired,
  draftDatos: PropTypes.array.isRequired,
  cambiarLlaveDraft: PropTypes.func.isRequired,
  cambiarValorDraft: PropTypes.func.isRequired,
  eliminarDatoDraft: PropTypes.func.isRequired,
  agregarDatoDraft: PropTypes.func.isRequired,
  scrollRef: PropTypes.object.isRequired,
  inputRef: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};
