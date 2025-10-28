import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(() => {
  const backendURL = process.env.VITE_BACKEND_URL;

  return {
    plugins: [react()],
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
