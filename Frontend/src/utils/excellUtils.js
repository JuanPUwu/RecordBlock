import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const exportarExcel = async (whichInfo, opcionesClientes) => {
  try {
    // 🔹 Asegurar que opcionesClientes sea un array
    const clientesArray = Array.isArray(opcionesClientes)
      ? opcionesClientes
      : [opcionesClientes];

    // 🔹 1. Reunir todas las claves de manera dinámica
    const allKeys = new Set();

    for (const item of whichInfo) {
      allKeys.add("# Registro");
      allKeys.add("Cliente");

      for (const detalle of item.datos) {
        for (const k of Object.keys(detalle)) {
          allKeys.add(k);
        }
      }
    }

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
    for (const item of whichInfo) {
      const clienteObj = clientesArray.find(
        (c) =>
          (c.value !== undefined && c.value === item.usuario_id) ||
          (c.id !== undefined && c.id === item.usuario_id)
      );

      const clienteNombre =
        clienteObj?.label ?? clienteObj?.nombre ?? item.usuario_id;

      for (const detalle of item.datos) {
        const row = {
          "# Registro": `°${item.info_id}`,
          Cliente: clienteNombre,
          ...detalle,
        };
        worksheet.addRow(row);
      }
    }

    // 🔹 4. Dar estilo a los encabezados
    worksheet.getRow(1).font = { bold: true };

    // 🔹 5. Alinear columna "# Registro" a la izquierda
    worksheet.getColumn("# Registro").alignment = { horizontal: "left" };

    // 🔹 5.5 Ajustar ancho de columnas automáticamente
    for (const column of worksheet.columns) {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : "";
        maxLength = Math.max(maxLength, cellValue.length);
      });
      column.width = Math.max(15, maxLength);
    }

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
