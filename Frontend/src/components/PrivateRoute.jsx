// components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const PrivateRoute = ({ children, roles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <div>Cargando...</div>;

  // Si no está autenticado, lo mando a login
  if (!isAuthenticated()) return <Navigate to="/" replace />;

  // Si la ruta requiere roles y el usuario no tiene el rol necesario
  if (roles && !roles.includes(user.rol)) {
    if (user.rol === "admin") return <Navigate to="/homeAdmin" replace />;
    if (user.rol === "cliente") return <Navigate to="/homeUsuario" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};
