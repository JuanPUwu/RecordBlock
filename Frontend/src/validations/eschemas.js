import * as yup from "yup";

// Constantes de validación
const passwordRules = yup
  .string()
  .required("Contraseña requerida")
  .min(8, "Mínimo 8 caracteres")
  .matches(/[A-Z]/, "Minimo una letra mayúscula")
  .matches(/[a-z]/, "Minimo una letra minúscula")
  .matches(/[0-9]/, "Minimo un número")
  .matches(/[!@#$%^&*(),.?":{}|<>]/, "Minimo un carácter especial");

const confirmPasswordRules = yup
  .string()
  .oneOf([yup.ref("password"), null], "Las contraseñas no son idénticas");

// Esquema para crear cliente
export const schemaCrearUsuario = yup.object().shape({
  nombre: yup.string().required("Nombre requerido"),
  email: yup
    .string()
    .required("Correo requerido")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Correo inválido")
    .email("No es un correo válido"),
  password: passwordRules,
  password2: confirmPasswordRules,
});

// Esquema para cambiar contraseña
export const schemaCambiarContraseña = yup.object().shape({
  password: passwordRules,
  password2: confirmPasswordRules,
});
