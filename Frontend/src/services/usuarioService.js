import { useAuth } from "../context/AuthContext";
import { handleRequest } from "../utils/apiHelper";

export const useUsuarioService = () => {
  const { api } = useAuth();

  const obtenerUsuarios = async () => handleRequest(() => api.get("/usuario"));

  const crearUsuario = async (usuario) =>
    handleRequest(() => api.post("/usuario", usuario));

  const actualizarUsuario = async (id, password) =>
    handleRequest(() => api.put(`/usuario/${id}`, { password }));

  const eliminarUsuario = async (id) =>
    handleRequest(() => api.delete(`/usuario/${id}`));

  return {
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
  };
};
