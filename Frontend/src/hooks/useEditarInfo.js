import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useInfoUsuarioService } from "../services/infoUsuarioServices.js";
import { useInfoForm } from "./useInfoForm.js";

export const useEditarInfo = (cargarInformacion) => {
  const [infoSeleccionada, setInfoSeleccionada] = useState(null);
  const [infoAEditar, setInfoAEditar] = useState(null);
  const {
    draft: draftDatos,
    setDraft: setDraftDatos,
    scrollRef,
    inputRef,
    cambiarLlave: cambiarLlaveDraft,
    cambiarValor: cambiarValorDraft,
    eliminarDato: eliminarDatoDraft,
    agregarDato: agregarDatoDraft,
    validarDraft,
    convertirAObjeto,
  } = useInfoForm([]);

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
  }, [infoAEditar, setDraftDatos]);

  // Guardar cambios
  const editarRegistro = async (setIsLoading) => {
    // Validar el draft usando la función del hook base
    const paresValidos = validarDraft();
    if (!paresValidos) {
      return false;
    }

    // Convertir a objeto usando la función del hook base
    const obj = convertirAObjeto(paresValidos);

    // Crear info actualizada
    const infoActualizada = { ...infoAEditar, datos: obj };

    // Normalizar datos de infoSeleccionada para comparación
    const datosSeleccionados = Array.isArray(infoSeleccionada.datos)
      ? infoSeleccionada.datos[0] // asumimos un solo objeto
      : infoSeleccionada.datos;

    const infoSeleccionadaNormalized = {
      ...infoSeleccionada,
      datos: datosSeleccionados,
    };

    // Si no hay cambios, mostrar mensaje y cerrar el popup
    if (
      JSON.stringify(infoSeleccionadaNormalized) ===
      JSON.stringify(infoActualizada)
    ) {
      return true; // Retornar true para cerrar el popup
    }

    // Enviar actualización
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
