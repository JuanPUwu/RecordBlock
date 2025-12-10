import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useInfoUsuarioService } from "../services/infoUsuarioServices.js";

export const useEditarInfo = (cargarInformacion) => {
  const [infoSeleccionada, setInfoSeleccionada] = useState(null);
  const [infoAEditar, setInfoAEditar] = useState(null);
  const [draftDatos, setDraftDatos] = useState([]);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const { actualizarInformacion } = useInfoUsuarioService();

  useEffect(() => {
    if (infoAEditar) {
      // Pasamos los datos de objeto -> array de pares clave/valor
      const entries = Object.entries(infoAEditar.datos[0]).map(([k, v]) => ({
        key: k,
        value: v,
      }));
      // Siempre agregar un campo vacío adicional para poder agregar nuevos datos
      setDraftDatos([...entries, { key: "", value: "" }]);
    }
  }, [infoAEditar]);

  // Cambiar clave
  const cambiarLlaveDraft = (index, newKey) => {
    const copy = [...draftDatos];
    copy[index].key = newKey;
    setDraftDatos(copy);
  };

  // Cambiar valor
  const cambiarValorDraft = (index, newValue) => {
    const copy = [...draftDatos];
    copy[index].value = newValue;
    setDraftDatos(copy);
  };

  // Eliminar par
  const eliminarDatoDraft = (index) => {
    // No permitir eliminar si solo queda un campo (debe haber mínimo uno)
    if (draftDatos.length <= 1) {
      toast.error("Debe haber al menos un campo");
      return;
    }

    const copy = [...draftDatos];
    copy.splice(index, 1);
    setDraftDatos(copy);
  };

  // Agregar par nuevo
  const agregarDatoDraft = () => {
    // Validar que no haya un par vacío ya
    const hayVacio = draftDatos.some(
      (d) => d.key.trim() === "" && d.value.trim() === ""
    );
    if (hayVacio) {
      toast.error("Completa el campo vacío\nantes de agregar uno nuevo");
      return;
    }

    setDraftDatos([...draftDatos, { key: "", value: "" }]);

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

  // Guardar cambios
  const editarRegistro = async (setIsLoading) => {
    const noEmojisRegex = /^[^\p{Extended_Pictographic}]*$/u;

    // 🔹 Limpiar campos vacíos totalmente {"": ""}
    const cleanedDraft = draftDatos.filter(
      (d) => d.key.trim() !== "" || d.value.trim() !== ""
    );

    // 🔹 Validar claves vacías
    const emptyKey = cleanedDraft.find(
      (d) => d.key.trim() === "" && d.value.trim() !== ""
    );
    if (emptyKey) {
      toast.error(`El detalle "${emptyKey.value}" no tiene dato`);
      return;
    }

    // 🔹 Validar valores vacíos
    const emptyValue = cleanedDraft.find(
      (d) => d.value.trim() === "" && d.key.trim() !== ""
    );
    if (emptyValue) {
      toast.error(`El dato "${emptyValue.key}" no tiene detalle`);
      return;
    }

    // 🔹 Validar que quede al menos un par válido (clave y valor completos)
    const paresValidos = cleanedDraft.filter(
      (d) => d.key.trim() !== "" && d.value.trim() !== ""
    );
    if (paresValidos.length === 0) {
      toast.error("El registro debe tener por lo menos un dato válido");
      return;
    }

    // 🔹 Validar que no haya emojis en keys ni values
    for (const { key, value } of paresValidos) {
      if (!noEmojisRegex.test(key.trim())) {
        toast.error(`El dato "${key}" contiene emojis, no es valido`);
        return;
      }
      if (!noEmojisRegex.test(value.trim())) {
        toast.error(`El detalle "${value}" contiene emojis, no es valido`);
        return;
      }
    }

    // 🔹 Validar duplicados (ignorando mayúsculas/minúsculas)
    const keys = paresValidos.map((d) => d.key.trim());
    const lowerKeys = keys.map((k) => k.toLowerCase());
    const seen = new Map();
    for (let i = 0; i < lowerKeys.length; i++) {
      const k = lowerKeys[i];
      if (seen.has(k)) {
        toast.error(`El dato "${keys[i]}" ya existe`);
        return;
      }
      seen.set(k, true);
    }

    // 🔹 Convertir a objeto limpio (solo pares válidos)
    const obj = paresValidos.reduce((acc, { key, value }) => {
      acc[key.trim()] = value.trim();
      return acc;
    }, {});

    // 🔹 Crear info actualizada
    const infoActualizada = { ...infoAEditar, datos: obj };

    // 🔹 Normalizar datos de infoSeleccionada para comparación
    const datosSeleccionados = Array.isArray(infoSeleccionada.datos)
      ? infoSeleccionada.datos[0] // asumimos un solo objeto
      : infoSeleccionada.datos;

    const infoSeleccionadaNormalized = {
      ...infoSeleccionada,
      datos: datosSeleccionados,
    };

    // 🔹 Si no hay cambios, mostrar mensaje y cerrar el popup
    if (
      JSON.stringify(infoSeleccionadaNormalized) ===
      JSON.stringify(infoActualizada)
    ) {
      return true; // Retornar true para cerrar el popup
    }

    // 🔹 Enviar actualización
    setIsLoading(true);
    const response = await actualizarInformacion(infoActualizada);
    if (response.success) {
      toast.success(`Registro °${infoActualizada.info_id} actualizado`);
      cargarInformacion();
      setIsLoading(false);
      return true;
    } else {
      toast.error(response.error);
      setIsLoading(false);
      return false;
    }
  };

  const handleEditarInfo = (info) => {
    setInfoSeleccionada(info);
    setInfoAEditar({
      ...info,
      datos: info.datos.map((dato) => ({ ...dato })),
    });
  };

  return {
    setInfoSeleccionada,
    infoAEditar,
    setInfoAEditar,
    draftDatos,
    scrollRef,
    inputRef,
    cambiarLlaveDraft,
    cambiarValorDraft,
    eliminarDatoDraft,
    agregarDatoDraft,
    editarRegistro,
    handleEditarInfo,
  };
};
