import { useState, useRef } from "react";
import toast from "react-hot-toast";

/**
 * Hook base que contiene la lógica común para manejar formularios de información
 * (crear y editar). Proporciona funciones para gestionar un array de pares clave-valor.
 */
export const useInfoForm = (initialDraft = []) => {
  const [draft, setDraft] = useState(initialDraft);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Cambiar clave
  const cambiarLlave = (index, newKey) => {
    const copy = [...draft];
    copy[index].key = newKey;
    setDraft(copy);
  };

  // Cambiar valor
  const cambiarValor = (index, newValue) => {
    const copy = [...draft];
    copy[index].value = newValue;
    setDraft(copy);
  };

  // Eliminar par
  const eliminarDato = (index) => {
    // No permitir eliminar si solo queda un campo (debe haber mínimo uno)
    if (draft.length <= 1) {
      toast.error("Debe haber al menos un campo");
      return;
    }

    const copy = [...draft];
    copy.splice(index, 1);
    setDraft(copy);
  };

  // Agregar par nuevo
  const agregarDato = () => {
    // Validar que no haya un par vacío ya
    const hayVacio = draft.some(
      (d) => d.key.trim() === "" && d.value.trim() === ""
    );
    if (hayVacio) {
      toast.error("Completa el campo vacío\nantes de agregar uno nuevo");
      return;
    }

    setDraft([...draft, { key: "", value: "" }]);

    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 250);
    });
  };

  /**
   * Valida el draft y retorna el array limpio de pares válidos
   * @returns {Array|null} Array de pares válidos o null si hay errores
   */
  const validarDraft = () => {
    const noEmojisRegex = /^[^\p{Extended_Pictographic}]*$/u;

    // Limpiar campos vacíos
    const cleanedDraft = draft.filter(
      (d) => d.key.trim() !== "" || d.value.trim() !== ""
    );

    // Validar claves vacías
    const emptyKey = cleanedDraft.find(
      (d) => d.key.trim() === "" && d.value.trim() !== ""
    );
    if (emptyKey) {
      toast.error(`El detalle "${emptyKey.value}" no tiene dato`);
      return null;
    }

    // Validar valores vacíos
    const emptyValue = cleanedDraft.find(
      (d) => d.value.trim() === "" && d.key.trim() !== ""
    );
    if (emptyValue) {
      toast.error(`El dato "${emptyValue.key}" no tiene detalle`);
      return null;
    }

    // Validar que quede al menos un par válido
    const paresValidos = cleanedDraft.filter(
      (d) => d.key.trim() !== "" && d.value.trim() !== ""
    );
    if (paresValidos.length === 0) {
      toast.error("Debe haber por lo menos un dato válido");
      return null;
    }

    // Validar que no haya emojis
    for (const { key, value } of paresValidos) {
      if (!noEmojisRegex.test(key.trim())) {
        toast.error(`El dato "${key}" contiene emojis, no es valido`);
        return null;
      }
      if (!noEmojisRegex.test(value.trim())) {
        toast.error(`El detalle "${value}" contiene emojis, no es valido`);
        return null;
      }
    }

    // Validar duplicados (ignorando mayúsculas/minúsculas)
    const keys = paresValidos.map((d) => d.key.trim());
    const lowerKeys = keys.map((k) => k.toLowerCase());
    const seen = new Map();
    for (let i = 0; i < lowerKeys.length; i++) {
      if (seen.has(lowerKeys[i])) {
        toast.error(`El dato "${keys[i]}" ya existe`);
        return null;
      }
      seen.set(lowerKeys[i], true);
    }

    return paresValidos;
  };

  /**
   * Convierte el array de pares válidos a un objeto
   * @param {Array} paresValidos - Array de pares {key, value}
   * @returns {Object} Objeto con las claves y valores
   */
  const convertirAObjeto = (paresValidos) => {
    return paresValidos.reduce((acc, { key, value }) => {
      acc[key.trim()] = value.trim();
      return acc;
    }, {});
  };

  return {
    draft,
    setDraft,
    scrollRef,
    inputRef,
    cambiarLlave,
    cambiarValor,
    eliminarDato,
    agregarDato,
    validarDraft,
    convertirAObjeto,
  };
};
