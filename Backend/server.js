import app from "./src/app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || "development";

// Detecta URL base para swagger según si es local o está publicado
let swaggerURL;
if (ENV === "production") {
  // Si tienes BACKEND_URL en .env, úsalo. Si no, cae en localhost.
  const backendUrl = process.env.BACKEND_URL || `http://localhost:${PORT}`;
  swaggerURL = `${backendUrl}/api-docs`;
} else {
  swaggerURL = `http://localhost:${PORT}/api-docs`;
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
  console.log(`Entorno: ${ENV}`);
  console.log(`Swagger Docs: ${swaggerURL}`);
});
