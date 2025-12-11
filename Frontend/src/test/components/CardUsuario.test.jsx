import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CardUsuario from "../../components/CardUsuario";

describe("CardUsuario", () => {
  const defaultProps = {
    nameUsuario: "Juan Pérez",
    correoUsuario: "juan@example.com",
    estado: "Verificado",
    onClick1: vi.fn(),
    onClick2: vi.fn(),
  };

  it("debe renderizar correctamente con todas las props", () => {
    render(<CardUsuario {...defaultProps} />);
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("juan@example.com")).toBeInTheDocument();
    expect(screen.getByText("Verificado")).toBeInTheDocument();
  });

  it("debe mostrar el nombre del usuario", () => {
    render(<CardUsuario {...defaultProps} nameUsuario="María García" />);
    expect(screen.getByText("María García")).toBeInTheDocument();
  });

  it("debe mostrar el correo del usuario", () => {
    render(<CardUsuario {...defaultProps} correoUsuario="maria@example.com" />);
    expect(screen.getByText("maria@example.com")).toBeInTheDocument();
  });

  it("debe mostrar el estado del usuario", () => {
    render(<CardUsuario {...defaultProps} estado="(No verificado)" />);
    expect(screen.getByText("(No verificado)")).toBeInTheDocument();
  });

  it("debe llamar onClick1 cuando se hace click en el botón de contraseña", async () => {
    const user = userEvent.setup();
    const handleClick1 = vi.fn();
    render(<CardUsuario {...defaultProps} onClick1={handleClick1} />);

    const button = screen.getByTitle("Cambio contraseña");
    await user.click(button);

    expect(handleClick1).toHaveBeenCalledTimes(1);
  });

  it("debe llamar onClick2 cuando se hace click en el botón de eliminar", async () => {
    const user = userEvent.setup();
    const handleClick2 = vi.fn();
    render(<CardUsuario {...defaultProps} onClick2={handleClick2} />);

    const button = screen.getByTitle("Eliminar usuario");
    await user.click(button);

    expect(handleClick2).toHaveBeenCalledTimes(1);
  });

  it("debe tener la clase card-usuario", () => {
    const { container } = render(<CardUsuario {...defaultProps} />);
    const card = container.querySelector(".card-usuario");
    expect(card).toBeInTheDocument();
  });

  it("debe tener ambos botones con títulos correctos", () => {
    render(<CardUsuario {...defaultProps} />);
    expect(screen.getByTitle("Cambio contraseña")).toBeInTheDocument();
    expect(screen.getByTitle("Eliminar usuario")).toBeInTheDocument();
  });
});
