// Estilos
import "../css/login.css";

// Hooks
import { useAuth } from "../context/AuthContext";

// Librerías
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Popup from "reactjs-popup";
import * as yup from "yup";

// Servicios
import { useForgotPasswordService } from "../services/forgotPassService.js";

// Componentes
import Spinner from "../components/Spinner";

// Imágenes
import imgCandado from "../assets/img/candado.webp";
import imgCorreo from "../assets/img/correo.webp";
import imgLlave from "../assets/img/llave.webp";

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

  // Login
  const iniciarSesion = async (data) => {
    await login(data.email, data.password);
  };

  // Popup estado
  const [popUpForgotPassword, setPopUpForgotPassword] = useState(false);

  // Forgot password
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
        <div
          style={{
            width: "48px",
            height: "48px",
            minHeight: "48px",
            margin: "32px 0 16px 0",
          }}
        >
          <img src={imgCandado} alt="Logo RecordBlock" />
        </div>

        <h1>Iniciar sesión</h1>
        <h2>
          Accede a tu cuenta para poder gestionar <br /> tus registros de manera
          segura
        </h2>

        {/* FORM LOGIN */}
        <form onSubmit={handleSubmit(iniciarSesion)}>
          {/* Email */}
          <div className="cont-label-login">
            <label htmlFor="email">Correo</label>
            {errors.email && <span>{errors.email.message}</span>}
          </div>
          <div className="cont-input">
            <img src={imgCorreo} alt="Correo electrónico" />
            <input
              id="email"
              type="email"
              {...register("email")}
              placeholder="ejemplo@gmail.com"
            />
          </div>

          {/* Password */}
          <div className="cont-label-login">
            <label htmlFor="password">Contraseña</label>
            {errors.password && <span>{errors.password.message}</span>}
          </div>
          <div className="cont-input">
            <img src={imgLlave} alt="Contraseña" />
            <input
              id="password"
              type="password"
              {...register("password")}
              placeholder="∗∗∗∗∗∗∗∗∗∗"
            />
          </div>

          <button
            type="button"
            className="btn-forgot-pass"
            onClick={() => setPopUpForgotPassword(true)}
          >
            ¿Olvidaste tu contraseña?
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-login btn-form-primary"
            title="Iniciar sesión"
          >
            Ingresar
            {isSubmitting && <Spinner />}
          </button>
        </form>
      </div>

      {/* Popup para recuperación */}
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
              <label htmlFor="forgotEmail">Correo asociado:</label>
              {errorsForgot.forgotEmail && (
                <span>{errorsForgot.forgotEmail.message}</span>
              )}
            </div>

            <input
              id="forgotEmail"
              className="forgot-pass"
              type="email"
              placeholder="ejemplo@gmail.com"
              {...registerForgot("forgotEmail")}
            />

            <div className="sep-hrz"></div>

            <button
              className="btn-forgot-pass btn-form-primary"
              type="submit"
              disabled={isSubmittingForgot}
              title="Enviar correo de recuperación"
            >
              Enviar
              {isSubmittingForgot && <Spinner />}
            </button>
          </form>
        </div>
      </Popup>

      <footer></footer>
    </div>
  );
}
