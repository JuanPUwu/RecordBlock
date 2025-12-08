// components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const PrivateRoute = ({ children, roles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <div>Cargando...</div>;

  // Si no está autenticado, lo mando a login
  if (!isAuthenticated()) return <Navigate to="/" replace />;

  // Si la ruta requiere roles y el usuario no cumple con ninguno
  if (roles) {
    const allowed = roles.some((r) => {
      if (r === "admin") return !!user.isAdmin;
      if (r === "cliente") return !user.isAdmin;
      return false;
    });

    if (!allowed) {
      return user.isAdmin ? (
        <Navigate to="/homeAdmin" replace />
      ) : (
        <Navigate to="/homeUsuario" replace />
      );
    }
  }

  return children;
};
