/**
 * Hook compartido para manejar la exportación de información (PDF y Excel)
 */
export const useExportacion = (whichInfo, opcionesClientes, setIsLoading) => {
  const exportarComoPDF = async () => {
    setIsLoading(true);
    const { exportarPDF } = await import("../utils/pdfUtils.js");
    try {
      await exportarPDF(whichInfo, opcionesClientes);
    } finally {
      setIsLoading(false);
    }
  };

  const exportarComoExcell = async () => {
    setIsLoading(true);
    const { exportarExcel } = await import("../utils/excellUtils.js");
    try {
      await exportarExcel(whichInfo, opcionesClientes);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    exportarComoPDF,
    exportarComoExcell,
  };
};

