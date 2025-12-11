import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PrivateRoute } from "../../components/PrivateRoute";
import { AuthProvider } from "../../context/AuthContext";

// Mock del contexto
const mockUseAuth = vi.fn();

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }) => children,
}));

describe("PrivateRoute", () => {
  const TestComponent = () => <div>Contenido protegido</div>;

  it("debe mostrar children cuando está autenticado", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: () => true,
      loading: false,
      user: { id: 1, nombre: "Test" },
    });

    render(
      <MemoryRouter>
        <PrivateRoute>
          <TestComponent />
        </PrivateRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
  });

  it("debe redirigir a login cuando no está autenticado", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: () => false,
      loading: false,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <AuthProvider>
          <PrivateRoute>
            <TestComponent />
          </PrivateRoute>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
  });

  it("debe mostrar 'Cargando...' cuando loading es true", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: () => false,
      loading: true,
      user: null,
    });

    render(
      <MemoryRouter>
        <PrivateRoute>
          <TestComponent />
        </PrivateRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  it("debe redirigir a /homeUsuario cuando requireAdmin es true y el usuario no es admin", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: () => true,
      loading: false,
      user: { id: 1, nombre: "Test", isAdmin: false },
    });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AuthProvider>
          <PrivateRoute requireAdmin={true}>
            <TestComponent />
          </PrivateRoute>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
  });

  it("debe mostrar children cuando requireAdmin es true y el usuario es admin", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: () => true,
      loading: false,
      user: { id: 1, nombre: "Admin", isAdmin: true },
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <PrivateRoute requireAdmin={true}>
            <TestComponent />
          </PrivateRoute>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
  });

  it("debe redirigir a /homeAdmin cuando requireAdmin es false y el usuario es admin", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: () => true,
      loading: false,
      user: { id: 1, nombre: "Admin", isAdmin: true },
    });

    render(
      <MemoryRouter initialEntries={["/usuario"]}>
        <AuthProvider>
          <PrivateRoute requireAdmin={false}>
            <TestComponent />
          </PrivateRoute>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
  });

  it("debe mostrar children cuando requireAdmin es false y el usuario no es admin", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: () => true,
      loading: false,
      user: { id: 1, nombre: "Usuario", isAdmin: false },
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <PrivateRoute requireAdmin={false}>
            <TestComponent />
          </PrivateRoute>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
  });

  it("debe manejar requireAdmin undefined", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: () => true,
      loading: false,
      user: { id: 1, nombre: "Test" },
    });

    render(
      <MemoryRouter>
        <PrivateRoute>
          <TestComponent />
        </PrivateRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
  });
});
