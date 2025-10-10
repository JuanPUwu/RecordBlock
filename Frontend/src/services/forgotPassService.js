import { useAuth } from "../context/AuthContext";
import { handleRequest } from "../utils/apiHelper";

export const useForgotPasswordService = () => {
  const { api } = useAuth();

  const solicitarRecuperacion = async (email) =>
    handleRequest(() => api.post("/auth/forgot-password", { email }));

  return {
    solicitarRecuperacion,
  };
};
