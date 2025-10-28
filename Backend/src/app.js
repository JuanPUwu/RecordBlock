import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import usuarioRoutes from "./routes/usuario.routes.js";
import infoUsuarioRoutes from "./routes/infoUsuario.routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const ENV = process.env.NODE_ENV || "development";

// ================== ORÍGENES PERMITIDOS (CORS) ==================
const allowedOrigins =
  ENV === "production"
    ? [
        process.env.FRONTEND_URL, // 🚀 Frontend público (Cloudflare o dominio)
      ]
    : [
        "http://localhost:5173", // 🛠️ Frontend local en desarrollo
      ];

// ================== CONFIG CORS DINÁMICO ==================
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // Permitir envío de cookies
  })
);

// ================== MIDDLEWARES ==================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ================== RUTAS ==================
app.use("/api/auth", authRoutes);
app.use("/api/usuario", usuarioRoutes);
app.use("/api/informacion_usuario", infoUsuarioRoutes);

// ================== SWAGGER ==================
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ================== ARCHIVOS ESTÁTICOS ==================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/views", express.static(path.join(__dirname, "views")));

export default app;
