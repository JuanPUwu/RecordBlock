import { useRef } from "react";
import { useInfoUsuarioService } from "../services/infoUsuarioServices.js";
import { useFiltros } from "./useFiltros.js";
import { useExportacion } from "./useExportacion.js";

/**
 * Hook que maneja toda la lógica relacionada con la información del usuario/cliente
 */
export const useHomeInfo = (
  user,
  clienteSeleccionado,
  opcionesClientes,
  isAdmin,
  setIsLoading
) => {
  const { obtenerInformacion } = useInfoUsuarioService();
  const refInformacion = useRef(null);

  const {
    terminosBusqueda,
    filtrarPorFecha,
    setFiltrarPorFecha,
    isDatoValue,
    isDetalleValue,
    whichInfo,
    isInfoCargando,
    setIsInfoCargando,
    refDato,
    refDetalle,
    filtroInformacion,
  } = useFiltros(refInformacion);

  // Determinar el userId según el rol
  const getUserId = () => {
    // Si hay un cliente seleccionado, usar su ID
    if (clienteSeleccionado?.value) {
      return clienteSeleccionado.value;
    }
    // Si es admin y no hay cliente seleccionado, devolver null para obtener todos los registros
    if (isAdmin) {
      return null;
    }
    // Si es usuario, devolver su propio ID
    return user?.id || user?.value;
  };

  const cargarInformacion = async () => {
    setIsInfoCargando(true);
    const userId = getUserId();
    const response = await obtenerInformacion(userId);
    refInformacion.current = response.data.data;
    filtroInformacion();
  };

  // Crear opciones de cliente para exportación
  const getOpcionesClientesExportacion = () => {
    if (opcionesClientes && opcionesClientes.length > 0) {
      // Admin: usa todas las opciones de clientes
      return opcionesClientes;
    }
    // Usuario: solo su propio registro
    return user
      ? [
          {
            value: user.id || user.value,
            label: user.nombre,
          },
        ]
      : [];
  };

  const opcionesClientesExportacion = getOpcionesClientesExportacion();

  // Exportación
  const { exportarComoPDF, exportarComoExcell } = useExportacion(
    whichInfo,
    opcionesClientesExportacion,
    setIsLoading
  );

  return {
    cargarInformacion,
    terminosBusqueda,
    filtrarPorFecha,
    setFiltrarPorFecha,
    isDatoValue,
    isDetalleValue,
    whichInfo,
    isInfoCargando,
    refDato,
    refDetalle,
    filtroInformacion,
    exportarComoPDF,
    exportarComoExcell,
  };
};
