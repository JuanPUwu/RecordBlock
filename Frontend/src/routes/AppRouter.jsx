import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { PublicRoute } from "../components/PublicRoute.jsx";
import { PrivateRoute } from "../components/PrivateRoute.jsx";
import SpinnerPages from "../components/SpinnerPages.jsx";

const Login = lazy(() => import("../pages/Login.jsx"));
const HomeAdmin = lazy(() => import("../pages/HomeAdmin.jsx"));
const HomeUsuario = lazy(() => import("../pages/HomeUsuario.jsx"));

export default function AppRouter() {
  return (
    <Suspense fallback={<SpinnerPages />}>
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
            <PrivateRoute requireAdmin={true}>
              <HomeAdmin />
            </PrivateRoute>
          }
        />
        <Route
          path="/homeUsuario"
          element={
            <PrivateRoute requireAdmin={false}>
              <HomeUsuario />
            </PrivateRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}
