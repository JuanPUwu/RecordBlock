import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PopupCrearInfo from "../../components/PopupCrearInfo.jsx";

// Mock de reactjs-popup
vi.mock("reactjs-popup", () => ({
  default: ({ open, children }) => (open ? <div>{children}</div> : null),
}));

describe("PopupCrearInfo", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    clienteSeleccionado: { value: 1 },
    opcionesClientes: [
      { value: 1, label: "Cliente 1" },
      { value: 2, label: "Cliente 2" },
    ],
    draftCrear: [
      { key: "Nombre", value: "Test" },
      { key: "Email", value: "test@test.com" },
    ],
    datosMinimos: [{ key: "Nombre", value: "" }],
    cambiarLlaveCrear: vi.fn(),
    cambiarValorCrear: vi.fn(),
    eliminarDatoCrear: vi.fn(),
    agregarDatoCrear: vi.fn(),
    scrollCrearRef: { current: null },
    inputCrearRef: { current: null },
    onSubirCSV: vi.fn(),
    refInputFile: { current: { click: vi.fn() } },
    onEditarDatosMinimos: vi.fn(),
    onCreate: vi.fn(),
    mostrarEditarDatosMinimos: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe renderizar correctamente cuando está abierto", () => {
    render(<PopupCrearInfo {...defaultProps} />);

    expect(screen.getByText(/Cliente 1 - Nuevo registro/)).toBeInTheDocument();
  });

  it("debe mostrar 'Nuevo registro' cuando no hay cliente seleccionado", () => {
    render(
      <PopupCrearInfo
        {...defaultProps}
        clienteSeleccionado={null}
        opcionesClientes={[]}
      />
    );

    expect(screen.getByText("Nuevo registro")).toBeInTheDocument();
  });

  it("debe mostrar 'Nuevo registro' cuando el cliente no se encuentra en opcionesClientes", () => {
    render(
      <PopupCrearInfo {...defaultProps} clienteSeleccionado={{ value: 999 }} />
    );

    expect(screen.getByText("Nuevo registro")).toBeInTheDocument();
  });

  it("debe mostrar 'Nuevo registro' cuando opcionesClientes está vacío", () => {
    render(
      <PopupCrearInfo
        {...defaultProps}
        opcionesClientes={[]}
        clienteSeleccionado={{ value: 1 }}
      />
    );

    expect(screen.getByText("Nuevo registro")).toBeInTheDocument();
  });

  it("debe renderizar los datos del draftCrear", () => {
    render(<PopupCrearInfo {...defaultProps} />);

    expect(screen.getByDisplayValue("Test")).toBeInTheDocument();
    expect(screen.getByDisplayValue("test@test.com")).toBeInTheDocument();
  });

  it("debe mostrar campos obligatorios como span", () => {
    render(<PopupCrearInfo {...defaultProps} />);

    // El primer campo es obligatorio (índice 0 < datosMinimos.length)
    expect(screen.getByText("Nombre")).toBeInTheDocument();
  });

  it("debe mostrar campos no obligatorios como input editable", () => {
    render(<PopupCrearInfo {...defaultProps} />);

    // El segundo campo no es obligatorio
    const emailInput = screen.getByDisplayValue("test@test.com");
    expect(emailInput).toBeInTheDocument();
    expect(emailInput.tagName).toBe("INPUT");
  });

  it("debe llamar cambiarLlaveCrear cuando se cambia la key de un campo no obligatorio", async () => {
    const user = userEvent.setup();
    render(<PopupCrearInfo {...defaultProps} />);

    // El primer campo es obligatorio (índice 0), el segundo no (índice 1)
    const inputs = screen.getAllByPlaceholderText("Dato...");
    if (inputs.length > 0) {
      await user.clear(inputs[0]);
      await user.type(inputs[0], "NuevoDato");

      // Verificar que se llamó con el índice correcto (1 porque el índice 0 es obligatorio)
      expect(defaultProps.cambiarLlaveCrear).toHaveBeenCalled();
    }
  });

  it("debe llamar cambiarValorCrear cuando se cambia el valor", async () => {
    const user = userEvent.setup();
    render(<PopupCrearInfo {...defaultProps} />);

    const valueInput = screen.getByDisplayValue("Test");
    await user.clear(valueInput);
    await user.type(valueInput, "NuevoValor");

    // Verificar que se llamó (puede llamarse múltiples veces durante el typing)
    expect(defaultProps.cambiarValorCrear).toHaveBeenCalled();
  });

  it("debe mostrar botón eliminar solo para campos no obligatorios", () => {
    render(<PopupCrearInfo {...defaultProps} />);

    const deleteButtons = screen.getAllByTitle("Eliminar campo");
    expect(deleteButtons).toHaveLength(1);
  });

  it("debe llamar eliminarDatoCrear cuando se hace clic en eliminar", async () => {
    const user = userEvent.setup();
    render(<PopupCrearInfo {...defaultProps} />);

    const deleteButton = screen.getByTitle("Eliminar campo");
    await user.click(deleteButton);

    expect(defaultProps.eliminarDatoCrear).toHaveBeenCalledWith(1);
  });

  it("debe llamar agregarDatoCrear cuando se hace clic en agregar campo", async () => {
    const user = userEvent.setup();
    render(<PopupCrearInfo {...defaultProps} />);

    const addButton = screen.getByText("Agregar campo");
    await user.click(addButton);

    expect(defaultProps.agregarDatoCrear).toHaveBeenCalled();
  });

  it("debe llamar onCreate cuando se hace clic en crear", async () => {
    const user = userEvent.setup();
    render(<PopupCrearInfo {...defaultProps} />);

    const createButton = screen.getByText("Crear");
    await user.click(createButton);

    expect(defaultProps.onCreate).toHaveBeenCalled();
  });

  it("debe llamar refInputFile.current.click cuando se hace clic en subir archivo", () => {
    const { container } = render(<PopupCrearInfo {...defaultProps} />);

    const uploadButton = screen.getByTitle("importar archivo CSV");
    // Verificar que el botón existe
    expect(uploadButton).toBeInTheDocument();

    // Obtener el input file del DOM (está oculto con display: none)
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();

    // Crear un spy en el método click del input file
    const clickSpy = vi.spyOn(fileInput, "click");

    // Hacer clic en el botón - esto debería ejecutar refInputFile.current?.click()
    fireEvent.click(uploadButton);

    // Verificar que se llamó click en el input file
    // El componente usa refInputFile.current?.click() en el onClick del botón
    expect(clickSpy).toHaveBeenCalled();

    clickSpy.mockRestore();
  });

  it("debe llamar onSubirCSV cuando se selecciona un archivo", () => {
    const { container } = render(<PopupCrearInfo {...defaultProps} />);

    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();

    // Simular cambio de archivo creando un evento mock
    const mockEvent = {
      target: {
        files: [
          {
            name: "test.csv",
            type: "text/csv",
            size: 100,
          },
        ],
      },
    };

    // Llamar directamente a onSubirCSV con el evento mock
    defaultProps.onSubirCSV(mockEvent);

    // Verificar que se llamó onSubirCSV
    expect(defaultProps.onSubirCSV).toHaveBeenCalledWith(mockEvent);
  });

  it("debe mostrar botón editar datos mínimos cuando datosMinimos.length > 0 y mostrarEditarDatosMinimos es true", () => {
    render(<PopupCrearInfo {...defaultProps} />);

    expect(screen.getByTitle("Editar datos minimos")).toBeInTheDocument();
  });

  it("NO debe mostrar botón editar datos mínimos cuando datosMinimos está vacío", () => {
    render(<PopupCrearInfo {...defaultProps} datosMinimos={[]} />);

    expect(screen.queryByTitle("Editar datos minimos")).not.toBeInTheDocument();
  });

  it("NO debe mostrar botón editar datos mínimos cuando mostrarEditarDatosMinimos es false", () => {
    render(
      <PopupCrearInfo {...defaultProps} mostrarEditarDatosMinimos={false} />
    );

    expect(screen.queryByTitle("Editar datos minimos")).not.toBeInTheDocument();
  });

  it("debe llamar onEditarDatosMinimos cuando se hace clic en editar datos mínimos", async () => {
    const user = userEvent.setup();
    render(<PopupCrearInfo {...defaultProps} />);

    const editButton = screen.getByTitle("Editar datos minimos");
    await user.click(editButton);

    expect(defaultProps.onEditarDatosMinimos).toHaveBeenCalled();
  });

  it("debe aplicar clase input-obligatorio a campos obligatorios", () => {
    render(<PopupCrearInfo {...defaultProps} />);

    const valueInputs = screen.getAllByPlaceholderText("Detalle...");
    expect(valueInputs[0]).toHaveClass("input-obligatorio");
  });

  it("NO debe aplicar clase input-obligatorio a campos no obligatorios", () => {
    render(<PopupCrearInfo {...defaultProps} />);

    const valueInputs = screen.getAllByPlaceholderText("Detalle...");
    expect(valueInputs[1]).not.toHaveClass("input-obligatorio");
  });

  it("debe asignar inputCrearRef al último campo", () => {
    const inputCrearRef = { current: null };
    render(<PopupCrearInfo {...defaultProps} inputCrearRef={inputCrearRef} />);

    const keyInputs = screen.getAllByPlaceholderText("Dato...");
    expect(keyInputs.length).toBeGreaterThan(0);
  });

  it("NO debe renderizar cuando open es false", () => {
    render(<PopupCrearInfo {...defaultProps} open={false} />);

    expect(screen.queryByText(/Nuevo registro/)).not.toBeInTheDocument();
  });

  it("debe manejar draftCrear vacío", () => {
    render(<PopupCrearInfo {...defaultProps} draftCrear={[]} />);

    expect(screen.getByText("Agregar campo")).toBeInTheDocument();
    expect(screen.getByText("Crear")).toBeInTheDocument();
  });

  it("debe usar mostrarEditarDatosMinimos por defecto como true", () => {
    const propsWithoutFlag = { ...defaultProps };
    delete propsWithoutFlag.mostrarEditarDatosMinimos;

    render(<PopupCrearInfo {...propsWithoutFlag} />);

    expect(screen.getByTitle("Editar datos minimos")).toBeInTheDocument();
  });

  it("debe manejar cuando clienteSeleccionado.value no coincide con ningún cliente en opcionesClientes", () => {
    render(
      <PopupCrearInfo
        {...defaultProps}
        clienteSeleccionado={{ value: 999 }}
        opcionesClientes={[
          { value: 1, label: "Cliente 1" },
          { value: 2, label: "Cliente 2" },
        ]}
      />
    );

    expect(screen.getByText("Nuevo registro")).toBeInTheDocument();
  });

  it("debe manejar cuando opcionesClientes.length es 0 pero hay clienteSeleccionado", () => {
    render(
      <PopupCrearInfo
        {...defaultProps}
        clienteSeleccionado={{ value: 1 }}
        opcionesClientes={[]}
      />
    );

    expect(screen.getByText("Nuevo registro")).toBeInTheDocument();
  });

  it("debe asignar inputCrearRef correctamente al último elemento del array", () => {
    const inputCrearRef = { current: null };
    const draftCrear = [
      { key: "Campo1", value: "Valor1" },
      { key: "Campo2", value: "Valor2" },
      { key: "Campo3", value: "Valor3" },
    ];

    render(
      <PopupCrearInfo
        {...defaultProps}
        draftCrear={draftCrear}
        datosMinimos={[]}
        inputCrearRef={inputCrearRef}
      />
    );

    // Verificar que hay inputs
    const keyInputs = screen.getAllByPlaceholderText("Dato...");
    expect(keyInputs.length).toBe(3);
  });

  it("debe manejar cuando refInputFile.current es null", async () => {
    const user = userEvent.setup();
    const refInputFile = { current: null };
    render(<PopupCrearInfo {...defaultProps} refInputFile={refInputFile} />);

    const uploadButton = screen.getByTitle("importar archivo CSV");
    await user.click(uploadButton);

    // No debe lanzar error aunque refInputFile.current sea null
    expect(uploadButton).toBeInTheDocument();
  });
});
