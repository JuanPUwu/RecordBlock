import toast from "react-hot-toast";
import { useInfoUsuarioService } from "../services/infoUsuarioServices.js";
import { useInfoForm } from "./useInfoForm.js";

export const useCrearInfo = (clienteSeleccionado, cargarInformacion) => {
  const {
    draft: draftCrear,
    setDraft: setDraftCrear,
    scrollRef: scrollCrearRef,
    inputRef: inputCrearRef,
    cambiarLlave: cambiarLlaveCrear,
    cambiarValor: cambiarValorCrear,
    eliminarDato: eliminarDatoCrear,
    agregarDato: agregarDatoCrear,
    validarDraft,
    convertirAObjeto,
  } = useInfoForm([]);

  const { crearInformacion } = useInfoUsuarioService();

  // Guardar nueva información
  const crearRegistro = async (setIsLoading) => {
    // Validar el draft usando la función del hook base
    const paresValidos = validarDraft();
    if (!paresValidos) {
      return false;
    }

    // Convertir a objeto usando la función del hook base
    const obj = convertirAObjeto(paresValidos);

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

