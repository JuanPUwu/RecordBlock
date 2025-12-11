import { useState, useRef, useEffect } from "react";
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
  const [valorDato, setValorDato] = useState("");
  const [valorDetalle, setValorDetalle] = useState("");
  const inputDatoRef = useRef(null);
  const inputDetalleRef = useRef(null);

  // Sincronizar refs externos con refs internos
  useEffect(() => {
    if (refDato?.current && !inputDatoRef.current) {
      inputDatoRef.current = refDato.current;
    }
    if (refDetalle?.current && !inputDetalleRef.current) {
      inputDetalleRef.current = refDetalle.current;
    }
  }, [refDato, refDetalle]);

  // Sincronizar cuando se limpia desde fuera
  useEffect(() => {
    if (refDato?.current?.value === "") {
      setValorDato("");
    }
  }, [isDatoValue, refDato]);

  useEffect(() => {
    if (refDetalle?.current?.value === "") {
      setValorDetalle("");
    }
  }, [isDetalleValue, refDetalle]);

  const handleChangeDato = (e) => {
    const nuevoValor = e.target.value;
    setValorDato(nuevoValor);
    if (refDato?.current) {
      refDato.current.value = nuevoValor;
    }
    onInputDato(e);
  };

  const handleChangeDetalle = (e) => {
    const nuevoValor = e.target.value;
    setValorDetalle(nuevoValor);
    if (refDetalle?.current) {
      refDetalle.current.value = nuevoValor;
    }
    onInputDetalle(e);
  };

  const handleClearDato = () => {
    setValorDato("");
    if (refDato?.current) {
      refDato.current.value = "";
    }
    // Simular evento de cambio con valor vacío para actualizar el estado en useFiltros
    const fakeEvent = { target: { value: "" } };
    onInputDato(fakeEvent);
    clearDato();
  };

  const handleClearDetalle = () => {
    setValorDetalle("");
    if (refDetalle?.current) {
      refDetalle.current.value = "";
    }
    // Simular evento de cambio con valor vacío para actualizar el estado en useFiltros
    const fakeEvent = { target: { value: "" } };
    onInputDetalle(fakeEvent);
    clearDetalle();
  };

  return (
    <div className="cont-searchNav">
      <div className="input-group">
        <input
          type="text"
          placeholder="Buscar por dato..."
          ref={refDato}
          value={valorDato}
          onChange={handleChangeDato}
        />
        <button
          onClick={handleClearDato}
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
          value={valorDetalle}
          onChange={handleChangeDetalle}
        />
        <button
          onClick={handleClearDetalle}
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
