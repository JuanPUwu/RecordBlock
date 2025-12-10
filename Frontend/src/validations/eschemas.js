import * as yup from "yup";

// Constantes de validación
const passwordRules = yup
  .string()
  .required("Contraseña requerida")
  .min(8, "Mínimo 8 caracteres")
  .matches(/[A-Z]/, "Minimo una letra mayúscula")
  .matches(/[a-z]/, "Minimo una letra minúscula")
  .matches(/\d/, "Minimo un número")
  .matches(/[!@#$%^&*(),.?":{}|<>]/, "Minimo un carácter especial");

const confirmPasswordRules = yup
  .string()
  .oneOf([yup.ref("password"), null], "Las contraseñas no son idénticas");

// Expresión regular para eliminar emojis
const noEmojisRegex = /^[^\p{Extended_Pictographic}]+$/u;

// Esquema para crear cliente
export const schemaCrearUsuario = yup.object().shape({
  nombre: yup
    .string()
    .required("Nombre requerido")
    .matches(noEmojisRegex, "No se permiten emojis"),
  email: yup
    .string()
    .required("Correo requerido")
    .email("No es un correo válido")
    .matches(noEmojisRegex, "No se permiten emojis"),
  password: passwordRules.matches(noEmojisRegex, "No se permiten emojis"),
  password2: confirmPasswordRules.matches(
    noEmojisRegex,
    "No se permiten emojis"
  ),
});

// Esquema para cambiar contraseña
export const schemaCambiarContraseña = yup.object().shape({
  password: passwordRules,
  password2: confirmPasswordRules,
});
