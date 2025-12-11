import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PublicRoute } from "../../components/PublicRoute";

// Mock del contexto
const mockUseAuth = vi.fn();

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }) => children,
}));

describe("PublicRoute", () => {
  const TestComponent = () => <div>Contenido público</div>;

  it("debe mostrar children cuando no está autenticado", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: () => false,
      getHomeRoute: () => "/homeAdmin",
    });

    render(
      <MemoryRouter>
        <PublicRoute>
          <TestComponent />
        </PublicRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Contenido público")).toBeInTheDocument();
  });

  it("debe redirigir cuando está autenticado", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: () => true,
      getHomeRoute: () => "/homeAdmin",
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <PublicRoute>
          <TestComponent />
        </PublicRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText("Contenido público")).not.toBeInTheDocument();
  });

  it("debe usar getHomeRoute para redirigir cuando está autenticado", () => {
    const getHomeRoute = vi.fn(() => "/homeUsuario");
    mockUseAuth.mockReturnValue({
      isAuthenticated: () => true,
      getHomeRoute,
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <PublicRoute>
          <TestComponent />
        </PublicRoute>
      </MemoryRouter>
    );

    expect(getHomeRoute).toHaveBeenCalled();
  });
});
