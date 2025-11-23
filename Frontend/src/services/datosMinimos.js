import { useAuth } from "../context/AuthContext";
import { handleRequest } from "../utils/apiHelper";

export const useDatosMinimosService = () => {
  const { api } = useAuth();

  const obtenerDatosMinimos = async () =>
    handleRequest(() => api.get("/informacion_usuario/datos_minimos"));

  const crearDatosMinimos = async (datosMinimos) =>
    handleRequest(() =>
      api.post("/informacion_usuario/datos_minimos", datosMinimos)
    );

  const eliminarDatosMinimos = async (id) =>
    handleRequest(() => api.delete(`/informacion_usuario/datos_minimos/${id}`));

  return {
    obtenerDatosMinimos,
    crearDatosMinimos,
    eliminarDatosMinimos,
  };
};
