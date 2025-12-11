import Swal from "sweetalert2";
import swalStyles from "../css/swalStyles.js";

/**
 * Hook compartido para manejar el cierre de sesión
 */
export const useLogout = (logout, setIsLoading) => {
  const cerrarSesion = async () => {
    const result = await Swal.fire({
      title: "¿Estás seguro de cerrar sesión?",
      text: "Tendrás que iniciar sesión nuevamente",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, Salir",
      cancelButtonText: "No, Volver",
      ...swalStyles,
    });

    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        await logout();
      } catch (error) {
        console.error("Error en logout:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    cerrarSesion,
  };
};

