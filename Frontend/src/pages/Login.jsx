// Hooks
import { useAuth } from "../context/AuthContext";

// Estilos
import "../css/login.css";

// Librerías
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Popup from "reactjs-popup";
import * as yup from "yup";

// Servicios
import { useForgotPasswordService } from "../services/forgotPassService";

// Imágenes
import imgCandado from "../assets/img/candado.png";
import imgCorreo from "../assets/img/correo.png";
import imgLlave from "../assets/img/llave.png";

// Esquema de validación para login
const schema = yup.object().shape({
  email: yup
    .string()
    .email("Debe ser un correo válido")
    .required("El correo es obligatorio"),
  password: yup.string().required("La contraseña es obligatoria"),
});

// Esquema de validación para forgot password
const forgotSchema = yup.object().shape({
  forgotEmail: yup
    .string()
    .email("Debe ser un correo válido")
    .required("El correo es obligatorio"),
});

export default function Login() {
  const { login } = useAuth();
  const { solicitarRecuperacion } = useForgotPasswordService();

  // Form principal (login)
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Form secundario (forgot password)
  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: errorsForgot, isSubmitting: isSubmittingForgot },
    reset: resetForgotForm,
  } = useForm({
    resolver: yupResolver(forgotSchema),
  });

  // Enfocar automáticamente el email
  useEffect(() => {
    setFocus("email");
  }, [setFocus]);

  // 🔹 Login
  const iniciarSesion = async (data) => {
    await login(data.email, data.password);
  };

  // 🔹 Popup estado
  const [popUpForgotPassword, setPopUpForgotPassword] = useState(false);

  // 🔹 Forgot password
  const onForgotPassword = async ({ forgotEmail }) => {
    const { success, error } = await solicitarRecuperacion(forgotEmail);

    if (success) {
      toast.success("Se ha enviado un correo de recuperación");
      resetForgotForm();
      setPopUpForgotPassword(false);
    } else {
      toast.error(error || "No se pudo enviar el correo de recuperación");
    }
  };

  return (
    <div className="fondo-login">
      <div className="cont-login">
        <img src={imgCandado} alt="" />
        <h1>Iniciar sesión</h1>
        <h2>
          Accede a tu cuenta para poder gestionar <br /> tus registros de manera
          segura
        </h2>
        <form onSubmit={handleSubmit(iniciarSesion)}>
          {/* Email */}
          <div className="cont-label-login">
            <label>Correo</label>
            {errors.email && <span>{errors.email.message}</span>}
          </div>
          <div className="cont-input">
            <img src={imgCorreo} alt="" />
            <input
              type="email"
              {...register("email")}
              placeholder="ejemplo@gmail.com"
            />
          </div>

          {/* Password */}
          <div className="cont-label-login">
            <label>Contraseña</label>
            {errors.password && <span>{errors.password.message}</span>}
          </div>
          <div className="cont-input">
            <img src={imgLlave} alt="" />
            <input
              type="password"
              {...register("password")}
              placeholder="∗∗∗∗∗∗∗∗∗∗"
            />
          </div>
          <button
            className="btn-forgot-pass"
            onClick={() => setPopUpForgotPassword(true)}
          >
            ¿Olvidaste tu contraseña?
          </button>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>

      {/* 🔹 Popup para recuperación */}
      <Popup
        open={popUpForgotPassword}
        onClose={() => {
          setPopUpForgotPassword(false);
          resetForgotForm();
        }}
        modal
        nested
      >
        <div className="cont-popUp">
          <h2>Restablecer contraseña</h2>
          <form onSubmit={handleSubmitForgot(onForgotPassword)}>
            <div className="cont-label">
              <label>Correo asociado:</label>
              {errorsForgot.forgotEmail && (
                <span>{errorsForgot.forgotEmail.message}</span>
              )}
            </div>
            <input
              className="forgot-pass"
              type="email"
              placeholder="ejemplo@gmail.com"
              {...registerForgot("forgotEmail")}
            />
            <div className="sep-hrz"></div>
            <button
              className="btn-forgot-pass"
              type="submit"
              disabled={isSubmittingForgot}
            >
              {isSubmittingForgot ? "Enviando..." : "Enviar"}
            </button>
          </form>
        </div>
      </Popup>

      <footer></footer>
    </div>
  );
}
