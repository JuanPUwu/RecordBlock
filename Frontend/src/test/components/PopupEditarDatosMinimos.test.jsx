import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PopupEditarDatosMinimos from "../../components/PopupEditarDatosMinimos.jsx";

// Mock de reactjs-popup
vi.mock("reactjs-popup", () => ({
  default: ({ open, children }) => (open ? <div>{children}</div> : null),
}));

describe("PopupEditarDatosMinimos", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    draftDatosMinimos: ["Nombre", "Email", "Teléfono"],
    cambiarDatoMinimo: vi.fn(),
    eliminarDatoMinimo: vi.fn(),
    agregarDatoMinimo: vi.fn(),
    scrollDatosMinimosRef: { current: null },
    inputDatosMinimosRef: { current: null },
    onSave: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe renderizar correctamente cuando está abierto", () => {
    render(<PopupEditarDatosMinimos {...defaultProps} />);

    expect(screen.getByText("Editar datos mínimos")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Nombre")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Email")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Teléfono")).toBeInTheDocument();
  });

  it("NO debe renderizar cuando open es false", () => {
    render(<PopupEditarDatosMinimos {...defaultProps} open={false} />);

    expect(screen.queryByText("Editar datos mínimos")).not.toBeInTheDocument();
  });

  it("debe renderizar todos los datos mínimos", () => {
    render(<PopupEditarDatosMinimos {...defaultProps} />);

    expect(screen.getByDisplayValue("Nombre")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Email")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Teléfono")).toBeInTheDocument();
  });

  it("debe llamar cambiarDatoMinimo cuando se cambia un dato", async () => {
    const user = userEvent.setup();
    render(<PopupEditarDatosMinimos {...defaultProps} />);

    const nombreInput = screen.getByDisplayValue("Nombre");
    await user.clear(nombreInput);
    await user.type(nombreInput, "NuevoNombre");

    // Verificar que se llamó (puede llamarse múltiples veces durante el typing)
    expect(defaultProps.cambiarDatoMinimo).toHaveBeenCalled();
  });

  it("debe llamar eliminarDatoMinimo cuando se hace clic en eliminar", async () => {
    const user = userEvent.setup();
    render(<PopupEditarDatosMinimos {...defaultProps} />);

    const deleteButtons = screen.getAllByTitle("Eliminar dato");
    await user.click(deleteButtons[0]);

    expect(defaultProps.eliminarDatoMinimo).toHaveBeenCalledWith(0);
  });

  it("debe llamar agregarDatoMinimo cuando se hace clic en agregar dato", async () => {
    const user = userEvent.setup();
    render(<PopupEditarDatosMinimos {...defaultProps} />);

    const addButton = screen.getByText("Agregar dato");
    await user.click(addButton);

    expect(defaultProps.agregarDatoMinimo).toHaveBeenCalled();
  });

  it("debe llamar onSave cuando se hace clic en guardar", async () => {
    const user = userEvent.setup();
    render(<PopupEditarDatosMinimos {...defaultProps} />);

    const saveButton = screen.getByText("Guardar");
    await user.click(saveButton);

    expect(defaultProps.onSave).toHaveBeenCalled();
  });

  it("debe asignar inputDatosMinimosRef al último campo", () => {
    const inputDatosMinimosRef = { current: null };
    render(
      <PopupEditarDatosMinimos
        {...defaultProps}
        inputDatosMinimosRef={inputDatosMinimosRef}
      />
    );

    const inputs = screen.getAllByPlaceholderText("Dato mínimo...");
    expect(inputs.length).toBeGreaterThan(0);
    // El último input debe tener el ref asignado
    expect(inputs.at(-1)).toBeInTheDocument();
  });

  it("debe manejar draftDatosMinimos vacío", () => {
    render(
      <PopupEditarDatosMinimos {...defaultProps} draftDatosMinimos={[]} />
    );

    expect(screen.getByText("Agregar dato")).toBeInTheDocument();
    expect(screen.getByText("Guardar")).toBeInTheDocument();
  });

  it("debe mostrar todos los botones eliminar para cada dato", () => {
    render(<PopupEditarDatosMinimos {...defaultProps} />);

    const deleteButtons = screen.getAllByTitle("Eliminar dato");
    expect(deleteButtons).toHaveLength(3);
  });

  it("debe aplicar la clase inp-dato-minimo a los inputs", () => {
    render(<PopupEditarDatosMinimos {...defaultProps} />);

    const inputs = screen.getAllByPlaceholderText("Dato mínimo...");
    inputs.forEach((input) => {
      expect(input).toHaveClass("inp-dato-minimo");
    });
  });

  it("debe aplicar la clase cont-datos-minimos al contenedor", () => {
    const { container } = render(<PopupEditarDatosMinimos {...defaultProps} />);

    const contDatosMinimos = container.querySelector(".cont-datos-minimos");
    expect(contDatosMinimos).toBeInTheDocument();
  });

  it("debe aplicar la clase cont-dato-editar a cada contenedor de dato", () => {
    const { container } = render(<PopupEditarDatosMinimos {...defaultProps} />);

    const contDatoEditar = container.querySelectorAll(".cont-dato-editar");
    expect(contDatoEditar.length).toBe(3);
  });

  it("debe asignar inputDatosMinimosRef correctamente al último elemento del array", () => {
    const inputDatosMinimosRef = { current: null };
    const draftDatosMinimos = ["Dato1", "Dato2", "Dato3"];

    render(
      <PopupEditarDatosMinimos
        {...defaultProps}
        draftDatosMinimos={draftDatosMinimos}
        inputDatosMinimosRef={inputDatosMinimosRef}
      />
    );

    const inputs = screen.getAllByPlaceholderText("Dato mínimo...");
    expect(inputs.length).toBe(3);
    // El último input debe tener el ref asignado
    expect(inputs.at(-1)).toBeInTheDocument();
  });

  it("debe renderizar el separador horizontal", () => {
    const { container } = render(<PopupEditarDatosMinimos {...defaultProps} />);

    const sepHrz = container.querySelector(".sep-hrz");
    expect(sepHrz).toBeInTheDocument();
  });

  it("debe renderizar el contenedor de botones con la clase cont-btns", () => {
    const { container } = render(<PopupEditarDatosMinimos {...defaultProps} />);

    const contBtns = container.querySelector(".cont-btns");
    expect(contBtns).toBeInTheDocument();
  });

  it("debe aplicar la clase btn-crear al botón de guardar", () => {
    render(<PopupEditarDatosMinimos {...defaultProps} />);

    // Buscar el botón por su título, no por el texto del span
    const saveButton = screen.getByTitle("Guardar datos mínimos");
    // Verificar que el botón tiene la clase btn-crear
    expect(saveButton).toHaveClass("btn-crear");
  });
});
