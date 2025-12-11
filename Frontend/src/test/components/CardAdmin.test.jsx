import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CardAdmin from "../../components/CardAdmin";

describe("CardAdmin", () => {
  const defaultProps = {
    nameAdmin: "Juan Pérez",
    rolAdmin: "Administrador",
    onClick: vi.fn(),
  };

  it("debe renderizar correctamente con todas las props", () => {
    render(<CardAdmin {...defaultProps} />);
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("Administrador")).toBeInTheDocument();
  });

  it("debe mostrar el nombre del admin", () => {
    render(<CardAdmin {...defaultProps} nameAdmin="María García" />);
    expect(screen.getByText("María García")).toBeInTheDocument();
  });

  it("debe mostrar el rol del admin", () => {
    render(<CardAdmin {...defaultProps} rolAdmin="Usuario" />);
    expect(screen.getByText("Usuario")).toBeInTheDocument();
  });

  it("debe llamar onClick cuando se hace click en el botón", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<CardAdmin {...defaultProps} onClick={handleClick} />);

    const button = screen.getByTitle("Cambio contraseña");
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("debe tener la clase card-admin", () => {
    const { container } = render(<CardAdmin {...defaultProps} />);
    const card = container.querySelector(".card-admin");
    expect(card).toBeInTheDocument();
  });

  it("debe tener un botón con título correcto", () => {
    render(<CardAdmin {...defaultProps} />);
    const button = screen.getByTitle("Cambio contraseña");
    expect(button).toBeInTheDocument();
  });
});
