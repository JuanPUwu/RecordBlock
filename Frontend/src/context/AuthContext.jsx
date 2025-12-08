import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useReducer,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import SpinnerPages from "../components/SpinnerPages.jsx";
import PropTypes from "prop-types";

const AuthContext = createContext();

const API_BASE_URL =
  import.meta.env.VITE_NODE_ENV === "production"
    ? `${import.meta.env.VITE_BACKEND_URL}/api`
    : "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [showSpinnerOverlay, setShowSpinnerOverlay] = useState(false);
  const [loading, setLoading] = useState(true);
  const isRefreshing = useRef(false);
  const isInicializing = useRef(true);
  const spinnerTimeoutRef = useRef(null);
  const interceptorSetupRef = useRef(false);
  const [, forceRender] = useReducer((x) => x + 1, 0);
  const navigate = useNavigate();

  const setupInterceptors = (token) => {
    // Limpiar interceptors anteriores solo si ya se habían configurado
    if (interceptorSetupRef.current) {
      api.interceptors.request.handlers = [];
      api.interceptors.response.handlers = [];
    }

    // Configurar interceptor de request
    api.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          delete config.headers.Authorization;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Configurar interceptor de response
    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Si es un 401 y no se ha reintentado, intentar refrescar token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const newToken = await refreshToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          } else {
            // Si falla el refresh, hacer logout
            await logout();
          }
        }

        // Si es un 403 con refresh token inválido o sesión cerrada, hacer logout
        if (
          error.response?.status === 403 &&
          (error.response?.data?.error ===
            "Refresh token inválido o expirado" ||
            error.response?.data?.error === "Token inválido (sesión cerrada)" ||
            error.response?.data?.error === "Token inválido (blacklist)")
        ) {
          await logout();
        }

        return Promise.reject(error);
      }
    );

    interceptorSetupRef.current = true;
  };

  const decodeJWT = (token) => {
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  };

  const refreshToken = async () => {
    // Evitar múltiples llamadas simultáneas de refresh
    if (isRefreshing.current) {
      // Esperar a que termine el refresh en curso
      while (isRefreshing.current) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return accessToken;
    }

    isRefreshing.current = true;
    try {
      const response = await api.post("/auth/refresh");
      const { accessToken: newToken, usuario } = response.data;

      if (newToken) {
        setAccessToken(newToken);
        setupInterceptors(newToken);

        // El backend proporciona `usuario` con `isAdmin` booleano
        if (usuario) {
          setUser(usuario);
        } else {
          // Si no viene usuario, intentar decodificarlo del token
          const decoded = decodeJWT(newToken);
          if (decoded && decoded.id) {
            setUser({
              id: decoded.id,
              isAdmin: !!decoded.isAdmin,
              email: decoded.email,
              nombre: decoded.nombre,
            });
          }
        }
        return newToken;
      }
      return null;
    } catch (error) {
      // Si el refresh falla, limpiar todo
      setAccessToken(null);
      setUser(null);
      setupInterceptors(null);
      return null;
    } finally {
      isRefreshing.current = false;
      forceRender();
    }
  };

  // 🔹 Login con spinner overlay
  const loginWithSpinner = async (email, password) => {
    clearTimeout(spinnerTimeoutRef.current);
    setShowSpinnerOverlay(true);
    const result = await login(email, password);
    if (result.success) {
      navigate(getHomeRoute());
      spinnerTimeoutRef.current = setTimeout(
        () => setShowSpinnerOverlay(false),
        1000
      );
    } else {
      setShowSpinnerOverlay(false);
    }
    return result;
  };

  // 🔹 Logout con spinner overlay
  const logoutWithSpinner = async () => {
    clearTimeout(spinnerTimeoutRef.current);
    setShowSpinnerOverlay(true);
    await logout();
    navigate("/");
    spinnerTimeoutRef.current = setTimeout(
      () => setShowSpinnerOverlay(false),
      1000
    );
  };

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { accessToken: token, usuario } = response.data;

      if (!token) {
        throw new Error("No se recibió token de acceso");
      }

      setAccessToken(token);
      setupInterceptors(token);

      // El backend proporciona `usuario` con `isAdmin` booleano
      setUser(usuario);

      setTimeout(() => {
        toast.success("Bienvenido " + (usuario?.nombre || ""));
      }, 1100);

      return { success: true, data: response.data };
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error al iniciar sesión";
      toast.error(mensaje);
      return { success: false, error: mensaje };
    }
  };

  const logout = async () => {
    try {
      // Intentar hacer logout en el servidor
      await api.post("/auth/logout");
    } catch (error) {
      // No importa si falla, limpiamos el estado local igualmente
      console.error("Error en logout:", error);
    } finally {
      // Siempre limpiar el estado local
      setAccessToken(null);
      setUser(null);
      setupInterceptors(null);
      setTimeout(() => {
        toast.success("Sesión cerrada");
      }, 1100);
    }
  };

  // Efecto para verificar el estado de autenticación al cargar
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const token = await refreshToken();
        setupInterceptors(token);
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
        setAccessToken(null);
        setUser(null);
        setupInterceptors(null);
      } finally {
        isInicializing.current = false;
        setLoading(false);
        forceRender();
      }
    };

    checkAuthStatus();
    return () => clearTimeout(spinnerTimeoutRef.current);
  }, []);

  // Mostrar spinner durante la inicialización
  if (isInicializing.current || loading) {
    return <SpinnerPages />;
  }

  const getHomeRoute = () => {
    if (!user) return "/";
    return user.isAdmin ? "/homeAdmin" : "/homeUsuario";
  };

  const isAuthenticated = () => !!(user && accessToken);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        showSpinnerOverlay,
        loading,
        login: loginWithSpinner,
        logout: logoutWithSpinner,
        refreshToken,
        api,
        getHomeRoute,
        isAuthenticated,
      }}
    >
      {children}
      {showSpinnerOverlay && <SpinnerPages />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  return context;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
