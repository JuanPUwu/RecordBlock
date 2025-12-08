import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useReducer,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import SpinnerPages from "../components/SpinnerPages.jsx";

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
  const isRefreshing = useRef(false);
  const isInicializing = useRef(true);
  const spinnerTimeoutRef = useRef(null);
  const [, forceRender] = useReducer((x) => x + 1, 0);
  const navigate = useNavigate();

  const setupInterceptors = (token) => {
    api.interceptors.request.handlers = [];
    api.interceptors.response.handlers = [];
    api.interceptors.request.use(
      (config) => {
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );
    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const newToken = await refreshToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }
        if (
          error.response?.status === 403 &&
          error.response?.data?.error === "Refresh token inválido o expirado"
        ) {
          await logoutWithSpinner();
        }
        throw error;
      }
    );
  };

  const refreshToken = async () => {
    if (isRefreshing.current) return null;
    isRefreshing.current = true;
    try {
      const response = await api.post("/auth/refresh");
      const { accessToken: newToken, usuario } = response.data;
      setAccessToken(newToken);
      setupInterceptors(newToken);
      // El backend siempre devuelve usuario en la respuesta
      if (usuario) {
        setUser(usuario);
      }
      return newToken;
    } catch (error) {
      // Si el refresh token es inválido o expirado, limpiar estado
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        console.error("Error inesperado al refrescar token:", error);
      }
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
      setAccessToken(token);
      setUser(usuario);
      setupInterceptors(token);
      setTimeout(() => {
        toast.success("Bienvenido " + usuario.nombre);
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
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      setAccessToken(null);
      setUser(null);
      setupInterceptors(null);
      setTimeout(() => {
        toast.success("Sesión cerrada");
      }, 1100);
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = await refreshToken();
      setupInterceptors(token);
      isInicializing.current = false;
    };
    checkAuthStatus();
    return () => clearTimeout(spinnerTimeoutRef.current);
  }, []);

  const getHomeRoute = () => {
    if (!user) return "/";
    // El backend devuelve isAdmin (boolean), no rol
    return user.isAdmin ? "/homeAdmin" : "/homeUsuario";
  };

  const isAuthenticated = () => !!(user && accessToken);

  const contextValue = useMemo(
    () => ({
      user,
      accessToken,
      showSpinnerOverlay,
      loading: isInicializing.current,
      login: loginWithSpinner,
      logout: logoutWithSpinner,
      refreshToken,
      api,
      getHomeRoute,
      isAuthenticated,
    }),
    [
      user,
      accessToken,
      showSpinnerOverlay,
      loginWithSpinner,
      logoutWithSpinner,
      refreshToken,
      getHomeRoute,
      isAuthenticated,
    ]
  );

  if (isInicializing.current) return <SpinnerPages />;

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      {showSpinnerOverlay && <SpinnerPages />}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  return context;
};
