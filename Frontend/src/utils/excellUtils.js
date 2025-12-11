import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Función para normalizar texto (igual que en el backend y pdfUtils)
const normalizar = (texto) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "");

export const exportarExcel = async (whichInfo, opcionesClientes) => {
  try {
    // 🔹 Asegurar que opcionesClientes sea un array
    const clientesArray = Array.isArray(opcionesClientes)
      ? opcionesClientes
      : [opcionesClientes];

    // 🔹 1. Reunir todas las claves de manera dinámica (normalizando variaciones)
    const allKeys = new Set();
    const mapaClaves = new Map(); // Mapa: clave normalizada -> clave original (primera que aparece)

    allKeys.add("# Registro");
    mapaClaves.set("# Registro", "# Registro");
    allKeys.add("Cliente");
    mapaClaves.set("Cliente", "Cliente");

    for (const item of whichInfo) {
      for (const detalle of item.datos) {
        for (const k of Object.keys(detalle)) {
          const claveNormalizada = normalizar(k);
          if (!mapaClaves.has(claveNormalizada)) {
            // Guardar la primera versión que aparece como la original
            mapaClaves.set(claveNormalizada, k);
          }
          allKeys.add(claveNormalizada);
        }
      }
    }

    // Retornar las claves originales (no normalizadas) para mostrar en el Excel
    const headers = Array.from(allKeys).map((claveNorm) =>
      mapaClaves.get(claveNorm)
    );

    // Crear mapa: header original -> clave normalizada
    const mapaHeaderANormalizada = new Map();
    for (const header of headers) {
      mapaHeaderANormalizada.set(header, normalizar(header));
    }

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

      const clienteNombre = String(
        clienteObj?.label ?? clienteObj?.nombre ?? item.usuario_id
      );

      for (const detalle of item.datos) {
        // Normalizar las claves del detalle para unificar variaciones
        const detalleNormalizado = {};
        for (const [clave, valor] of Object.entries(detalle)) {
          const claveNormalizada = normalizar(clave);
          // Si hay múltiples claves que normalizan a lo mismo, mantener el primer valor encontrado
          if (!detalleNormalizado.hasOwnProperty(claveNormalizada)) {
            detalleNormalizado[claveNormalizada] = valor;
          }
        }

        // Crear el row usando los headers originales pero buscando valores por clave normalizada
        const row = {
          "# Registro": `°${item.info_id}`,
          Cliente: clienteNombre,
        };

        // Mapear valores del detalle normalizado a los headers originales
        for (const header of headers) {
          if (header !== "# Registro" && header !== "Cliente") {
            const claveNormalizada = mapaHeaderANormalizada.get(header);
            row[header] = detalleNormalizado[claveNormalizada] ?? "";
          }
        }

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
