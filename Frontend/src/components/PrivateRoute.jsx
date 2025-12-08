import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PropTypes from "prop-types";

export const PrivateRoute = ({ children, requireAdmin }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <div>Cargando...</div>;

  // Si no está autenticado, lo mando a login
  if (!isAuthenticated()) return <Navigate to="/" replace />;

  // Si la ruta requiere un rol específico, verificar que el usuario lo cumpla
  if (requireAdmin !== undefined) {
    const isAdmin = !!user?.isAdmin;

    // Si requiere admin y el usuario no es admin, redirigir
    if (requireAdmin && !isAdmin) {
      return <Navigate to="/homeUsuario" replace />;
    }

    // Si requiere cliente (requireAdmin === false) y el usuario es admin, redirigir
    if (requireAdmin === false && isAdmin) {
      return <Navigate to="/homeAdmin" replace />;
    }
  }

  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireAdmin: PropTypes.bool,
};
