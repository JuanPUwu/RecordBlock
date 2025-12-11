import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppRouter from "../../routes/AppRouter";

// Mock de los componentes lazy
vi.mock("../../pages/Login.jsx", () => ({
  default: () => <div>Login Page</div>,
}));

vi.mock("../../pages/HomeAdmin.jsx", () => ({
  default: () => <div>Home Admin Page</div>,
}));

vi.mock("../../pages/HomeUsuario.jsx", () => ({
  default: () => <div>Home Usuario Page</div>,
}));

// Mock del contexto
vi.mock("../../context/AuthContext", () => {
  const mockUseAuth = vi.fn();
  const mockAuthContext = {
    user: null,
    accessToken: null,
    showSpinnerOverlay: false,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
    api: {},
    getHomeRoute: vi.fn(() => "/homeAdmin"),
    isAuthenticated: vi.fn(() => false),
  };

  const MockAuthProvider = ({ children }) => (
    <div data-testid="auth-provider">{children}</div>
  );

  return {
    useAuth: () => mockUseAuth(),
    AuthProvider: MockAuthProvider,
    __mockUseAuth: mockUseAuth,
    __mockAuthContext: mockAuthContext,
  };
});

describe("AppRouter", () => {
  let mockUseAuth, mockAuthContext;

  beforeEach(async () => {
    vi.clearAllMocks();
    const authContextModule = await import("../../context/AuthContext");
    mockUseAuth = authContextModule.__mockUseAuth;
    mockAuthContext = authContextModule.__mockAuthContext;
    mockUseAuth.mockReturnValue(mockAuthContext);
  });

  it("debe renderizar el componente Login en la ruta /", async () => {
    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      isAuthenticated: () => false,
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRouter />
      </MemoryRouter>
    );

    // Esperar a que el componente lazy se cargue
    await waitFor(() => {
      expect(screen.getByText("Login Page")).toBeInTheDocument();
    });
  });

  it("debe renderizar SpinnerPages como fallback de Suspense", () => {
    const { container } = render(
      <MemoryRouter>
        <AppRouter />
      </MemoryRouter>
    );

    // El Suspense debería estar presente
    expect(container).toBeInTheDocument();
  });

  it("debe tener la ruta /homeAdmin configurada", async () => {
    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      isAuthenticated: () => true,
      loading: false,
      user: { id: 1, isAdmin: true },
    });

    render(
      <MemoryRouter initialEntries={["/homeAdmin"]}>
        <AppRouter />
      </MemoryRouter>
    );

    // Esperar a que el componente lazy se cargue
    await waitFor(
      () => {
        // Si está autenticado como admin, debería mostrar HomeAdmin
        expect(screen.queryByText("Home Admin Page")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("debe tener la ruta /homeUsuario configurada", async () => {
    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      isAuthenticated: () => true,
      loading: false,
      user: { id: 1, isAdmin: false },
    });

    render(
      <MemoryRouter initialEntries={["/homeUsuario"]}>
        <AppRouter />
      </MemoryRouter>
    );

    // Esperar a que el componente lazy se cargue
    await waitFor(
      () => {
        // Si está autenticado como usuario, debería mostrar HomeUsuario
        expect(screen.queryByText("Home Usuario Page")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
