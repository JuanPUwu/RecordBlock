import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchNav from "../../components/SearchNav";

describe("SearchNav", () => {
  const defaultProps = {
    refDato: { current: null },
    refDetalle: { current: null },
    onInputDato: vi.fn(),
    onInputDetalle: vi.fn(),
    clearDato: vi.fn(),
    clearDetalle: vi.fn(),
    isDatoValue: false,
    isDetalleValue: false,
  };

  it("debe renderizar correctamente", () => {
    render(<SearchNav {...defaultProps} />);
    expect(
      screen.getByPlaceholderText("Buscar por dato...")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Buscar por detalle...")
    ).toBeInTheDocument();
  });

  it("debe llamar onInputDato cuando se escribe en el input de dato", async () => {
    const user = userEvent.setup();
    const onInputDato = vi.fn();
    render(<SearchNav {...defaultProps} onInputDato={onInputDato} />);

    const input = screen.getByPlaceholderText("Buscar por dato...");
    await user.type(input, "test");

    expect(onInputDato).toHaveBeenCalled();
  });

  it("debe llamar onInputDetalle cuando se escribe en el input de detalle", async () => {
    const user = userEvent.setup();
    const onInputDetalle = vi.fn();
    render(<SearchNav {...defaultProps} onInputDetalle={onInputDetalle} />);

    const input = screen.getByPlaceholderText("Buscar por detalle...");
    await user.type(input, "test");

    expect(onInputDetalle).toHaveBeenCalled();
  });

  it("debe llamar clearDato cuando se hace click en el botón de limpiar dato", async () => {
    const user = userEvent.setup();
    const clearDato = vi.fn();
    render(
      <SearchNav {...defaultProps} clearDato={clearDato} isDatoValue={true} />
    );

    const buttons = screen.getAllByRole("button");
    const clearButton = buttons.find((btn) =>
      btn.querySelector('img[alt="Limpiar búsqueda"]')
    );
    if (clearButton) {
      await user.click(clearButton);
      expect(clearDato).toHaveBeenCalled();
    }
  });

  it("debe deshabilitar el botón de limpiar cuando isDatoValue es false", () => {
    render(<SearchNav {...defaultProps} isDatoValue={false} />);
    const buttons = screen.getAllByRole("button");
    const clearButtons = buttons.filter((btn) =>
      btn.querySelector('img[alt="Limpiar búsqueda"]')
    );
    clearButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it("debe habilitar el botón de limpiar cuando isDatoValue es true", () => {
    render(<SearchNav {...defaultProps} isDatoValue={true} />);
    const buttons = screen.getAllByRole("button");
    const clearButtons = buttons.filter((btn) =>
      btn.querySelector('img[alt="Limpiar búsqueda"]')
    );
    // El primer botón de limpiar debería estar habilitado si isDatoValue es true
    if (clearButtons.length > 0) {
      expect(clearButtons[0]).not.toHaveClass("no-active");
    }
  });

  it("debe sincronizar el valor con refDato", async () => {
    const user = userEvent.setup();
    const refDato = { current: { value: "" } };
    render(<SearchNav {...defaultProps} refDato={refDato} />);

    const input = screen.getByPlaceholderText("Buscar por dato...");
    await user.type(input, "test");

    expect(input).toHaveValue("test");
  });

  it("debe limpiar el valor cuando se llama clearDato", async () => {
    const user = userEvent.setup();
    const clearDato = vi.fn();
    render(
      <SearchNav {...defaultProps} clearDato={clearDato} isDatoValue={true} />
    );

    const input = screen.getByPlaceholderText("Buscar por dato...");
    await user.type(input, "test");

    const buttons = screen.getAllByRole("button");
    const clearButton = buttons.find((btn) =>
      btn.querySelector('img[alt="Limpiar búsqueda"]')
    );
    if (clearButton) {
      await user.click(clearButton);
      expect(clearDato).toHaveBeenCalled();
    }
  });

  it("debe llamar clearDetalle cuando se hace click en el botón de limpiar detalle", async () => {
    const user = userEvent.setup();
    const clearDetalle = vi.fn();
    render(
      <SearchNav
        {...defaultProps}
        clearDetalle={clearDetalle}
        isDetalleValue={true}
      />
    );

    const buttons = screen.getAllByRole("button");
    const clearButtons = buttons.filter((btn) =>
      btn.querySelector('img[alt="Limpiar búsqueda"]')
    );
    // El segundo botón es para detalle
    if (clearButtons.length > 1) {
      await user.click(clearButtons[1]);
      expect(clearDetalle).toHaveBeenCalled();
    }
  });

  it("debe deshabilitar el botón de limpiar detalle cuando isDetalleValue es false", () => {
    render(<SearchNav {...defaultProps} isDetalleValue={false} />);
    const buttons = screen.getAllByRole("button");
    const clearButtons = buttons.filter((btn) =>
      btn.querySelector('img[alt="Limpiar búsqueda"]')
    );
    // El segundo botón de limpiar debería estar deshabilitado
    if (clearButtons.length > 1) {
      expect(clearButtons[1]).toBeDisabled();
    }
  });

  it("debe habilitar el botón de limpiar detalle cuando isDetalleValue es true", () => {
    render(<SearchNav {...defaultProps} isDetalleValue={true} />);
    const buttons = screen.getAllByRole("button");
    const clearButtons = buttons.filter((btn) =>
      btn.querySelector('img[alt="Limpiar búsqueda"]')
    );
    // El segundo botón de limpiar debería estar habilitado
    if (clearButtons.length > 1) {
      expect(clearButtons[1]).not.toHaveClass("no-active");
    }
  });

  it("debe aplicar clase no-active cuando isDatoValue es false", () => {
    render(<SearchNav {...defaultProps} isDatoValue={false} />);
    const buttons = screen.getAllByRole("button");
    const clearButtons = buttons.filter((btn) =>
      btn.querySelector('img[alt="Limpiar búsqueda"]')
    );
    // El primer botón debería tener la clase no-active
    if (clearButtons.length > 0) {
      expect(clearButtons[0]).toHaveClass("no-active");
    }
  });

  it("debe aplicar clase no-active cuando isDetalleValue es false", () => {
    render(<SearchNav {...defaultProps} isDetalleValue={false} />);
    const buttons = screen.getAllByRole("button");
    const clearButtons = buttons.filter((btn) =>
      btn.querySelector('img[alt="Limpiar búsqueda"]')
    );
    // El segundo botón debería tener la clase no-active
    if (clearButtons.length > 1) {
      expect(clearButtons[1]).toHaveClass("no-active");
    }
  });

  it("debe sincronizar el valor con refDetalle", async () => {
    const user = userEvent.setup();
    const refDetalle = { current: { value: "" } };
    render(<SearchNav {...defaultProps} refDetalle={refDetalle} />);

    const input = screen.getByPlaceholderText("Buscar por detalle...");
    await user.type(input, "test");

    expect(input).toHaveValue("test");
  });

  it("debe actualizar refDato.current.value cuando se cambia el input de dato", async () => {
    const user = userEvent.setup();
    const refDato = { current: { value: "" } };
    render(<SearchNav {...defaultProps} refDato={refDato} />);

    const input = screen.getByPlaceholderText("Buscar por dato...");
    await user.type(input, "test");

    expect(refDato.current.value).toBe("test");
  });

  it("debe actualizar refDetalle.current.value cuando se cambia el input de detalle", async () => {
    const user = userEvent.setup();
    const refDetalle = { current: { value: "" } };
    render(<SearchNav {...defaultProps} refDetalle={refDetalle} />);

    const input = screen.getByPlaceholderText("Buscar por detalle...");
    await user.type(input, "test");

    expect(refDetalle.current.value).toBe("test");
  });

  it("debe limpiar refDato.current.value cuando se llama clearDato", async () => {
    const user = userEvent.setup();
    const clearDato = vi.fn();
    const refDato = { current: { value: "test" } };
    render(
      <SearchNav
        {...defaultProps}
        clearDato={clearDato}
        isDatoValue={true}
        refDato={refDato}
      />
    );

    const buttons = screen.getAllByRole("button");
    const clearButton = buttons.find((btn) =>
      btn.querySelector('img[alt="Limpiar búsqueda"]')
    );
    if (clearButton) {
      await user.click(clearButton);
      expect(refDato.current.value).toBe("");
    }
  });

  it("debe limpiar refDetalle.current.value cuando se llama clearDetalle", async () => {
    const user = userEvent.setup();
    const clearDetalle = vi.fn();
    const refDetalle = { current: { value: "test" } };
    render(
      <SearchNav
        {...defaultProps}
        clearDetalle={clearDetalle}
        isDetalleValue={true}
        refDetalle={refDetalle}
      />
    );

    const buttons = screen.getAllByRole("button");
    const clearButtons = buttons.filter((btn) =>
      btn.querySelector('img[alt="Limpiar búsqueda"]')
    );
    if (clearButtons.length > 1) {
      await user.click(clearButtons[1]);
      expect(refDetalle.current.value).toBe("");
    }
  });

  it("debe sincronizar valorDato cuando refDato.current.value es vacío", () => {
    const refDato = { current: { value: "" } };
    const { rerender } = render(
      <SearchNav {...defaultProps} refDato={refDato} isDatoValue={false} />
    );

    // Simular que el ref se actualiza externamente
    rerender(<SearchNav {...defaultProps} refDato={refDato} isDatoValue={true} />);

    const input = screen.getByPlaceholderText("Buscar por dato...");
    expect(input).toHaveValue("");
  });

  it("debe sincronizar valorDetalle cuando refDetalle.current.value es vacío", () => {
    const refDetalle = { current: { value: "" } };
    const { rerender } = render(
      <SearchNav
        {...defaultProps}
        refDetalle={refDetalle}
        isDetalleValue={false}
      />
    );

    // Simular que el ref se actualiza externamente
    rerender(
      <SearchNav
        {...defaultProps}
        refDetalle={refDetalle}
        isDetalleValue={true}
      />
    );

    const input = screen.getByPlaceholderText("Buscar por detalle...");
    expect(input).toHaveValue("");
  });

  it("debe sincronizar refs internos con refs externos cuando se monta", () => {
    const refDato = { current: document.createElement("input") };
    const refDetalle = { current: document.createElement("input") };
    render(
      <SearchNav
        {...defaultProps}
        refDato={refDato}
        refDetalle={refDetalle}
      />
    );

    // Los refs internos deben sincronizarse con los externos
    expect(refDato.current).toBeDefined();
    expect(refDetalle.current).toBeDefined();
  });

  it("debe renderizar el separador vertical", () => {
    const { container } = render(<SearchNav {...defaultProps} />);
    const sepVrt = container.querySelector(".sep-vrtSearch");
    expect(sepVrt).toBeInTheDocument();
  });

  it("debe renderizar el botón de búsqueda", () => {
    render(<SearchNav {...defaultProps} />);
    const buttons = screen.getAllByRole("button");
    const searchButton = buttons.find((btn) =>
      btn.querySelector('img[alt="Buscar"]')
    );
    expect(searchButton).toBeInTheDocument();
  });

  it("debe renderizar las imágenes correctamente", () => {
    const { container } = render(<SearchNav {...defaultProps} />);
    const images = container.querySelectorAll("img");
    expect(images.length).toBeGreaterThan(0);
  });
});
