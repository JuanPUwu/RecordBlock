// routes/AppRouter.jsx
import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { PublicRoute } from "../components/PublicRoute.jsx";
import { PrivateRoute } from "../components/PrivateRoute.jsx";
import Spinner from "../components/Spinner.jsx";

// 🧠 Lazy imports (solo cargan al entrar a la ruta)
const Login = lazy(() => import("../pages/Login.jsx"));
const HomeAdmin = lazy(() => import("../pages/HomeAdmin.jsx"));
const HomeUsuario = lazy(() => import("../pages/HomeUsuario.jsx"));

export default function AppRouter() {
  return (
    <Suspense fallback={<Spinner />}>
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
    </Suspense>
  );
}
