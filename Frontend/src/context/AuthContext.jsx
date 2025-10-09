import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useReducer,
} from "react";
import axios from "axios";
import toast from "react-hot-toast";

// Loader
import Spinner from "../components/Spinner";

const AuthContext = createContext();
const API_BASE_URL = "http://localhost:3000/api";

// axios instance base
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const isRefreshing = useRef(false);
  const isInicializing = useRef(true);
  const [, forceRender] = useReducer((x) => x + 1, 0);

  // 🔹 Función para configurar interceptores dinámicamente
  const setupInterceptors = (token) => {
    // Limpiar handlers previos
    api.interceptors.request.handlers = [];
    api.interceptors.response.handlers = [];

    // Request interceptor
    api.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    // En AuthContext.js, interceptor de respuesta
    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // 401 → refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const newToken = await refreshToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }

        // 403 → token inválido, pero evitar casos como correo no verificado
        if (
          error.response?.status === 403 &&
          error.response?.data?.error === "Refresh token inválido o expirado"
        ) {
          await logout();
        }

        return Promise.reject(error);
      }
    );
  };

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { accessToken: token, usuario } = response.data;

      setAccessToken(token);
      setUser(usuario);
      setupInterceptors(token);

      toast.success("Bienvenido " + usuario.nombre);
      return { success: true, data: response.data };
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error al iniciar sesión";

      toast.error(mensaje);

      return {
        success: false,
        error: mensaje,
      };
    }
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
    if (isRefreshing.current) return null;
    isRefreshing.current = true;

    try {
      const response = await api.post("/auth/refresh");
      const { accessToken: newToken, usuario } = response.data;

      setAccessToken(newToken);
      setupInterceptors(newToken);

      if (usuario) {
        setUser(usuario);
      } else if (newToken) {
        const decoded = decodeJWT(newToken);
        if (decoded && (decoded.id || decoded.userId)) {
          setUser({
            id: decoded.id || decoded.userId,
            rol: decoded.rol || decoded.role,
            email: decoded.email,
            nombre: decoded.nombre || decoded.name,
          });
        }
      }

      return newToken;
    } catch (error) {
      // 🔹 Si el refresh falla → limpiar sesión
      if (error.response?.status === 401 || error.response?.status === 403) {
        setAccessToken(null);
        setUser(null);
        setupInterceptors(null);
      }
      return null;
    } finally {
      isRefreshing.current = false;
      forceRender();
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      setAccessToken(null);
      setUser(null);
      setupInterceptors(null);
      toast.success("Sesión cerrada");
    }
  };

  // 🔹 Inicialización al montar el contexto
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = await refreshToken();
      setupInterceptors(token);
      isInicializing.current = false;
    };
    checkAuthStatus();
  }, []);

  if (isInicializing.current) return <Spinner />;

  const getHomeRoute = () => {
    if (!user) return "/";
    return user.rol === "admin" ? "/homeAdmin" : "/homeUsuario";
  };

  const isAuthenticated = () => !!(user && accessToken);

  const value = {
    user,
    accessToken,
    login,
    logout,
    refreshToken,
    api,
    getHomeRoute,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  return context;
};
