import "../css/searchNav.css";
import imgSearch from "../assets/img/busqueda.webp";
import imgX from "../assets/img/x.webp";

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
      <label>
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
          <img src={imgX} alt="" />
        </button>
      </label>
      <div className="sep-vrtSearch"></div>
      <label>
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
          <img src={imgX} alt="" />
        </button>
      </label>
      <button>
        <img src={imgSearch} alt="" />
      </button>
    </div>
  );
}
