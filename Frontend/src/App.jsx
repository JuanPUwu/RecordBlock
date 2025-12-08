import { useEffect } from "react";
import AppRouter from "./routes/AppRouter";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";

export default function App() {
  useEffect(() => {
    // Solución para el warning de aria-hidden cuando hay un input con focus
    const handleFocus = (e) => {
      const root = document.getElementById("root");
      if (root && root.getAttribute("aria-hidden") === "true") {
        root.removeAttribute("aria-hidden");
      }
    };

    // Observar cambios en el atributo aria-hidden del root
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "aria-hidden"
        ) {
          const activeElement = document.activeElement;
          if (
            activeElement &&
            (activeElement.tagName === "INPUT" ||
              activeElement.tagName === "TEXTAREA" ||
              activeElement.tagName === "SELECT")
          ) {
            const root = document.getElementById("root");
            if (root && root.getAttribute("aria-hidden") === "true") {
              root.removeAttribute("aria-hidden");
            }
          }
        }
      });
    });

    const root = document.getElementById("root");
    if (root) {
      observer.observe(root, {
        attributes: true,
        attributeFilter: ["aria-hidden"],
      });

      // Escuchar eventos de focus en inputs
      document.addEventListener("focusin", handleFocus);
    }

    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", handleFocus);
    };
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster />
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}
