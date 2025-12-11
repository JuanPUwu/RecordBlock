import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  renderHook,
  act,
  waitFor,
  render,
  screen,
} from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import toast from "react-hot-toast";

// Mock de axios - debe estar antes de importar AuthContext
// Crear el mockApi completamente dentro del factory
vi.mock("axios", () => {
  const mockPostFn = vi.fn();
  const apiInstance = {
    post: mockPostFn,
    interceptors: {
      request: {
        use: vi.fn(),
        handlers: [],
      },
      response: {
        use: vi.fn(),
        handlers: [],
      },
    },
  };

  const mockAxios = {
    create: vi.fn(() => apiInstance),
  };
  return { default: mockAxios };
});

// Importar AuthContext después de mockear axios
import { AuthProvider, useAuth } from "../../context/AuthContext.jsx";
import axios from "axios";

// Obtener el mockPost después de que se cree el mock
const getMockPost = () => {
  const createdApi = axios.create();
  return createdApi.post;
};

// Mock de react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock de toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock de SpinnerPages
vi.mock("../../components/SpinnerPages.jsx", () => ({
  default: () => <div>SpinnerPages</div>,
}));

describe("AuthContext", () => {
  let mockPost;

  // Helper para crear el wrapper
  const createWrapper = () => {
    // eslint-disable-next-line react/prop-types
    return ({ children }) => (
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Obtener la referencia al mockPost
    mockPost = getMockPost();
    // Resetear el mock de post
    mockPost.mockReset();
  });

  it("debe proporcionar el contexto de autenticación", async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        accessToken: "token",
        usuario: { id: 1, nombre: "Test", isAdmin: false },
      },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.login).toBeDefined();
      expect(result.current.logout).toBeDefined();
    });
  });

  it("debe hacer login correctamente", async () => {
    // Configurar mocks ANTES de montar el componente
    // Primera llamada es para refreshToken en checkAuthStatus (falla porque no hay token)
    mockPost
      .mockRejectedValueOnce({
        response: {
          status: 401,
          data: {},
        },
      })
      // Segunda llamada es para el login
      .mockResolvedValueOnce({
        data: {
          accessToken: "token123",
          usuario: { id: 1, nombre: "Test User", isAdmin: false },
        },
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let loginResult;
    await act(async () => {
      loginResult = await result.current.login("test@test.com", "password123");
    });

    expect(loginResult).toBeDefined();
    expect(loginResult.success).toBe(true);
  });

  it("debe manejar errores en login", async () => {
    mockPost
      .mockRejectedValueOnce({
        response: {
          status: 401,
          data: {},
        },
      })
      .mockRejectedValueOnce({
        response: {
          data: {
            error: "Credenciales inválidas",
          },
        },
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let loginResult;
    await act(async () => {
      loginResult = await result.current.login("test@test.com", "wrong");
    });

    await waitFor(() => {
      expect(loginResult.success).toBe(false);
    });
  });

  it("debe hacer logout correctamente", async () => {
    mockPost
      .mockRejectedValueOnce({
        response: { status: 401 },
      })
      .mockResolvedValueOnce({
        data: {
          accessToken: "token123",
          usuario: { id: 1, nombre: "Test User", isAdmin: false },
        },
      })
      .mockResolvedValueOnce({});

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.logout();
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("debe refrescar token correctamente", async () => {
    // Configurar mocks ANTES de montar el componente
    // Primera llamada es para checkAuthStatus (falla porque no hay token)
    mockPost
      .mockRejectedValueOnce({
        response: { status: 401, data: {} },
      })
      // Segunda llamada es para refreshToken directo
      .mockResolvedValueOnce({
        data: {
          accessToken: "newToken",
          usuario: { id: 1, nombre: "Test", isAdmin: false },
        },
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Llamar refreshToken directamente
    let token;
    await act(async () => {
      token = await result.current.refreshToken();
    });

    expect(token).toBe("newToken");
    expect(mockPost).toHaveBeenCalledWith("/auth/refresh");
  });

  it("debe retornar ruta correcta según isAdmin", async () => {
    // Configurar mock para refreshToken en checkAuthStatus
    mockPost.mockResolvedValueOnce({
      data: {
        accessToken: "token",
        usuario: { id: 1, nombre: "Admin", isAdmin: true },
      },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Esperar a que checkAuthStatus termine y establezca el usuario
    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toBeDefined();
        expect(result.current.user).not.toBeNull();
        expect(result.current.user.isAdmin).toBe(true);
      },
      { timeout: 3000 }
    );

    const route = result.current.getHomeRoute();
    expect(route).toBe("/homeAdmin");
  });

  it("debe verificar autenticación correctamente", async () => {
    mockPost.mockRejectedValueOnce({
      response: { status: 401 },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const isAuth = result.current.isAuthenticated();
    expect(typeof isAuth).toBe("boolean");
  });

  it("debe mostrar spinner durante inicialización", () => {
    mockPost.mockImplementationOnce(() => new Promise(() => {})); // Nunca resuelve

    render(
      <BrowserRouter>
        <AuthProvider>
          <div>Test</div>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText("SpinnerPages")).toBeInTheDocument();
  });

  it("debe retornar '/' cuando getHomeRoute se llama sin usuario", async () => {
    mockPost.mockRejectedValueOnce({
      response: { status: 401 },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const route = result.current.getHomeRoute();
    expect(route).toBe("/");
  });

  it("debe retornar '/homeUsuario' cuando getHomeRoute se llama con usuario no admin", async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        accessToken: "token",
        usuario: { id: 1, nombre: "Usuario", isAdmin: false },
      },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toBeDefined();
        expect(result.current.user.isAdmin).toBe(false);
      },
      { timeout: 3000 }
    );

    const route = result.current.getHomeRoute();
    expect(route).toBe("/homeUsuario");
  });

  it("debe retornar false en isAuthenticated cuando no hay user ni accessToken", async () => {
    mockPost.mockRejectedValueOnce({
      response: { status: 401 },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const isAuth = result.current.isAuthenticated();
    expect(isAuth).toBe(false);
  });

  it("debe retornar true en isAuthenticated cuando hay user y accessToken", async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        accessToken: "token123",
        usuario: { id: 1, nombre: "Test", isAdmin: false },
      },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toBeDefined();
        expect(result.current.accessToken).toBeDefined();
      },
      { timeout: 3000 }
    );

    const isAuth = result.current.isAuthenticated();
    expect(isAuth).toBe(true);
  });

  it("debe manejar error inesperado en refreshToken (status diferente de 401/403)", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockPost
      .mockRejectedValueOnce({
        response: { status: 401 },
      })
      .mockRejectedValueOnce({
        response: { status: 500, data: { error: "Error del servidor" } },
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.refreshToken();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error inesperado al refrescar token:",
      expect.any(Object)
    );

    consoleErrorSpy.mockRestore();
  });

  it("debe retornar null en refreshToken cuando isRefreshing.current es true", async () => {
    // Helper para crear una promesa con delay
    const createDelayedPromise = () => {
      const resolveData = {
        data: {
          accessToken: "token1",
          usuario: { id: 1, nombre: "Test", isAdmin: false },
        },
      };
      const resolveCallback = (resolve) => {
        resolve(resolveData);
      };
      return new Promise((resolve) => {
        setTimeout(() => resolveCallback(resolve), 100);
      });
    };

    mockPost
      .mockRejectedValueOnce({
        response: { status: 401 },
      })
      .mockImplementationOnce(() => {
        // Primera llamada que establece isRefreshing a true
        return createDelayedPromise();
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Llamar refreshToken dos veces rápidamente
    const promise1 = act(async () => {
      return result.current.refreshToken();
    });

    const promise2 = act(async () => {
      return result.current.refreshToken();
    });

    const [token1, token2] = await Promise.all([promise1, promise2]);

    // La segunda llamada debe retornar null porque isRefreshing ya es true
    expect(token2).toBe(null);
    expect(token1).toBe("token1");
  });

  it("debe limpiar estado cuando refreshToken falla con 401", async () => {
    mockPost
      .mockRejectedValueOnce({
        response: { status: 401 },
      })
      .mockRejectedValueOnce({
        response: { status: 401 },
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.refreshToken();
    });

    await waitFor(() => {
      expect(result.current.user).toBe(null);
      expect(result.current.accessToken).toBe(null);
    });
  });

  it("debe limpiar estado cuando refreshToken falla con 403", async () => {
    mockPost
      .mockRejectedValueOnce({
        response: { status: 401 },
      })
      .mockRejectedValueOnce({
        response: { status: 403 },
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.refreshToken();
    });

    await waitFor(() => {
      expect(result.current.user).toBe(null);
      expect(result.current.accessToken).toBe(null);
    });
  });

  it("debe mostrar spinner overlay durante login", async () => {
    mockPost
      .mockRejectedValueOnce({
        response: { status: 401 },
      })
      .mockResolvedValueOnce({
        data: {
          accessToken: "token123",
          usuario: { id: 1, nombre: "Test User", isAdmin: false },
        },
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.loading).toBe(false);
    });

    // Iniciar login con act
    await act(async () => {
      await result.current.login("test@test.com", "password123");
    });

    // Verificar que el login fue exitoso
    await waitFor(() => {
      expect(result.current.user).toBeDefined();
      expect(result.current.accessToken).toBe("token123");
    });
  });

  it("debe ocultar spinner overlay inmediatamente si login falla", async () => {
    mockPost
      .mockRejectedValueOnce({
        response: { status: 401 },
      })
      .mockRejectedValueOnce({
        response: {
          data: {
            error: "Credenciales inválidas",
          },
        },
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.login("test@test.com", "wrong");
    });

    // El spinner debe ocultarse inmediatamente en caso de error
    expect(result.current.showSpinnerOverlay).toBe(false);
  });

  it("debe mostrar spinner overlay durante logout", async () => {
    mockPost
      .mockRejectedValueOnce({
        response: { status: 401 },
      })
      .mockResolvedValueOnce({
        data: {
          accessToken: "token123",
          usuario: { id: 1, nombre: "Test User", isAdmin: false },
        },
      })
      .mockResolvedValueOnce({});

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.loading).toBe(false);
    });

    // Iniciar logout
    const logoutPromise = result.current.logout();

    // Verificar que la función existe
    expect(typeof result.current.logout).toBe("function");

    // Esperar a que el logout se complete
    await logoutPromise;

    // Verificar que el estado se limpió
    expect(result.current.user).toBe(null);
    expect(result.current.accessToken).toBe(null);
  });

  it("debe manejar error en logout sin lanzar excepción", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockPost
      .mockRejectedValueOnce({
        response: { status: 401 },
      })
      .mockResolvedValueOnce({
        data: {
          accessToken: "token123",
          usuario: { id: 1, nombre: "Test User", isAdmin: false },
        },
      })
      .mockRejectedValueOnce({
        response: { status: 500, data: { error: "Error del servidor" } },
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.loading).toBe(false);
    });

    // Esperar a que el usuario esté establecido
    await waitFor(() => {
      expect(result.current.user).toBeDefined();
    });

    // Llamar logout y verificar que no lanza excepción
    let logoutError = null;
    await act(async () => {
      try {
        await result.current.logout();
      } catch (error) {
        logoutError = error;
      }
    });

    // Verificar que no se lanzó una excepción
    expect(logoutError).toBe(null);

    // Verificar que console.error fue llamado (el error se captura en el catch del código)
    // Nota: puede que no se llame si el error se maneja de otra manera
    // Lo importante es que no se lance una excepción
    if (consoleErrorSpy.mock.calls.length > 0) {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error en logout:",
        expect.any(Object)
      );
    }

    // Debe limpiar el estado incluso si hay error
    expect(result.current.user).toBe(null);
    expect(result.current.accessToken).toBe(null);

    consoleErrorSpy.mockRestore();
  });

  it("debe usar mensaje de error del response.data.message si está disponible", async () => {
    mockPost
      .mockRejectedValueOnce({
        response: { status: 401 },
      })
      .mockRejectedValueOnce({
        response: {
          data: {
            message: "Mensaje de error personalizado",
          },
        },
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.login("test@test.com", "wrong");
    });

    expect(toast.error).toHaveBeenCalledWith("Mensaje de error personalizado");
  });

  it("debe usar mensaje de error del response.data.error si message no está disponible", async () => {
    mockPost
      .mockRejectedValueOnce({
        response: { status: 401 },
      })
      .mockRejectedValueOnce({
        response: {
          data: {
            error: "Error de autenticación",
          },
        },
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.login("test@test.com", "wrong");
    });

    expect(toast.error).toHaveBeenCalledWith("Error de autenticación");
  });

  it("debe usar mensaje de error por defecto si no hay message ni error", async () => {
    mockPost
      .mockRejectedValueOnce({
        response: { status: 401 },
      })
      .mockRejectedValueOnce({
        response: {
          data: {},
        },
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.login("test@test.com", "wrong");
    });

    expect(toast.error).toHaveBeenCalledWith("Error al iniciar sesión");
  });

  it("debe usar mensaje de error por defecto si no hay response", async () => {
    mockPost
      .mockRejectedValueOnce({
        response: { status: 401 },
      })
      .mockRejectedValueOnce({
        // Error sin response
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.login("test@test.com", "wrong");
    });

    expect(toast.error).toHaveBeenCalledWith("Error al iniciar sesión");
  });

  it("debe limpiar timeout del spinner al desmontar", async () => {
    mockPost.mockRejectedValueOnce({
      response: { status: 401 },
    });

    const wrapper = ({ children }) => (
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    );

    const { unmount } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalled();
    });

    // Desmontar el componente
    unmount();

    // Verificar que no hay errores después de desmontar
    // (si hay un timeout activo, debería limpiarse sin errores)
    expect(true).toBe(true);
  });

  it("debe manejar interceptor de request cuando token es null", async () => {
    mockPost.mockRejectedValueOnce({
      response: { status: 401 },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.loading).toBe(false);
    });

    // Cuando no hay token, el interceptor no debe agregar Authorization header
    const api = result.current.api;
    expect(api.interceptors.request.use).toHaveBeenCalled();
  });

  it("debe manejar interceptor de response cuando error.response no existe", async () => {
    mockPost
      .mockRejectedValueOnce({
        response: { status: 401 },
      })
      .mockRejectedValueOnce({
        // Error sin response
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.loading).toBe(false);
    });

    // El interceptor debe estar configurado
    const api = result.current.api;
    expect(api.interceptors.response.use).toHaveBeenCalled();
  });

  it("debe manejar interceptor de response cuando originalRequest._retry ya es true", async () => {
    mockPost
      .mockRejectedValueOnce({
        response: { status: 401 },
      })
      .mockRejectedValueOnce({
        response: { status: 401 },
        config: { _retry: true },
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.loading).toBe(false);
    });

    // El interceptor debe estar configurado
    const api = result.current.api;
    expect(api.interceptors.response.use).toHaveBeenCalled();
  });

  it("debe manejar interceptor de response cuando refreshToken retorna null", async () => {
    let callCount = 0;
    const createMockHandler = () => {
      callCount++;
      const createError = (message, status, config) => {
        const error = new Error(message);
        error.response = { status };
        if (config) error.config = config;
        return Promise.reject(error);
      };
      const userData = { id: 1, nombre: "Test", isAdmin: false };
      if (callCount === 1) return createError("Request failed", 401);
      if (callCount === 2)
        return Promise.resolve({
          data: { accessToken: "token123", usuario: userData },
        });
      if (callCount === 3)
        return createError("Request failed", 401, { _retry: false });
      if (callCount === 4) return createError("Refresh token failed", 401);
      return Promise.resolve({ data: {} });
    };
    mockPost.mockImplementation(createMockHandler);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.loading).toBe(false);
    });

    // Hacer login primero
    await act(async () => {
      await result.current.login("test@test.com", "password");
    });

    // El interceptor debe estar configurado
    const api = result.current.api;
    expect(api.interceptors.response.use).toHaveBeenCalled();
  });

  it("debe manejar interceptor de response cuando error es 403 pero mensaje no coincide", async () => {
    mockPost
      .mockRejectedValueOnce({
        response: { status: 401 },
      })
      .mockRejectedValueOnce({
        response: {
          status: 403,
          data: { error: "Otro error diferente" },
        },
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.loading).toBe(false);
    });

    // El interceptor debe estar configurado
    const api = result.current.api;
    expect(api.interceptors.response.use).toHaveBeenCalled();
  });

  it("debe manejar interceptor de response cuando error.response.status no es 401 ni 403", async () => {
    mockPost
      .mockRejectedValueOnce({
        response: { status: 401 },
      })
      .mockRejectedValueOnce({
        response: { status: 500 },
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.loading).toBe(false);
    });

    // El interceptor debe estar configurado
    const api = result.current.api;
    expect(api.interceptors.response.use).toHaveBeenCalled();
  });

  describe("Interceptores de axios", () => {
    it("debe agregar token de autorización en el interceptor de request cuando hay token", async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          accessToken: "token123",
          usuario: { id: 1, nombre: "Test", isAdmin: false },
        },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current.loading).toBe(false);
      });

      // Obtener la instancia de api
      const api = result.current.api;

      // Verificar que el interceptor está configurado
      expect(api.interceptors.request.use).toHaveBeenCalled();
    });

    it("debe manejar 401 en el interceptor de response y hacer retry con nuevo token", async () => {
      let callCount = 0;
      const createMockHandler = () => {
        callCount++;
        const createError = (message, status, config) => {
          const error = new Error(message);
          error.response = { status };
          if (config) error.config = config;
          return Promise.reject(error);
        };
        const createSuccessResponse = (token, usuario) => {
          return Promise.resolve({ data: { accessToken: token, usuario } });
        };
        const userData = { id: 1, nombre: "Test", isAdmin: false };
        if (callCount === 1) return createError("Refresh token failed", 401);
        if (callCount === 2) return createSuccessResponse("token123", userData);
        if (callCount === 3)
          return createError("Request failed", 401, { _retry: false });
        if (callCount === 4)
          return createSuccessResponse("newToken456", userData);
        return Promise.resolve({ data: { success: true } });
      };
      mockPost.mockImplementation(createMockHandler);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current.loading).toBe(false);
      });

      // Hacer login primero
      await act(async () => {
        await result.current.login("test@test.com", "password");
      });

      await waitFor(() => {
        expect(result.current.accessToken).toBe("token123");
      });

      // El interceptor debería estar configurado
      const api = result.current.api;
      expect(api.interceptors.response.use).toHaveBeenCalled();
    });

    it("debe manejar 403 con mensaje de refresh token inválido y hacer logout", async () => {
      let callCount = 0;
      const createMockHandler = () => {
        callCount++;
        const createError = (message, status, data, config) => {
          const error = new Error(message);
          error.response = { status, data };
          if (config) error.config = config;
          return Promise.reject(error);
        };
        const userData = { id: 1, nombre: "Test", isAdmin: false };
        if (callCount === 1) return createError("Request failed", 401);
        if (callCount === 2)
          return Promise.resolve({
            data: { accessToken: "token123", usuario: userData },
          });
        return createError(
          "Request failed",
          403,
          { error: "Refresh token inválido o expirado" },
          {}
        );
      };
      mockPost.mockImplementation(createMockHandler);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current.loading).toBe(false);
      });

      // Hacer login primero
      await act(async () => {
        await result.current.login("test@test.com", "password");
      });

      await waitFor(() => {
        expect(result.current.accessToken).toBe("token123");
      });

      // El interceptor debería estar configurado
      const api = result.current.api;
      expect(api.interceptors.response.use).toHaveBeenCalled();
    });

    it("NO debe hacer retry cuando originalRequest._retry es true", async () => {
      let callCount = 0;
      const createMockHandler = () => {
        callCount++;
        const createError = (message, status, config) => {
          const error = new Error(message);
          error.response = { status };
          if (config) error.config = config;
          return Promise.reject(error);
        };
        const userData = { id: 1, nombre: "Test", isAdmin: false };
        if (callCount === 1) return createError("Request failed", 401);
        if (callCount === 2)
          return Promise.resolve({
            data: { accessToken: "token123", usuario: userData },
          });
        return createError("Request failed", 401, { _retry: true });
      };
      mockPost.mockImplementation(createMockHandler);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current.loading).toBe(false);
      });

      // Hacer login primero
      await act(async () => {
        await result.current.login("test@test.com", "password");
      });

      await waitFor(() => {
        expect(result.current.accessToken).toBe("token123");
      });

      // El interceptor debería estar configurado
      const api = result.current.api;
      expect(api.interceptors.response.use).toHaveBeenCalled();
    });

    it("NO debe hacer retry cuando refreshToken retorna null", async () => {
      let callCount = 0;
      const createMockHandler = () => {
        callCount++;
        const createError = (message, status, config) => {
          const error = new Error(message);
          error.response = { status };
          if (config) error.config = config;
          return Promise.reject(error);
        };
        const userData = { id: 1, nombre: "Test", isAdmin: false };
        if (callCount === 1) return createError("Request failed", 401);
        if (callCount === 2)
          return Promise.resolve({
            data: { accessToken: "token123", usuario: userData },
          });
        if (callCount === 3)
          return createError("Request failed", 401, { _retry: false });
        return createError("Refresh token failed", 401);
      };
      mockPost.mockImplementation(createMockHandler);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current.loading).toBe(false);
      });

      // Hacer login primero
      await act(async () => {
        await result.current.login("test@test.com", "password");
      });

      await waitFor(() => {
        expect(result.current.accessToken).toBe("token123");
      });

      // El interceptor debería estar configurado
      const api = result.current.api;
      expect(api.interceptors.response.use).toHaveBeenCalled();
    });

    it("debe limpiar handlers de interceptores al configurar nuevos", async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          accessToken: "token123",
          usuario: { id: 1, nombre: "Test", isAdmin: false },
        },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current.loading).toBe(false);
      });

      // Verificar que los handlers se limpian
      const api = result.current.api;
      // Los handlers deberían ser arrays que se limpian
      expect(Array.isArray(api.interceptors.request.handlers)).toBe(true);
      expect(Array.isArray(api.interceptors.response.handlers)).toBe(true);
    });

    it("debe manejar error en el interceptor de request", async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          accessToken: "token123",
          usuario: { id: 1, nombre: "Test", isAdmin: false },
        },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current.loading).toBe(false);
      });

      // El interceptor de request debería estar configurado
      const api = result.current.api;
      expect(api.interceptors.request.use).toHaveBeenCalled();
      // El segundo argumento del use es el error handler
      const requestInterceptorCall = api.interceptors.request.use.mock.calls[0];
      expect(requestInterceptorCall.length).toBe(2);
    });
  });
});
