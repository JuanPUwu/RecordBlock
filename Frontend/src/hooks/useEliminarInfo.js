import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useInfoUsuarioService } from "../services/infoUsuarioServices.js";
import swalStyles from "../css/swalStyles.js";

/**
 * Hook compartido para manejar la eliminación de información
 */
export const useEliminarInfo = (cargarInformacion, setIsLoading) => {
  const { eliminarInformacion } = useInfoUsuarioService();

  const eliminarInformacionCliente = async (info) => {
    const result = await Swal.fire({
      title: `¿Estás seguro de eliminar el registro °${info.info_id}?`,
      text: "Esta acción es irreversible",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, Eliminar",
      cancelButtonText: "Cancelar",
      ...swalStyles,
    });

    if (result.isConfirmed) {
      // Crear objeto con solo las propiedades necesarias
      const infoEliminar = {
        info_id: info.info_id,
        usuario_id: info.usuario_id,
      };

      setIsLoading(true);
      const response = await eliminarInformacion(infoEliminar);
      if (response.success) {
        setIsLoading(false);
        toast.success(`Registro °${info.info_id} eliminado`);
        cargarInformacion();
      } else {
        setIsLoading(false);
        toast.error(response.error);
      }
    }
  };

  return {
    eliminarInformacionCliente,
  };
};
