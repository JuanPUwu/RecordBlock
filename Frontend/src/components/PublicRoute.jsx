import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, getHomeRoute } = useAuth();

  if (isAuthenticated()) {
    // Si ya está logueado, redirige a la ruta correspondiente
    return <Navigate to={getHomeRoute()} replace />;
  }

  return children;
};
