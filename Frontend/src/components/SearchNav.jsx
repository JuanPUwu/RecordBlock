import "../css/searchNav.css";
import imgSearch from "../assets/img/busqueda.webp";
import imgX from "../assets/img/x.webp";
import PropTypes from "prop-types";

export default function SearchNav({
  refDato,
  refDetalle,
  onInputDato,
  onInputDetalle,
  clearDato,
  clearDetalle,
  isDatoValue,
  isDetalleValue,
}) {
  return (
    <div className="cont-searchNav">
      <div className="input-group">
        <input
          type="text"
          placeholder="Buscar por dato..."
          ref={refDato}
          onInput={onInputDato}
        />
        <button
          onClick={clearDato}
          className={isDatoValue ? "" : "no-active"}
          disabled={!isDatoValue}
        >
          <img src={imgX} alt="Limpiar búsqueda" />
        </button>
      </div>

      <div className="sep-vrtSearch"></div>

      <div className="input-group">
        <input
          type="text"
          placeholder="Buscar por detalle..."
          ref={refDetalle}
          onInput={onInputDetalle}
        />
        <button
          onClick={clearDetalle}
          className={isDetalleValue ? "" : "no-active"}
          disabled={!isDetalleValue}
        >
          <img src={imgX} alt="Limpiar búsqueda" />
        </button>
      </div>

      <button>
        <img src={imgSearch} alt="Buscar" />
      </button>
    </div>
  );
}

SearchNav.propTypes = {
  refDato: PropTypes.object.isRequired,
  refDetalle: PropTypes.object.isRequired,
  onInputDato: PropTypes.func.isRequired,
  onInputDetalle: PropTypes.func.isRequired,
  clearDato: PropTypes.func.isRequired,
  clearDetalle: PropTypes.func.isRequired,
  isDatoValue: PropTypes.bool.isRequired,
  isDetalleValue: PropTypes.bool.isRequired,
};
