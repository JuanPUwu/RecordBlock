import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { useInfoUsuarioService } from "../services/infoUsuarioServices.js";

export const useCrearInfo = (clienteSeleccionado, cargarInformacion) => {
  const [draftCrear, setDraftCrear] = useState([]);
  const scrollCrearRef = useRef(null);
  const inputCrearRef = useRef(null);
  const { crearInformacion } = useInfoUsuarioService();

  // Cambiar clave
  const cambiarLlaveCrear = (index, newKey) => {
    const copy = [...draftCrear];
    copy[index].key = newKey;
    setDraftCrear(copy);
  };

  // Cambiar valor
  const cambiarValorCrear = (index, newValue) => {
    const copy = [...draftCrear];
    copy[index].value = newValue;
    setDraftCrear(copy);
  };

  // Eliminar par
  const eliminarDatoCrear = (index) => {
    // No permitir eliminar si solo queda un campo (debe haber mínimo uno)
    if (draftCrear.length <= 1) {
      toast.error("Debe haber al menos un campo");
      return;
    }

    const copy = [...draftCrear];
    copy.splice(index, 1);
    setDraftCrear(copy);
  };

  // Agregar par nuevo
  const agregarDatoCrear = () => {
    // Validar que no haya un par vacío ya
    const hayVacio = draftCrear.some(
      (d) => d.key.trim() === "" && d.value.trim() === ""
    );
    if (hayVacio) {
      toast.error("Completa el campo vacío\nantes de agregar uno nuevo");
      return;
    }

    setDraftCrear([...draftCrear, { key: "", value: "" }]);

    requestAnimationFrame(() => {
      if (scrollCrearRef.current) {
        scrollCrearRef.current.scrollTo({
          top: scrollCrearRef.current.scrollHeight,
          behavior: "smooth",
        });
      }

      setTimeout(() => {
        if (inputCrearRef.current) {
          inputCrearRef.current.focus();
        }
      }, 250);
    });
  };

  // Guardar nueva información
  const crearRegistro = async (setIsLoading) => {
    const noEmojisRegex = /^[^\p{Extended_Pictographic}]*$/u;

    // Limpiar campos vacíos
    const cleanedDraft = draftCrear.filter(
      (d) => d.key.trim() !== "" || d.value.trim() !== ""
    );

    // Validaciones
    const emptyKey = cleanedDraft.find(
      (d) => d.key.trim() === "" && d.value.trim() !== ""
    );
    if (emptyKey) {
      toast.error(`El detalle "${emptyKey.value}" no tiene dato`);
      return;
    }

    const emptyValue = cleanedDraft.find(
      (d) => d.value.trim() === "" && d.key.trim() !== ""
    );
    if (emptyValue) {
      toast.error(`El dato "${emptyValue.key}" no tiene detalle`);
      return;
    }

    // Verificar mínimo 1 par válido
    if (cleanedDraft.length === 0) {
      toast.error("Ingresa por lo menos un dato válido");
      return;
    }

    // Validar que no haya emojis
    for (const { key, value } of cleanedDraft) {
      if (!noEmojisRegex.test(key.trim())) {
        toast.error(`El dato "${key}" contiene emojis, no es valido`);
        return;
      }
      if (!noEmojisRegex.test(value.trim())) {
        toast.error(`El detalle "${value}" contiene emojis, no es valido`);
        return;
      }
    }

    const keys = cleanedDraft.map((d) => d.key.trim());
    const lowerKeys = keys.map((k) => k.toLowerCase());
    const seen = new Map();
    for (let i = 0; i < lowerKeys.length; i++) {
      if (seen.has(lowerKeys[i])) {
        toast.error(`El dato "${keys[i]}" ya existe`);
        return;
      }
      seen.set(lowerKeys[i], true);
    }

    // Convertir a objeto
    const obj = cleanedDraft.reduce((acc, { key, value }) => {
      acc[key.trim()] = value.trim();
      return acc;
    }, {});

    // Crear payload
    const nuevaInfo = {
      usuario_id: clienteSeleccionado.value,
      datos: obj,
    };

    setIsLoading(true);
    const response = await crearInformacion(nuevaInfo);

    if (response.success) {
      toast.success(`Registro creado con éxito`);
      cargarInformacion();
      setIsLoading(false);
      return true;
    } else {
      toast.error(response.error);
      setIsLoading(false);
      return false;
    }
  };

  return {
    draftCrear,
    setDraftCrear,
    scrollCrearRef,
    inputCrearRef,
    cambiarLlaveCrear,
    cambiarValorCrear,
    eliminarDatoCrear,
    agregarDatoCrear,
    crearRegistro,
  };
};

