import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Función para normalizar texto (igual que en el backend y pdfUtils)
const normalizar = (texto) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "");

// Función auxiliar: Recolectar todas las claves únicas normalizadas
const recolectarClaves = (whichInfo) => {
  const allKeys = new Set();
  const mapaClaves = new Map();

  allKeys.add("# Registro");
  mapaClaves.set("# Registro", "# Registro");
  allKeys.add("Cliente");
  mapaClaves.set("Cliente", "Cliente");

  for (const item of whichInfo) {
    for (const detalle of item.datos) {
      for (const k of Object.keys(detalle)) {
        const claveNormalizada = normalizar(k);
        if (!mapaClaves.has(claveNormalizada)) {
          mapaClaves.set(claveNormalizada, k);
        }
        allKeys.add(claveNormalizada);
      }
    }
  }

  return { allKeys, mapaClaves };
};

// Función auxiliar: Crear headers y mapa de normalización
const crearHeadersYMapa = (allKeys, mapaClaves) => {
  const headers = Array.from(allKeys).map((claveNorm) =>
    mapaClaves.get(claveNorm)
  );

  const mapaHeaderANormalizada = new Map();
  for (const header of headers) {
    mapaHeaderANormalizada.set(header, normalizar(header));
  }

  return { headers, mapaHeaderANormalizada };
};

// Función auxiliar: Encontrar nombre del cliente
const obtenerNombreCliente = (item, clientesArray) => {
  const clienteObj = clientesArray.find(
    (c) =>
      (c.value !== undefined && c.value === item.usuario_id) ||
      (c.id !== undefined && c.id === item.usuario_id)
  );

  return String(clienteObj?.label ?? clienteObj?.nombre ?? item.usuario_id);
};

// Función auxiliar: Normalizar detalle
const normalizarDetalle = (detalle) => {
  const detalleNormalizado = {};
  for (const [clave, valor] of Object.entries(detalle)) {
    const claveNormalizada = normalizar(clave);
    if (!detalleNormalizado.hasOwnProperty(claveNormalizada)) {
      detalleNormalizado[claveNormalizada] = valor;
    }
  }
  return detalleNormalizado;
};

// Función auxiliar: Crear fila de datos
const crearFila = (
  item,
  clienteNombre,
  detalleNormalizado,
  headers,
  mapaHeaderANormalizada
) => {
  const row = {
    "# Registro": `°${item.info_id}`,
    Cliente: clienteNombre,
  };

  for (const header of headers) {
    if (header !== "# Registro" && header !== "Cliente") {
      const claveNormalizada = mapaHeaderANormalizada.get(header);
      row[header] = detalleNormalizado[claveNormalizada] ?? "";
    }
  }

  return row;
};

// Función auxiliar: Aplicar estilos al worksheet
const aplicarEstilos = (worksheet) => {
  worksheet.getRow(1).font = { bold: true };
  worksheet.getColumn("# Registro").alignment = { horizontal: "left" };
};

// Función auxiliar: Ajustar anchos de columnas
const ajustarAnchosColumnas = (worksheet) => {
  for (const column of worksheet.columns) {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const cellValue = cell.value ? cell.value.toString() : "";
      maxLength = Math.max(maxLength, cellValue.length);
    });
    column.width = Math.max(15, maxLength);
  }
};

// Función auxiliar: Agregar filas al worksheet
const agregarFilas = (
  worksheet,
  whichInfo,
  clientesArray,
  headers,
  mapaHeaderANormalizada
) => {
  for (const item of whichInfo) {
    const clienteNombre = obtenerNombreCliente(item, clientesArray);

    for (const detalle of item.datos) {
      const detalleNormalizado = normalizarDetalle(detalle);
      const row = crearFila(
        item,
        clienteNombre,
        detalleNormalizado,
        headers,
        mapaHeaderANormalizada
      );
      worksheet.addRow(row);
    }
  }
};

export const exportarExcel = async (whichInfo, opcionesClientes) => {
  try {
    const clientesArray = Array.isArray(opcionesClientes)
      ? opcionesClientes
      : [opcionesClientes];

    const { allKeys, mapaClaves } = recolectarClaves(whichInfo);
    const { headers, mapaHeaderANormalizada } = crearHeadersYMapa(
      allKeys,
      mapaClaves
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Informe");

    worksheet.columns = headers.map((h) => ({
      header: h,
      key: h,
      width: Math.max(h.length + 5, 15),
    }));

    agregarFilas(
      worksheet,
      whichInfo,
      clientesArray,
      headers,
      mapaHeaderANormalizada
    );
    aplicarEstilos(worksheet);
    ajustarAnchosColumnas(worksheet);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `inventario de equipos ${new Date().toLocaleString()}.xlsx`);
  } catch (error) {
    console.error("Error exportando Excel:", error);
  }
};
