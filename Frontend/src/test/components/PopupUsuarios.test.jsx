import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PopupUsuarios from "../../components/PopupUsuarios";

// Mock de useDebounce
vi.mock("../../hooks/useDebounce.js", () => ({
  useDebounce: (value) => value,
}));

describe("PopupUsuarios", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    user: { id: 1, nombre: "Admin", isAdmin: true },
    opcionesClientesTabla: [],
    buscarClienteTabla: vi.fn(),
    onCrearCliente: vi.fn(),
    onEditarContrasena: vi.fn(),
    onEliminarCliente: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe renderizar correctamente cuando está abierto", () => {
    render(<PopupUsuarios {...defaultProps} />);

    expect(screen.getByText("Gestión de usuarios")).toBeInTheDocument();
  });

  it("debe mostrar CardAdmin con información del usuario", () => {
    render(<PopupUsuarios {...defaultProps} />);

    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Administrador")).toBeInTheDocument();
  });

  it("debe mostrar 'Usuario' cuando el usuario no es admin", () => {
    render(
      <PopupUsuarios
        {...defaultProps}
        user={{ id: 1, nombre: "Usuario", isAdmin: false }}
      />
    );

    const usuarios = screen.getAllByText("Usuario");
    expect(usuarios.length).toBeGreaterThan(0);
  });

  it("debe mostrar input de búsqueda", () => {
    render(<PopupUsuarios {...defaultProps} />);

    const input = screen.getByPlaceholderText("Buscar usuario/cliente...");
    expect(input).toBeInTheDocument();
  });

  it("debe llamar buscarClienteTabla cuando se escribe en el input", async () => {
    const user = userEvent.setup();
    const buscarClienteTabla = vi.fn();

    render(
      <PopupUsuarios
        {...defaultProps}
        buscarClienteTabla={buscarClienteTabla}
      />
    );

    const input = screen.getByPlaceholderText("Buscar usuario/cliente...");
    await user.type(input, "test");

    await waitFor(() => {
      expect(buscarClienteTabla).toHaveBeenCalled();
    });
  });

  it("debe llamar onCrearCliente cuando se hace click en el botón crear", async () => {
    const user = userEvent.setup();
    const onCrearCliente = vi.fn();

    render(<PopupUsuarios {...defaultProps} onCrearCliente={onCrearCliente} />);

    const button = screen.getByTitle("Crear usuario");
    await user.click(button);

    expect(onCrearCliente).toHaveBeenCalled();
  });

  it("debe renderizar lista de clientes", () => {
    const opcionesClientesTabla = [
      {
        id: 1,
        nombre: "Cliente 1",
        email: "cliente1@test.com",
        verificado: true,
      },
      {
        id: 2,
        nombre: "Cliente 2",
        email: "cliente2@test.com",
        verificado: false,
      },
    ];

    render(
      <PopupUsuarios
        {...defaultProps}
        opcionesClientesTabla={opcionesClientesTabla}
      />
    );

    expect(screen.getByText("Cliente 1")).toBeInTheDocument();
    expect(screen.getByText("Cliente 2")).toBeInTheDocument();
  });

  it("debe mostrar estado '(No verificado)' para clientes no verificados", () => {
    const opcionesClientesTabla = [
      {
        id: 1,
        nombre: "Cliente",
        email: "cliente@test.com",
        verificado: false,
      },
    ];

    render(
      <PopupUsuarios
        {...defaultProps}
        opcionesClientesTabla={opcionesClientesTabla}
      />
    );

    expect(screen.getByText("(No verificado)")).toBeInTheDocument();
  });

  it("debe llamar onEditarContrasena cuando se hace click en editar contraseña", async () => {
    const user = userEvent.setup();
    const onEditarContrasena = vi.fn();
    const opcionesClientesTabla = [
      { id: 1, nombre: "Cliente", email: "cliente@test.com", verificado: true },
    ];

    render(
      <PopupUsuarios
        {...defaultProps}
        opcionesClientesTabla={opcionesClientesTabla}
        onEditarContrasena={onEditarContrasena}
      />
    );

    const buttons = screen.getAllByTitle("Cambio contraseña");
    await user.click(buttons[1]); // El segundo botón es el del cliente

    expect(onEditarContrasena).toHaveBeenCalledWith(opcionesClientesTabla[0]);
  });

  it("debe llamar onEliminarCliente cuando se hace click en eliminar", async () => {
    const user = userEvent.setup();
    const onEliminarCliente = vi.fn();
    const opcionesClientesTabla = [
      { id: 1, nombre: "Cliente", email: "cliente@test.com", verificado: true },
    ];

    render(
      <PopupUsuarios
        {...defaultProps}
        opcionesClientesTabla={opcionesClientesTabla}
        onEliminarCliente={onEliminarCliente}
      />
    );

    const buttons = screen.getAllByTitle("Eliminar usuario");
    await user.click(buttons[0]);

    expect(onEliminarCliente).toHaveBeenCalledWith(opcionesClientesTabla[0]);
  });

  it("debe limpiar el input cuando se cierra el popup", async () => {
    const { rerender } = render(
      <PopupUsuarios {...defaultProps} open={true} />
    );

    const input = screen.getByPlaceholderText("Buscar usuario/cliente...");
    await userEvent.type(input, "test");

    rerender(<PopupUsuarios {...defaultProps} open={false} />);
    rerender(<PopupUsuarios {...defaultProps} open={true} />);

    const inputAfterClose = screen.getByPlaceholderText(
      "Buscar usuario/cliente..."
    );
    expect(inputAfterClose).toHaveValue("");
  });
});
