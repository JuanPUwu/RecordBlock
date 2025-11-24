import { useAuth } from "../context/AuthContext";
import { handleRequest } from "../utils/apiHelper";

export const useDatosMinimosService = () => {
  const { api } = useAuth();

  const obtenerDatosMinimos = async () =>
    handleRequest(() => api.get("/informacion_usuario/datos_minimos"));

  const remplazarDatosMinimos = async (datos) =>
    handleRequest(() =>
      api.put("/informacion_usuario/datos_minimos", { datos })
    );

  return {
    obtenerDatosMinimos,
    remplazarDatosMinimos,
  };
};
