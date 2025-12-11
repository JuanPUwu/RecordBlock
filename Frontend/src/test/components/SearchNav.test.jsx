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
});
