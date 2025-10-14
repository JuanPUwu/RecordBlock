import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const exportarExcel = async (whichInfo, opcionesClientes) => {
  try {
    // 🔹 1. Reunir todas las claves de manera dinámica
    const allKeys = new Set();

    whichInfo.forEach((item) => {
      allKeys.add("# Registro");
      allKeys.add("Cliente");

      item.datos.forEach((detalle) => {
        Object.keys(detalle).forEach((k) => allKeys.add(k));
      });
    });

    const headers = Array.from(allKeys);

    // 🔹 2. Crear workbook y worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Informe");

    // Definir columnas dinámicamente
    worksheet.columns = headers.map((h) => ({
      header: h,
      key: h,
      width: Math.max(h.length + 5, 15),
    }));

    // 🔹 3. Agregar filas
    whichInfo.forEach((item) => {
      const clienteNombre =
        opcionesClientes.find((c) => c.value === item.usuario_id)?.label ||
        item.usuario_id;

      item.datos.forEach((detalle) => {
        const row = {
          "# Registro": `°${item.info_id}`,
          Cliente: clienteNombre,
          ...detalle,
        };
        worksheet.addRow(row);
      });
    });

    // 🔹 4. Dar estilo a los encabezados
    worksheet.getRow(1).font = { bold: true };

    // 🔹 5. Alinear columna "# Registro" a la izquierda
    worksheet.getColumn("# Registro").alignment = { horizontal: "left" };

    // 🔹 6. Exportar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `inventario de equipos ${new Date().toLocaleString()}.xlsx`);
  } catch (error) {
    console.error("Error exportando Excel:", error);
  }
};
