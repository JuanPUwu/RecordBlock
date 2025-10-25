// routes/AppRouter.jsx
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login.jsx";
import HomeAdmin from "../pages/HomeAdmin.jsx";
import HomeUsuario from "../pages/HomeUsuario.jsx";
import { PublicRoute } from "../components/PublicRoute.jsx";
import { PrivateRoute } from "../components/PrivateRoute.jsx";

export default function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/homeAdmin"
        element={
          <PrivateRoute roles={["admin"]}>
            <HomeAdmin />
          </PrivateRoute>
        }
      />

      <Route
        path="/homeUsuario"
        element={
          <PrivateRoute roles={["cliente"]}>
            <HomeUsuario />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
