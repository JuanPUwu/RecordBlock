import "../css/home.css";
import { useAuth } from "../context/AuthContext";

export default function HomeUsuario() {
  const { logout } = useAuth();

  const cerrarSesion = async () => {
    await logout();
  };

  return (
    <div>
      <h1>HomeUsuario</h1>
      <button onClick={cerrarSesion}>Cerrar sesion</button>
    </div>
  );
}
