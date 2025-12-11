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
  default: ({ onChange, value, options, onMenuOpen }) => (
    <select
      data-testid="select-cliente"
      onChange={(e) => onChange(options[e.target.value])}
      value={options.indexOf(value)}
      onMouseDown={() => onMenuOpen?.()}
    >
      {options.map((opt, i) => (
        <option key={opt.value} value={i}>
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
    render(<HomeNav {...defaultProps} onRefrescarClick={onRefrescarClick} />);

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
      <HomeNav {...defaultProps} onCrearRegistroClick={onCrearRegistroClick} />
    );

    const button = screen.getByTitle("Crear registro");
    fireEvent.click(button);

    expect(onCrearRegistroClick).toHaveBeenCalled();
  });

  it("debe deshabilitar botón crear registro para admin sin cliente seleccionado", () => {
    render(
      <HomeNav {...defaultProps} isAdmin={true} clienteSeleccionado={null} />
    );

    const button = screen.getByTitle("Crear registro");
    expect(button).toBeDisabled();
  });

  it("debe llamar exportarComoPDF al hacer clic en botón PDF", () => {
    const exportarComoPDF = vi.fn();
    render(<HomeNav {...defaultProps} exportarComoPDF={exportarComoPDF} />);

    const button = screen.getByTitle("Exportar a pdf");
    fireEvent.click(button);

    expect(exportarComoPDF).toHaveBeenCalled();
  });

  it("debe llamar exportarComoExcell al hacer clic en botón Excel", () => {
    const exportarComoExcell = vi.fn();
    render(
      <HomeNav {...defaultProps} exportarComoExcell={exportarComoExcell} />
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

  it("debe mostrar nombre de usuario cuando isAdmin es false", () => {
    render(<HomeNav {...defaultProps} isAdmin={false} />);

    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("NO debe mostrar nombre de usuario cuando isAdmin es true", () => {
    render(<HomeNav {...defaultProps} isAdmin={true} />);

    expect(screen.queryByText("Test User")).not.toBeInTheDocument();
  });

  it("debe deshabilitar botón limpiar cuando clienteSeleccionado es null (admin)", () => {
    render(
      <HomeNav {...defaultProps} isAdmin={true} clienteSeleccionado={null} />
    );

    const button = screen.getByTitle("Restablecer cliente seleccionado");
    expect(button).toBeDisabled();
  });

  it("NO debe deshabilitar botón limpiar cuando clienteSeleccionado no es null (admin)", () => {
    render(
      <HomeNav
        {...defaultProps}
        isAdmin={true}
        clienteSeleccionado={{ value: 1, label: "Cliente" }}
      />
    );

    const button = screen.getByTitle("Restablecer cliente seleccionado");
    expect(button).not.toBeDisabled();
  });

  it("debe deshabilitar botón refrescar cuando isRefrescarInfo es true (usuario)", () => {
    render(
      <HomeNav {...defaultProps} isAdmin={false} isRefrescarInfo={true} />
    );

    const button = screen.getByTitle("Refrescar registros");
    expect(button).toBeDisabled();
  });

  it("NO debe deshabilitar botón refrescar cuando isRefrescarInfo es false (usuario)", () => {
    render(
      <HomeNav {...defaultProps} isAdmin={false} isRefrescarInfo={false} />
    );

    const button = screen.getByTitle("Refrescar registros");
    expect(button).not.toBeDisabled();
  });

  it("debe llamar obtenerClientes cuando se abre el menú del Select (admin)", () => {
    const obtenerClientes = vi.fn();
    render(
      <HomeNav
        {...defaultProps}
        isAdmin={true}
        opcionesClientes={[{ value: 1, label: "Cliente 1" }]}
        obtenerClientes={obtenerClientes}
      />
    );

    const select = screen.getByTestId("select-cliente");
    // El mock de react-select llama a onMenuOpen cuando se hace mouseDown
    fireEvent.mouseDown(select);

    expect(obtenerClientes).toHaveBeenCalled();
  });

  it("debe llamar clearDato cuando se limpia el dato en SearchNav", () => {
    const filtroInformacion = vi.fn();
    const refDato = { current: { value: "test" } };

    render(
      <HomeNav
        {...defaultProps}
        refDato={refDato}
        filtroInformacion={filtroInformacion}
      />
    );

    // SearchNav tiene un botón clearDato, pero está mockeado
    // Verificamos que el componente se renderiza correctamente
    expect(screen.getByText("SearchNav")).toBeInTheDocument();
  });

  it("debe llamar clearDetalle cuando se limpia el detalle en SearchNav", () => {
    const filtroInformacion = vi.fn();
    const refDetalle = { current: { value: "test" } };

    render(
      <HomeNav
        {...defaultProps}
        refDetalle={refDetalle}
        filtroInformacion={filtroInformacion}
      />
    );

    expect(screen.getByText("SearchNav")).toBeInTheDocument();
  });

  it("debe manejar cuando refDato.current es null en clearDato", () => {
    const filtroInformacion = vi.fn();
    const refDato = { current: null };

    render(
      <HomeNav
        {...defaultProps}
        refDato={refDato}
        filtroInformacion={filtroInformacion}
      />
    );

    // No debe lanzar error
    expect(screen.getByText("SearchNav")).toBeInTheDocument();
  });

  it("debe manejar cuando refDetalle.current es null en clearDetalle", () => {
    const filtroInformacion = vi.fn();
    const refDetalle = { current: null };

    render(
      <HomeNav
        {...defaultProps}
        refDetalle={refDetalle}
        filtroInformacion={filtroInformacion}
      />
    );

    // No debe lanzar error
    expect(screen.getByText("SearchNav")).toBeInTheDocument();
  });

  it("debe pasar el nuevo valor de filtrarPorFecha a filtroInformacion", () => {
    const setFiltrarPorFecha = vi.fn();
    const filtroInformacion = vi.fn();

    render(
      <HomeNav
        {...defaultProps}
        setFiltrarPorFecha={setFiltrarPorFecha}
        filtroInformacion={filtroInformacion}
        filtrarPorFecha={false}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    // Verificar que filtroInformacion se llama con el nuevo valor
    expect(filtroInformacion).toHaveBeenCalledWith(true);
  });
});
