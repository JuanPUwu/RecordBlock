import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useDatosMinimosService } from "../services/datosMinimos.js";

export const useDatosMinimosAdmin = () => {
  const [datosMinimos, setDatosMinimos] = useState([]);
  const [draftDatosMinimos, setDraftDatosMinimos] = useState([]);
  const scrollDatosMinimosRef = useRef(null);
  const inputDatosMinimosRef = useRef(null);
  const { obtenerDatosMinimos, remplazarDatosMinimos } =
    useDatosMinimosService();

  const obtenerDatosMin = async (setIsLoading, setDraftCrear) => {
    setIsLoading(true);
    const response = await obtenerDatosMinimos();

    setDatosMinimos(response.data.data);
    const datosMinimosArray =
      response.data.data.length > 0
        ? response.data.data.map((item) => ({
            key: item,
            value: "",
          }))
        : [];
    // Siempre agregar un campo vacío adicional además de los datos mínimos
    setDraftCrear([...datosMinimosArray, { key: "", value: "" }]);
    setIsLoading(false);
  };

  // Inicializar draft cuando se abre el popup
  const inicializarDraft = (popUpEditarDatosMinimos) => {
    if (popUpEditarDatosMinimos) {
      // Si no hay datos mínimos, inicializar con al menos un elemento vacío
      if (!datosMinimos || datosMinimos.length === 0) {
        setDraftDatosMinimos([""]);
      } else {
        setDraftDatosMinimos([...datosMinimos]);
      }
    } else {
      setDraftDatosMinimos([]);
    }
  };

  // Cambiar valor de dato minimo
  const cambiarDatoMinimo = (index, newValue) => {
    const copy = [...draftDatosMinimos];
    copy[index] = newValue;
    setDraftDatosMinimos(copy);
  };

  // Eliminar dato minimo
  const eliminarDatoMinimo = (index) => {
    // Si solo queda un elemento y tiene contenido, resetearlo a vacío
    if (draftDatosMinimos.length <= 1) {
      const copy = [...draftDatosMinimos];
      copy[index] = "";
      setDraftDatosMinimos(copy);
      return;
    }
    const copy = [...draftDatosMinimos];
    copy.splice(index, 1);
    setDraftDatosMinimos(copy);
  };

  // Agregar dato minimo nuevo
  const agregarDatoMinimo = () => {
    // Validar que no haya un dato vacío ya
    const hayVacio = draftDatosMinimos.some((d) => d.trim() === "");
    if (hayVacio) {
      toast.error("Completa el dato vacío\nantes de agregar uno nuevo");
      return;
    }

    setDraftDatosMinimos([...draftDatosMinimos, ""]);

    requestAnimationFrame(() => {
      if (scrollDatosMinimosRef.current) {
        scrollDatosMinimosRef.current.scrollTo({
          top: scrollDatosMinimosRef.current.scrollHeight,
          behavior: "smooth",
        });
      }

      setTimeout(() => {
        if (inputDatosMinimosRef.current) {
          inputDatosMinimosRef.current.focus();
        }
      }, 250);
    });
  };

  // Guardar datos minimos
  const guardarDatosMinimos = async (setIsLoading, obtenerDatosMin, setDraftCrear) => {
    const noEmojisRegex = /^[^\p{Extended_Pictographic}]*$/u;

    // Limpiar datos vacíos
    const cleanedDraft = draftDatosMinimos
      .map((d) => d.trim())
      .filter((d) => d !== "");

    // Normalizar arrays para comparación (ordenar y convertir a minúsculas)
    const normalizedDraft = cleanedDraft
      .map((d) => d.toLowerCase())
      .sort((a, b) => a.localeCompare(b));
    const normalizedOriginal = datosMinimos
      .map((d) => d.toLowerCase())
      .sort((a, b) => a.localeCompare(b));

    // Si no hay cambios, mostrar mensaje y cerrar popup
    if (
      normalizedDraft.length === normalizedOriginal.length &&
      normalizedDraft.every((d, i) => d === normalizedOriginal[i])
    ) {
      toast.success("No se detectaron cambios en los datos mínimos");
      return true; // Retornar true para cerrar el popup
    }

    // Validar que no haya emojis
    for (const dato of cleanedDraft) {
      if (!noEmojisRegex.test(dato)) {
        toast.error(`El dato "${dato}" contiene emojis, no es válido`);
        return;
      }
    }

    // Validar duplicados (ignorando mayúsculas/minúsculas)
    const lowerDatos = cleanedDraft.map((d) => d.toLowerCase());
    const seen = new Map();
    for (let i = 0; i < lowerDatos.length; i++) {
      const d = lowerDatos[i];
      if (seen.has(d)) {
        toast.error(`El dato "${cleanedDraft[i]}" ya existe`);
        return;
      }
      seen.set(d, true);
    }

    // Modificar lista de datosMinimos
    setIsLoading(true);
    const response = await remplazarDatosMinimos(cleanedDraft);
    if (response.success) {
      await obtenerDatosMin(setIsLoading, setDraftCrear);
      setIsLoading(false);
      toast.success("Datos mínimos guardados");
      return true;
    } else {
      console.error(response.error);
      setIsLoading(false);
      return false;
    }
  };

  return {
    datosMinimos,
    draftDatosMinimos,
    setDraftDatosMinimos,
    scrollDatosMinimosRef,
    inputDatosMinimosRef,
    obtenerDatosMin,
    inicializarDraft,
    cambiarDatoMinimo,
    eliminarDatoMinimo,
    agregarDatoMinimo,
    guardarDatosMinimos,
  };
};

