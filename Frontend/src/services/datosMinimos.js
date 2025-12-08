import { useAuth } from "../context/AuthContext";
import { handleRequest } from "../utils/apiHelper";

export const useDatosMinimosService = () => {
  const { api } = useAuth();

  const obtenerDatosMinimos = async () =>
    handleRequest(() => api.get("/datos_minimos"));

  const remplazarDatosMinimos = async (datos) =>
    handleRequest(() => api.put("/datos_minimos", { datos }));

  return {
    obtenerDatosMinimos,
    remplazarDatosMinimos,
  };
};
