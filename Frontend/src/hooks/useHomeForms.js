import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import {
  schemaCrearUsuario,
  schemaCambiarContraseña,
} from "../validations/eschemas";

/**
 * Hook que maneja todos los formularios de las páginas Home
 */
export const useHomeForms = (isAdmin = false) => {
  // Formulario Cambiar Contraseña (común para ambos roles)
  const {
    register: registerCambiar,
    handleSubmit: handleSubmitCambiar,
    reset: resetCambiar,
    formState: { errors: errorsCambiar, isSubmitting: isSubmittingCambiar },
  } = useForm({
    resolver: yupResolver(schemaCambiarContraseña),
  });

  // Formulario Crear Usuario (solo admin)
  const formCrearUsuario = useForm({
    resolver: yupResolver(schemaCrearUsuario),
  });

  const registerCrear = isAdmin ? formCrearUsuario.register : null;
  const handleSubmitCrear = isAdmin ? formCrearUsuario.handleSubmit : null;
  const resetCrear = isAdmin ? formCrearUsuario.reset : null;
  const errorsCrear = isAdmin ? formCrearUsuario.formState.errors : {};
  const isSubmittingCrear = isAdmin
    ? formCrearUsuario.formState.isSubmitting
    : false;

  // Estados para ver contraseñas
  const [verPassword, setVerPassword] = useState("password");
  const [verPassword2, setVerPassword2] = useState("password");

  return {
    // Formulario cambiar contraseña
    registerCambiar,
    handleSubmitCambiar,
    resetCambiar,
    errorsCambiar,
    isSubmittingCambiar,
    // Formulario crear usuario (solo admin)
    registerCrear,
    handleSubmitCrear,
    resetCrear,
    errorsCrear,
    isSubmittingCrear,
    // Estados de visibilidad de contraseñas
    verPassword,
    setVerPassword,
    verPassword2,
    setVerPassword2,
  };
};
