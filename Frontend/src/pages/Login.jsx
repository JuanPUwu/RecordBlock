//Hooks
import { useAuth } from "../context/AuthContext";

// Estilos
import "../css/login.css";

// Librerias
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import * as yup from "yup";

// esquema de validación
const schema = yup.object().shape({
  email: yup
    .string()
    .email("Debe ser un correo válido")
    .required("El correo es obligatorio"),
  password: yup.string().required("La contraseña es obligatoria"),
});

// Imagenes
import imgCandado from "../assets/img/candado.png";
import imgCorreo from "../assets/img/correo.png";
import imgLlave from "../assets/img/llave.png";

export default function Login() {
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // 🔹 Enfocar automáticamente el email
  useEffect(() => {
    setFocus("email");
  }, [setFocus]);

  // 🔹 Envío del formulario
  const iniciarSesion = async (data) => {
    await login(data.email, data.password);
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
          <a
            onClick={() =>
              toast(
                "Contacta un administrador para restablecer tu contraseña",
                {
                  icon: "📞",
                }
              )
            }
          >
            ¿Olvidaste tu contraseña?
          </a>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
      <footer></footer>
    </div>
  );
}
