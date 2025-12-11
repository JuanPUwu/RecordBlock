import toast from "react-hot-toast";
import { useUsuarioService } from "../services/usuarioService.js";

/**
 * Hook compartido para manejar la edición de contraseña
 */
export const useEditarContrasena = (setIsLoading) => {
  const { actualizarUsuario } = useUsuarioService();

  const editarContraseña = async (usuarioSeleccionado, data, onSuccess) => {
    setIsLoading(true);
    const response = await actualizarUsuario(
      usuarioSeleccionado.id,
      data.password
    );
    if (response.success) {
      setIsLoading(false);
      toast.success("Contraseña cambiada con éxito");
      if (onSuccess) {
        onSuccess();
      }
    } else {
      setIsLoading(false);
      toast.error(response.error);
    }
  };

  return {
    editarContraseña,
  };
};

