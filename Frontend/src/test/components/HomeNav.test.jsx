import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import HomeNav from "../../components/HomeNav.jsx";

// Mock de componentes
vi.mock("../../components/Nav.jsx", () => ({
  default: ({ children }) => <nav>{children}</nav>,
}));

vi.mock("../../components/SearchNav.jsx", () => ({
  default: () => <div>SearchNav</div>,
}));

vi.mock("../../components/BuscadorCliente.jsx", () => ({
  default: () => <div>BuscadorCliente</div>,
}));

vi.mock("react-select", () => ({
  default: ({ onChange, value, options }) => (
    <select
      data-testid="select-cliente"
      onChange={(e) => onChange(options[e.target.value])}
      value={options.indexOf(value)}
    >
      {options.map((opt, i) => (
        <option key={i} value={i}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock("../../css/selectNavStyles.js", () => ({
  default: {},
}));

describe("HomeNav", () => {
  const defaultProps = {
    isAdmin: false,
    user: { id: 1, nombre: "Test User" },
    clienteSeleccionado: null,
    opcionesClientes: [],
    refBusquedaCliente: { current: null },
    resultadosBusquedaClientes: [],
    obtenerClientes: vi.fn(),
    buscarCliente: vi.fn(),
    seleccionBusqueda: vi.fn(),
    limpiarClienteSeleccionado: vi.fn(),
    whichInfo: [],
    filtrarPorFecha: false,
    setFiltrarPorFecha: vi.fn(),
    refDato: { current: null },
    refDetalle: { current: null },
    filtroInformacion: vi.fn(),
    isDatoValue: false,
    isDetalleValue: false,
    handleInputDato: vi.fn(),
    handleInputDetalle: vi.fn(),
    isRefrescarInfo: false,
    onUsuarioClick: vi.fn(),
    onRefrescarClick: vi.fn(),
    onCrearRegistroClick: vi.fn(),
    exportarComoPDF: vi.fn(),
    exportarComoExcell: vi.fn(),
    cerrarSesion: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe renderizar correctamente para usuario", () => {
    render(<HomeNav {...defaultProps} />);

    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("debe renderizar selector de cliente para admin", () => {
    render(
      <HomeNav
        {...defaultProps}
        isAdmin={true}
        opcionesClientes={[{ value: 1, label: "Cliente 1" }]}
      />
    );

    expect(screen.getByTestId("select-cliente")).toBeInTheDocument();
    expect(screen.getByText("BuscadorCliente")).toBeInTheDocument();
  });

  it("debe llamar onUsuarioClick al hacer clic en botón usuario", () => {
    const onUsuarioClick = vi.fn();
    render(<HomeNav {...defaultProps} onUsuarioClick={onUsuarioClick} />);

    const button = screen.getByTitle("Gestión de usuario");
    fireEvent.click(button);

    expect(onUsuarioClick).toHaveBeenCalled();
  });

  it("debe llamar onRefrescarClick al hacer clic en botón refrescar (usuario)", () => {
    const onRefrescarClick = vi.fn();
    render(
      <HomeNav
        {...defaultProps}
        onRefrescarClick={onRefrescarClick}
      />
    );

    const button = screen.getByTitle("Refrescar registros");
    fireEvent.click(button);

    expect(onRefrescarClick).toHaveBeenCalled();
  });

  it("debe llamar limpiarClienteSeleccionado al hacer clic en botón limpiar (admin)", () => {
    const limpiarClienteSeleccionado = vi.fn();
    render(
      <HomeNav
        {...defaultProps}
        isAdmin={true}
        clienteSeleccionado={{ value: 1, label: "Cliente" }}
        limpiarClienteSeleccionado={limpiarClienteSeleccionado}
      />
    );

    const button = screen.getByTitle("Restablecer cliente seleccionado");
    fireEvent.click(button);

    expect(limpiarClienteSeleccionado).toHaveBeenCalled();
  });

  it("debe llamar onCrearRegistroClick al hacer clic en botón crear", () => {
    const onCrearRegistroClick = vi.fn();
    render(
      <HomeNav
        {...defaultProps}
        onCrearRegistroClick={onCrearRegistroClick}
      />
    );

    const button = screen.getByTitle("Crear registro");
    fireEvent.click(button);

    expect(onCrearRegistroClick).toHaveBeenCalled();
  });

  it("debe deshabilitar botón crear registro para admin sin cliente seleccionado", () => {
    render(
      <HomeNav
        {...defaultProps}
        isAdmin={true}
        clienteSeleccionado={null}
      />
    );

    const button = screen.getByTitle("Crear registro");
    expect(button).toBeDisabled();
  });

  it("debe llamar exportarComoPDF al hacer clic en botón PDF", () => {
    const exportarComoPDF = vi.fn();
    render(
      <HomeNav
        {...defaultProps}
        exportarComoPDF={exportarComoPDF}
      />
    );

    const button = screen.getByTitle("Exportar a pdf");
    fireEvent.click(button);

    expect(exportarComoPDF).toHaveBeenCalled();
  });

  it("debe llamar exportarComoExcell al hacer clic en botón Excel", () => {
    const exportarComoExcell = vi.fn();
    render(
      <HomeNav
        {...defaultProps}
        exportarComoExcell={exportarComoExcell}
      />
    );

    const button = screen.getByTitle("Exportar a excel");
    fireEvent.click(button);

    expect(exportarComoExcell).toHaveBeenCalled();
  });

  it("debe llamar cerrarSesion al hacer clic en botón cerrar sesión", () => {
    const cerrarSesion = vi.fn();
    render(<HomeNav {...defaultProps} cerrarSesion={cerrarSesion} />);

    const button = screen.getByTitle("Cerrar sesión");
    fireEvent.click(button);

    expect(cerrarSesion).toHaveBeenCalled();
  });

  it("debe mostrar contador de resultados", () => {
    render(<HomeNav {...defaultProps} whichInfo={[1, 2, 3]} />);

    expect(screen.getByText("3 Resultados")).toBeInTheDocument();
  });

  it("debe manejar cambio de filtro por fecha", () => {
    const setFiltrarPorFecha = vi.fn();
    const filtroInformacion = vi.fn();

    render(
      <HomeNav
        {...defaultProps}
        setFiltrarPorFecha={setFiltrarPorFecha}
        filtroInformacion={filtroInformacion}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(setFiltrarPorFecha).toHaveBeenCalled();
    expect(filtroInformacion).toHaveBeenCalled();
  });
});

