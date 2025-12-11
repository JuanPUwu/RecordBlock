import { useState } from "react";
import PropTypes from "prop-types";
import imgSearch from "../assets/img/busqueda.webp";

/**
 * Componente de búsqueda de cliente con input controlado para mejor rendimiento
 */
export default function BuscadorCliente({
  refBusquedaCliente,
  buscarCliente,
  resultadosBusquedaClientes,
  seleccionBusqueda,
}) {
  const [valorInput, setValorInput] = useState("");

  const handleChange = (e) => {
    const nuevoValor = e.target.value;
    setValorInput(nuevoValor);
    // Sincronizar con el ref
    if (refBusquedaCliente.current) {
      refBusquedaCliente.current.value = nuevoValor;
    }
    // Llamar a la función de búsqueda
    buscarCliente(e);
  };

  const handleSeleccionar = (cliente) => {
    setValorInput("");
    if (refBusquedaCliente.current) {
      refBusquedaCliente.current.value = "";
    }
    seleccionBusqueda(cliente);
  };

  return (
    <div className="cont-inpNav">
      <input
        type="text"
        placeholder="Busque por cliente..."
        value={valorInput}
        onChange={handleChange}
        ref={refBusquedaCliente}
      />
      <img src={imgSearch} alt="" />
      {resultadosBusquedaClientes.length > 0 && (
        <div>
          {resultadosBusquedaClientes.map((c) => (
            <button key={c.value} onClick={() => handleSeleccionar(c)}>
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

BuscadorCliente.propTypes = {
  refBusquedaCliente: PropTypes.object.isRequired,
  buscarCliente: PropTypes.func.isRequired,
  resultadosBusquedaClientes: PropTypes.array.isRequired,
  seleccionBusqueda: PropTypes.func.isRequired,
};

