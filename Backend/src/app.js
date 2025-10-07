import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; // <--- IMPORTANTE
import authRoutes from "./routes/auth.routes.js";
import usuarioRoutes from "./routes/usuario.routes.js";
import infoUsuarioRoutes from "./routes/infoUsuario.routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Middleware CORS (habilita cookies entre frontend y backend)
app.use(
  cors({
    origin: "http://localhost:5173", // puerto de tu frontend (React con Vite)
    credentials: true, // <--- PERMITE enviar cookies
  })
);

// Middleware para parsear JSON y cookies
app.use(express.json());
app.use(cookieParser()); // <--- AHORA req.cookies funcionará

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/usuario", usuarioRoutes);
app.use("/api/informacion_usuario", infoUsuarioRoutes);

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Servir carpeta assets como estática
app.use("/assets", express.static(path.join(__dirname, "assets")));

export default app;
