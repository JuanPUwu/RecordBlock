import Popup from "reactjs-popup";
import PropTypes from "prop-types";
import { useRef } from "react";
import imgSubirArchivo from "../assets/img/subirArchivo.webp";
import imgEditar from "../assets/img/editar.webp";
import imgAgregarFila from "../assets/img/agregarFila.webp";
import imgCrearRegistro from "../assets/img/flecha.webp";
import imgBorrar from "../assets/img/basura.webp";

export default function PopupCrearInfo({
  open,
  onClose,
  clienteSeleccionado,
  opcionesClientes,
  draftCrear,
  datosMinimos,
  cambiarLlaveCrear,
  cambiarValorCrear,
  eliminarDatoCrear,
  agregarDatoCrear,
  scrollCrearRef,
  inputCrearRef,
  onSubirCSV,
  refInputFile,
  onEditarDatosMinimos,
  onCreate,
}) {
  return (
    <Popup open={open} onClose={onClose} modal nested>
      <div className="cont-popUp-editarInfo">
        <input
          type="file"
          accept=".csv"
          ref={refInputFile}
          onChange={onSubirCSV}
          style={{ display: "none" }}
        />
        <button
          className="btn-change btn-subir-archivo"
          title="importar archivo CSV"
          onClick={() => refInputFile.current?.click()}
        >
          <img src={imgSubirArchivo} alt="" />
        </button>
        <h2>
          {`${
            opcionesClientes.find(
              (c) => c.value === clienteSeleccionado?.value
            )?.label
          } - Nuevo registro`}
        </h2>
        <button
          className="btn-change"
          title="Editar datos minimos"
          onClick={onEditarDatosMinimos}
        >
          <img src={imgEditar} alt="" />
        </button>

        <div ref={scrollCrearRef}>
          {draftCrear.map(({ key, value }, i, array) => {
            const esObligatorio = i < datosMinimos.length;
            // Usar solo el índice como key para evitar que React re-renderice y pierda el foco
            const uniqueKey = `crear-${i}`;

            return (
              <div key={uniqueKey} className="cont-dato-editar">
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
            <span>Agregar campo</span>
          </button>
          <button
            type="button"
            className="btn-crear"
            onClick={onCreate}
            title="Crear registro"
          >
            <img src={imgCrearRegistro} alt="" />
            <span>Crear</span>
          </button>
        </div>
      </div>
    </Popup>
  );
}

PopupCrearInfo.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  clienteSeleccionado: PropTypes.object,
  opcionesClientes: PropTypes.array.isRequired,
  draftCrear: PropTypes.array.isRequired,
  datosMinimos: PropTypes.array.isRequired,
  cambiarLlaveCrear: PropTypes.func.isRequired,
  cambiarValorCrear: PropTypes.func.isRequired,
  eliminarDatoCrear: PropTypes.func.isRequired,
  agregarDatoCrear: PropTypes.func.isRequired,
  scrollCrearRef: PropTypes.object.isRequired,
  inputCrearRef: PropTypes.object.isRequired,
  onSubirCSV: PropTypes.func.isRequired,
  refInputFile: PropTypes.object.isRequired,
  onEditarDatosMinimos: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
};

