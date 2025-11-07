import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(() => {
  const backendURL = process.env.VITE_BACKEND_URL;

  return {
    plugins: [
      react(),
      visualizer({
        filename: "stats.html", // nombre del archivo de análisis
        template: "treemap", // tipo de gráfico (treemap, sunburst, network)
        open: true, // abre el reporte automáticamente
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    build: {
      sourcemap: true, // Opcional: ayuda a depurar los tamaños
    },
    server: {
      host: true,
      port: 5173,
      allowedHosts: true,
      cors: {
        origin: backendURL,
        credentials: true,
      },
    },
  };
});
