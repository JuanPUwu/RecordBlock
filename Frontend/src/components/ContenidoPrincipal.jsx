import PropTypes from "prop-types";
import { resaltarTexto } from "../utils/textUtils.jsx";
import imgVacio from "../assets/img/vacio.webp";
import imgEditar from "../assets/img/editar.webp";
import imgBorrar from "../assets/img/basura.webp";

export default function ContenidoPrincipal({
  isInfoCargando,
  whichInfo,
  terminosBusqueda,
  onEditarInfo,
  onEliminarInfo,
}) {
  // Función para renderizar una columna de datos
  const renderizarColumnaDatos = (entries) => {
    return entries.map(([key, value]) => (
      <p key={key}>
        <strong>{resaltarTexto(key, terminosBusqueda.dato, true)}:</strong>{" "}
        {resaltarTexto(value, terminosBusqueda.detalle, false)}
      </p>
    ));
  };

  // Función para renderizar los datos de un registro
  const renderizarDatosRegistro = (dato, i) => {
    const entries = Object.entries(dato);
    const mitad = Math.ceil(entries.length / 2);
    const colIzq = entries.slice(0, mitad);
    const colDer = entries.slice(mitad);
    const uniqueKey = Object.keys(dato).join("-") || `dato-${i}`;

    return (
      <div className="cont-dato" key={uniqueKey}>
        <div className="columna">{renderizarColumnaDatos(colIzq)}</div>
        <div className="columna">{renderizarColumnaDatos(colDer)}</div>
      </div>
    );
  };

  // Función para renderizar un item de información
  const renderizarItemInfo = (info) => {
    return (
      <div className="item" key={info.info_id}>
        <h3>
          <button onClick={() => onEditarInfo(info)}>
            <img src={imgEditar} alt="" />
          </button>
          {info.usuario_nombre
            ? `Registro °${info.info_id} - ${info.usuario_nombre}`
            : `Registro °${info.info_id}`}
          <button onClick={() => onEliminarInfo(info)}>
            <img src={imgBorrar} alt="" />
          </button>
        </h3>
        {info.datos.map((dato, i) => renderizarDatosRegistro(dato, i))}
      </div>
    );
  };

  if (isInfoCargando) {
    return <div className="loader section"></div>;
  }

  if (whichInfo.length === 0) {
    return (
      <div className="cont-sin-resultados">
        <img src={imgVacio} alt="" />
        <span>No se encontraron resultados</span>
      </div>
    );
  }

  return (
    <>
      {[0, 1].map((col) => {
        // Obtener los índices de los elementos que pertenecen a esta columna
        const indicesColumna = whichInfo
          .map((_, index) => (index % 2 === col ? index : null))
          .filter((idx) => idx !== null);

        // Verificar si hay registros en esta columna
        const tieneRegistros = indicesColumna.length > 0;

        return (
          <div key={col}>
            {whichInfo.map((info, index) => {
              if (index % 2 === col) {
                return renderizarItemInfo(info);
              }
              return null;
            })}
            {tieneRegistros && <div className="cont-final-columna"></div>}
          </div>
        );
      })}
    </>
  );
}

ContenidoPrincipal.propTypes = {
  isInfoCargando: PropTypes.bool.isRequired,
  whichInfo: PropTypes.array.isRequired,
  terminosBusqueda: PropTypes.object.isRequired,
  onEditarInfo: PropTypes.func.isRequired,
  onEliminarInfo: PropTypes.func.isRequired,
};

