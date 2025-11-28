import bcrypt from "bcrypt";
import { isValidPassword } from "./passwordHelper.js";

export const validarYHashearPassword = async (password) => {
  if (!password) {
    const error = new Error("La contraseña es obligatoria");
    error.status = 400;
    throw error;
  }

  if (!isValidPassword(password)) {
    const error = new Error(
      "La contraseña debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos"
    );
    error.status = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
};
