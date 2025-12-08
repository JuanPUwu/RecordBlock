import { useAuth } from "../context/AuthContext";
import { handleRequest } from "../utils/apiHelper";

export const useInfoUsuarioService = () => {
  const { api } = useAuth();

  const obtenerInformacion = async (usuario_id) =>
    handleRequest(() =>
      api.get("/informacion_usuario", {
        params: usuario_id ? { usuario_id } : {},
      })
    );

  const crearInformacion = async (infoCrear) =>
    handleRequest(() => api.post("/informacion_usuario", infoCrear));

  const actualizarInformacion = async (infoActualizar) =>
    handleRequest(() => api.put("/informacion_usuario", infoActualizar));

  const eliminarInformacion = async (infoEliminar) =>
    handleRequest(() =>
      api.delete("/informacion_usuario", { data: infoEliminar })
    );

  return {
    obtenerInformacion,
    crearInformacion,
    actualizarInformacion,
    eliminarInformacion,
  };
};
