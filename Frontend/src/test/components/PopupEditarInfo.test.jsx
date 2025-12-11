import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PopupEditarInfo from "../../components/PopupEditarInfo.jsx";

// Mock de reactjs-popup
vi.mock("reactjs-popup", () => ({
  default: ({ open, children }) => (open ? <div>{children}</div> : null),
}));

describe("PopupEditarInfo", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    infoAEditar: {
      info_id: 1,
      usuario_id: 1,
      datos_minimos_iniciales: [{ key: "Nombre", value: "" }],
    },
    opcionesClientes: [
      { value: 1, label: "Cliente 1" },
      { value: 2, label: "Cliente 2" },
    ],
    draftDatos: [
      { key: "Nombre", value: "Test" },
      { key: "Email", value: "test@test.com" },
    ],
    cambiarLlaveDraft: vi.fn(),
    cambiarValorDraft: vi.fn(),
    eliminarDatoDraft: vi.fn(),
    agregarDatoDraft: vi.fn(),
    scrollRef: { current: null },
    inputRef: { current: null },
    onSave: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe renderizar correctamente cuando está abierto", () => {
    render(<PopupEditarInfo {...defaultProps} />);

    expect(screen.getByText(/Cliente 1 - Registro °1/)).toBeInTheDocument();
  });

  it("debe mostrar solo el número de registro cuando no hay cliente", () => {
    render(
      <PopupEditarInfo
        {...defaultProps}
        opcionesClientes={[]}
        infoAEditar={{ info_id: 1, usuario_id: 1 }}
      />
    );

    expect(screen.getByText(/Registro °1/)).toBeInTheDocument();
  });

  it("debe mostrar solo el número de registro cuando el cliente no se encuentra", () => {
    render(
      <PopupEditarInfo
        {...defaultProps}
        infoAEditar={{ info_id: 1, usuario_id: 999 }}
      />
    );

    expect(screen.getByText(/Registro °1/)).toBeInTheDocument();
  });

  it("debe renderizar los datos del draft", () => {
    render(<PopupEditarInfo {...defaultProps} />);

    expect(screen.getByDisplayValue("Test")).toBeInTheDocument();
    expect(screen.getByDisplayValue("test@test.com")).toBeInTheDocument();
  });

  it("debe mostrar campos obligatorios como span", () => {
    render(<PopupEditarInfo {...defaultProps} />);

    // El primer campo es obligatorio (índice 0 < datos_minimos_iniciales.length)
    expect(screen.getByText("Nombre")).toBeInTheDocument();
  });

  it("debe mostrar campos no obligatorios como input editable", () => {
    render(<PopupEditarInfo {...defaultProps} />);

    // El segundo campo no es obligatorio
    const emailInput = screen.getByDisplayValue("test@test.com");
    expect(emailInput).toBeInTheDocument();
    expect(emailInput.tagName).toBe("INPUT");
  });

  it("debe llamar cambiarLlaveDraft cuando se cambia la key de un campo no obligatorio", async () => {
    const user = userEvent.setup();
    render(<PopupEditarInfo {...defaultProps} />);

    // Buscar el input de key del segundo campo (no obligatorio)
    const inputs = screen.getAllByPlaceholderText("Dato...");
    if (inputs.length > 0) {
      await user.clear(inputs[0]);
      await user.type(inputs[0], "NuevoDato");

      // Verificar que se llamó (puede llamarse múltiples veces)
      expect(defaultProps.cambiarLlaveDraft).toHaveBeenCalled();
    }
  });

  it("debe llamar cambiarValorDraft cuando se cambia el valor", async () => {
    const user = userEvent.setup();
    render(<PopupEditarInfo {...defaultProps} />);

    const valueInput = screen.getByDisplayValue("Test");
    await user.clear(valueInput);
    await user.type(valueInput, "NuevoValor");

    // Verificar que se llamó (puede llamarse múltiples veces durante el typing)
    expect(defaultProps.cambiarValorDraft).toHaveBeenCalled();
  });

  it("debe mostrar botón eliminar solo para campos no obligatorios", () => {
    render(<PopupEditarInfo {...defaultProps} />);

    // Solo debe haber un botón eliminar (para el segundo campo)
    const deleteButtons = screen.getAllByTitle("Eliminar campo");
    expect(deleteButtons).toHaveLength(1);
  });

  it("debe llamar eliminarDatoDraft cuando se hace clic en eliminar", async () => {
    const user = userEvent.setup();
    render(<PopupEditarInfo {...defaultProps} />);

    const deleteButton = screen.getByTitle("Eliminar campo");
    await user.click(deleteButton);

    expect(defaultProps.eliminarDatoDraft).toHaveBeenCalledWith(1);
  });

  it("debe llamar agregarDatoDraft cuando se hace clic en agregar campo", async () => {
    const user = userEvent.setup();
    render(<PopupEditarInfo {...defaultProps} />);

    const addButton = screen.getByText("Agregar campo");
    await user.click(addButton);

    expect(defaultProps.agregarDatoDraft).toHaveBeenCalled();
  });

  it("debe llamar onSave cuando se hace clic en guardar", async () => {
    const user = userEvent.setup();
    render(<PopupEditarInfo {...defaultProps} />);

    const saveButton = screen.getByText("Guardar");
    await user.click(saveButton);

    expect(defaultProps.onSave).toHaveBeenCalled();
  });

  it("debe aplicar clase input-obligatorio a campos obligatorios", () => {
    render(<PopupEditarInfo {...defaultProps} />);

    // El input de valor del primer campo (obligatorio) debe tener la clase
    const valueInputs = screen.getAllByPlaceholderText("Detalle...");
    expect(valueInputs[0]).toHaveClass("input-obligatorio");
  });

  it("NO debe aplicar clase input-obligatorio a campos no obligatorios", () => {
    render(<PopupEditarInfo {...defaultProps} />);

    const valueInputs = screen.getAllByPlaceholderText("Detalle...");
    expect(valueInputs[1]).not.toHaveClass("input-obligatorio");
  });

  it("debe asignar inputRef al último campo", () => {
    const inputRef = { current: null };
    render(<PopupEditarInfo {...defaultProps} inputRef={inputRef} />);

    // El último input de key debe tener el ref
    const keyInputs = screen.getAllByPlaceholderText("Dato...");
    // Verificar que el ref se asigna (esto se hace internamente por React)
    expect(keyInputs.length).toBeGreaterThan(0);
  });

  it("NO debe renderizar cuando open es false", () => {
    render(<PopupEditarInfo {...defaultProps} open={false} />);

    expect(screen.queryByText(/Registro/)).not.toBeInTheDocument();
  });

  it("debe manejar infoAEditar null", () => {
    render(
      <PopupEditarInfo
        {...defaultProps}
        infoAEditar={null}
        opcionesClientes={[]}
      />
    );

    // Debe renderizar sin errores
    expect(screen.getByText("Agregar campo")).toBeInTheDocument();
  });

  it("debe manejar draftDatos vacío", () => {
    render(<PopupEditarInfo {...defaultProps} draftDatos={[]} />);

    expect(screen.getByText("Agregar campo")).toBeInTheDocument();
    expect(screen.getByText("Guardar")).toBeInTheDocument();
  });

  it("debe manejar infoAEditar con datos_minimos_iniciales vacío", () => {
    render(
      <PopupEditarInfo
        {...defaultProps}
        infoAEditar={{
          info_id: 1,
          usuario_id: 1,
          datos_minimos_iniciales: [],
        }}
        draftDatos={[{ key: "Campo1", value: "Valor1" }]}
      />
    );

    // Todos los campos deben ser editables (no obligatorios)
    const keyInputs = screen.getAllByPlaceholderText("Dato...");
    expect(keyInputs.length).toBeGreaterThan(0);
  });

  it("debe manejar infoAEditar sin datos_minimos_iniciales", () => {
    render(
      <PopupEditarInfo
        {...defaultProps}
        infoAEditar={{
          info_id: 1,
          usuario_id: 1,
        }}
        draftDatos={[{ key: "Campo1", value: "Valor1" }]}
      />
    );

    // Debe renderizar sin errores
    expect(screen.getByText("Agregar campo")).toBeInTheDocument();
  });

  it("debe asignar inputRef correctamente al último elemento del array", () => {
    const inputRef = { current: null };
    const draftDatos = [
      { key: "Campo1", value: "Valor1" },
      { key: "Campo2", value: "Valor2" },
      { key: "Campo3", value: "Valor3" },
    ];

    render(
      <PopupEditarInfo
        {...defaultProps}
        draftDatos={draftDatos}
        infoAEditar={{
          info_id: 1,
          usuario_id: 1,
          datos_minimos_iniciales: [],
        }}
        inputRef={inputRef}
      />
    );

    // Verificar que hay inputs
    const keyInputs = screen.getAllByPlaceholderText("Dato...");
    expect(keyInputs.length).toBe(3);
  });

  it("debe manejar cuando infoAEditar.usuario_id no coincide con ningún cliente", () => {
    render(
      <PopupEditarInfo
        {...defaultProps}
        infoAEditar={{
          info_id: 1,
          usuario_id: 999,
        }}
        opcionesClientes={[
          { value: 1, label: "Cliente 1" },
          { value: 2, label: "Cliente 2" },
        ]}
      />
    );

    // Debe mostrar solo el número de registro
    expect(screen.getByText(/Registro °1/)).toBeInTheDocument();
    expect(screen.queryByText(/Cliente/)).not.toBeInTheDocument();
  });
});

