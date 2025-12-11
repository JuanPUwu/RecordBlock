import PropTypes from "prop-types";
import Nav from "./Nav.jsx";
import SearchNav from "./SearchNav.jsx";
import Select from "react-select";
import selectNavStyles from "../css/selectNavStyles.js";

// Imágenes
import imgUsuario from "../assets/img/usuario.webp";
import imgLimpiar from "../assets/img/reset.webp";
import imgSearch from "../assets/img/busqueda.webp";
import imgCrearRegistro from "../assets/img/flecha.webp";
import imgExcell from "../assets/img/excell.webp";
import imgPdf from "../assets/img/pdf.webp";
import imgSalir from "../assets/img/salir.webp";

/**
 * Componente de navegación reutilizable para HomeUsuario y HomeAdmin
 */
export default function HomeNav({
  isAdmin,
  user,
  // Clientes (solo admin)
  clienteSeleccionado,
  opcionesClientes,
  refBusquedaCliente,
  resultadosBusquedaClientes,
  obtenerClientes,
  buscarCliente,
  seleccionBusqueda,
  limpiarClienteSeleccionado,
  // Información
  whichInfo,
  filtrarPorFecha,
  setFiltrarPorFecha,
  refDato,
  refDetalle,
  filtroInformacion,
  isDatoValue,
  isDetalleValue,
  // Estados
  isRefrescarInfo,
  // Handlers
  onUsuarioClick,
  onRefrescarClick,
  onCrearRegistroClick,
  exportarComoPDF,
  exportarComoExcell,
  cerrarSesion,
}) {
  return (
    <Nav>
      {/* Botón Usuario/Usuarios */}
      <button
        onClick={onUsuarioClick}
        className={`btn-nav btn-nav-primary ${!isAdmin ? "btn-user" : ""}`}
        title={isAdmin ? "Gestión de usuarios" : "Gestión de usuario"}
      >
        <img src={imgUsuario} alt="" />
        {!isAdmin && <span>{user.nombre}</span>}
      </button>

      {/* Selector de cliente (solo admin) */}
      {isAdmin && (
        <>
          <Select
            styles={selectNavStyles}
            options={opcionesClientes}
            onChange={seleccionBusqueda}
            onMenuOpen={() => obtenerClientes()}
            value={clienteSeleccionado}
            isSearchable={false}
            placeholder="Seleccione un cliente..."
          />
          <span>o</span>
          <div className="cont-inpNav">
            <input
              type="text"
              placeholder="Busque por cliente..."
              onInput={(e) => buscarCliente(e)}
              ref={refBusquedaCliente}
            />
            <img src={imgSearch} alt="" />
            {resultadosBusquedaClientes.length > 0 && (
              <div>
                {resultadosBusquedaClientes.map((c) => (
                  <button key={c.value} onClick={() => seleccionBusqueda(c)}>
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Botón Limpiar/Refrescar */}
      {isAdmin ? (
        <button
          onClick={limpiarClienteSeleccionado}
          className={`btn-nav btn-nav-secondary ${
            clienteSeleccionado === null ? "btn-disabled" : ""
          }`}
          title="Restablecer cliente seleccionado"
          disabled={clienteSeleccionado === null}
        >
          <img src={imgLimpiar} alt="" />
        </button>
      ) : (
        <button
          onClick={onRefrescarClick}
          className={`btn-nav btn-nav-secondary ${
            isRefrescarInfo ? "btn-disabled" : ""
          }`}
          disabled={isRefrescarInfo}
          title="Refrescar registros"
        >
          <img src={imgLimpiar} alt="" />
        </button>
      )}

      {/* Botón Crear Registro */}
      <button
        className={`btn-nav btn-nav-success ${
          isAdmin && clienteSeleccionado === null ? "btn-disabled" : ""
        }`}
        title="Crear registro"
        disabled={isAdmin && clienteSeleccionado === null}
        onClick={onCrearRegistroClick}
      >
        <img src={imgCrearRegistro} alt="" />
      </button>

      {/* Búsqueda */}
      <SearchNav
        refDato={refDato}
        onInputDato={filtroInformacion}
        refDetalle={refDetalle}
        onInputDetalle={filtroInformacion}
        clearDato={() => {
          refDato.current.value = "";
          filtroInformacion();
        }}
        clearDetalle={() => {
          refDetalle.current.value = "";
          filtroInformacion();
        }}
        isDatoValue={isDatoValue}
        isDetalleValue={isDetalleValue}
      />

      {/* Botones de Exportación */}
      <button
        onClick={() => exportarComoPDF()}
        className="btn-nav btn-nav-danger"
        title="Exportar a pdf"
      >
        <img src={imgPdf} alt="" />
      </button>
      <button
        onClick={() => exportarComoExcell()}
        className="btn-nav btn-nav-success"
        title="Exportar a excel"
      >
        <img src={imgExcell} alt="" />
      </button>

      {/* Contador de resultados y filtro */}
      <div className="cont-cant-resultados">
        <span>{whichInfo.length} Resultados</span>
        <label
          className="checkbox-moderno"
          aria-label="Mostrar licenamiento proximo a vencer"
          title="Mostrar licenamiento proximo a vencer"
        >
          <input
            type="checkbox"
            checked={filtrarPorFecha}
            onChange={(e) => {
              const nuevoValor = e.target.checked;
              setFiltrarPorFecha(nuevoValor);
              filtroInformacion(nuevoValor);
            }}
          />
          <span className="checkbox-slider"></span>
        </label>
      </div>

      {/* Botón Cerrar Sesión */}
      <button
        onClick={cerrarSesion}
        className="btn-nav btn-nav-danger"
        title="Cerrar sesión"
      >
        <img src={imgSalir} alt="" />
      </button>
    </Nav>
  );
}

HomeNav.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
  clienteSeleccionado: PropTypes.object,
  opcionesClientes: PropTypes.array,
  refBusquedaCliente: PropTypes.object,
  resultadosBusquedaClientes: PropTypes.array,
  obtenerClientes: PropTypes.func,
  buscarCliente: PropTypes.func,
  seleccionBusqueda: PropTypes.func,
  limpiarClienteSeleccionado: PropTypes.func,
  whichInfo: PropTypes.array.isRequired,
  filtrarPorFecha: PropTypes.bool.isRequired,
  setFiltrarPorFecha: PropTypes.func.isRequired,
  refDato: PropTypes.object.isRequired,
  refDetalle: PropTypes.object.isRequired,
  filtroInformacion: PropTypes.func.isRequired,
  isDatoValue: PropTypes.bool.isRequired,
  isDetalleValue: PropTypes.bool.isRequired,
  isRefrescarInfo: PropTypes.bool,
  onUsuarioClick: PropTypes.func.isRequired,
  onRefrescarClick: PropTypes.func.isRequired,
  onCrearRegistroClick: PropTypes.func.isRequired,
  exportarComoPDF: PropTypes.func.isRequired,
  exportarComoExcell: PropTypes.func.isRequired,
  cerrarSesion: PropTypes.func.isRequired,
};

