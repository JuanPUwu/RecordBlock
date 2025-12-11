import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { saveAs } from "file-saver";

// 🔹 Plantilla PDF fija
import plantillaPdf from "../assets/docs/Plantilla Documento Axity Horizontal.pdf";

// Función para dividir texto en líneas (solo para encabezados - divide por "/")
const splitTextToLines = (text, width, font, fontSize) => {
  if (!text) return [""];
  const parts = text.split("/");
  const lines = [];
  for (const [index, part] of parts.entries()) {
    let currentLine = part.trim();
    if (index < parts.length - 1) currentLine += "/";
    let tempLine = "";
    for (const char of currentLine) {
      const testLine = tempLine + char;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (textWidth > width - 4) {
        lines.push(tempLine.trimEnd() + "-");
        tempLine = char;
      } else {
        tempLine = testLine;
      }
    }
    if (tempLine) lines.push(tempLine);
  }
  return lines;
};

// Función para dividir texto en líneas (para cuerpo de tabla - NO divide por "/")
const splitTextToLinesBody = (text, width, font, fontSize) => {
  if (!text) return [""];
  let tempLine = "";
  const lines = [];
  for (const char of text) {
    const testLine = tempLine + char;
    const textWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (textWidth > width - 4) {
      lines.push(tempLine.trimEnd() + "-");
      tempLine = char;
    } else {
      tempLine = testLine;
    }
  }
  if (tempLine) lines.push(tempLine);
  return lines;
};

// Inicializar PDF y recursos
const inicializarPDF = async () => {
  const response = await fetch(plantillaPdf);
  const pdfBytes = await response.arrayBuffer();
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const plantillaBase = await PDFDocument.load(pdfBytes);

  const headerColor = rgb(54 / 255, 4 / 255, 78 / 255);
  const cellBgColor = rgb(1, 1, 1);
  const textColor = rgb(0, 0, 0);
  const headerTextColor = rgb(1, 1, 1);

  const pageWidth = pdfDoc.getPage(0).getWidth();
  const pageHeight = pdfDoc.getPage(0).getHeight();
  const marginSuperior = 40;
  const marginInferior = 40;
  const marginX = 40;
  const usableWidth = pageWidth - marginX * 2;
  const yInicial = pageHeight - marginSuperior;

  const baseRowHeight = 12;
  const fontSize = 6;

  return {
    pdfDoc,
    font,
    boldFont,
    plantillaBase,
    headerColor,
    cellBgColor,
    textColor,
    headerTextColor,
    pageWidth,
    marginX,
    marginInferior,
    usableWidth,
    yInicial,
    baseRowHeight,
    fontSize,
  };
};

// Dibujar título y fecha
const dibujarTituloYFecha = (
  page,
  boldFont,
  font,
  pageWidth,
  marginX,
  textColor,
  y
) => {
  const title = "Inventario de equipos";
  const titleWidth = boldFont.widthOfTextAtSize(title, 16);
  page.drawText(title, {
    x: (pageWidth - titleWidth) / 2,
    y,
    size: 16,
    font: boldFont,
    color: textColor,
  });
  let newY = y - 25;

  const fecha = new Date().toLocaleString();
  page.drawText("Fecha de reporte: ", {
    x: marginX,
    y: newY,
    size: 8,
    font: boldFont,
    color: textColor,
  });
  page.drawText(fecha, {
    x: marginX + boldFont.widthOfTextAtSize("Fecha de reporte: ", 8),
    y: newY,
    size: 8,
    font,
    color: textColor,
  });
  return { fecha, y: newY - 15 };
};

// Agrupar registros por cliente
const agruparPorCliente = (whichInfo) => {
  return whichInfo.reduce((acc, item) => {
    const clienteId = item.usuario_id;
    if (!acc[clienteId]) acc[clienteId] = [];
    acc[clienteId].push(item);
    return acc;
  }, {});
};

// Obtener nombre del cliente
const obtenerNombreCliente = (clienteRegistros, opcionesClientes) => {
  const clientesArray = Array.isArray(opcionesClientes)
    ? opcionesClientes
    : [opcionesClientes];

  const clienteObj = clientesArray.find(
    (c) =>
      (c.value !== undefined && c.value === clienteRegistros[0].usuario_id) ||
      (c.id !== undefined && c.id === clienteRegistros[0].usuario_id)
  );

  const nombre =
    clienteObj?.label ?? clienteObj?.nombre ?? clienteRegistros[0].usuario_id;
  return String(nombre);
};

// Función para normalizar texto (igual que en el backend)
const normalizar = (texto) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "");

// Obtener headers de un cliente (normalizando variaciones)
const obtenerHeadersCliente = (clienteRegistros) => {
  const allKeysCliente = new Set();
  const mapaClaves = new Map(); // Mapa: clave normalizada -> clave original (primera que aparece)

  allKeysCliente.add("#");
  mapaClaves.set("#", "#");

  for (const item of clienteRegistros) {
    for (const detalle of item.datos) {
      for (const k of Object.keys(detalle)) {
        const claveNormalizada = normalizar(k);
        if (!mapaClaves.has(claveNormalizada)) {
          // Guardar la primera versión que aparece como la original
          mapaClaves.set(claveNormalizada, k);
        }
        allKeysCliente.add(claveNormalizada);
      }
    }
  }

  // Retornar las claves originales (no normalizadas) para mostrar en el PDF
  const headers = Array.from(allKeysCliente).map((claveNorm) =>
    mapaClaves.get(claveNorm)
  );

  // Crear mapa: header original -> clave normalizada
  const mapaHeaderANormalizada = new Map();
  for (const header of headers) {
    mapaHeaderANormalizada.set(header, normalizar(header));
  }

  return { headers, mapaHeaderANormalizada };
};

// Dibujar encabezado de tabla
const dibujarEncabezado = (config) => {
  const {
    page,
    headers,
    y,
    marginX,
    usableWidth,
    boldFont,
    fontSize,
    headerColor,
    headerTextColor,
    baseRowHeight,
    splitTextToLines,
  } = config;
  const fixedHashWidth = 40;
  const remainingCols = headers.length - 1;
  const otherColWidth = (usableWidth - fixedHashWidth) / remainingCols;
  const getColWidth = (header) =>
    header === "#" ? fixedHashWidth : otherColWidth;

  let xPos = marginX;
  let headerMaxLines = 1;
  const headerLines = headers.map((header) => {
    const colWidth = getColWidth(header);
    const lines = splitTextToLines(header, colWidth, boldFont, fontSize);
    if (lines.length > headerMaxLines) headerMaxLines = lines.length;
    return lines;
  });
  const headerHeight = baseRowHeight * headerMaxLines;

  for (const [i, header] of headers.entries()) {
    const colWidth = getColWidth(header);
    page.drawRectangle({
      x: xPos,
      y: y - headerHeight,
      width: colWidth,
      height: headerHeight,
      color: headerColor,
      borderColor: headerColor,
      borderWidth: 0.5,
    });

    const lines = headerLines[i];
    let textY = y - 10;
    for (const line of lines) {
      const textWidth = boldFont.widthOfTextAtSize(line, fontSize);
      const centeredX = xPos + (colWidth - textWidth) / 2;
      page.drawText(line, {
        x: centeredX,
        y: textY,
        size: fontSize,
        font: boldFont,
        color: headerTextColor,
      });
      textY -= baseRowHeight;
    }
    xPos += colWidth;
  }

  return { headerHeight, getColWidth };
};

// Calcular líneas de celdas
const calcularLineasCeldas = (config) => {
  const {
    row,
    headers,
    mapaHeaderANormalizada,
    getColWidth,
    font,
    fontSize,
    splitTextToLinesBody,
    baseRowHeight,
  } = config;
  const cellLines = {};
  let maxLines = 1;

  // Crear un mapa de claves normalizadas del row para búsqueda eficiente
  const rowNormalizado = new Map();
  for (const [clave, valor] of Object.entries(row)) {
    const claveNorm = normalizar(clave);
    // Si hay múltiples claves que normalizan a lo mismo, mantener el primer valor encontrado
    if (!rowNormalizado.has(claveNorm)) {
      rowNormalizado.set(claveNorm, valor);
    }
  }

  for (const h of headers) {
    const colWidth = getColWidth(h);
    // Buscar el valor usando la clave normalizada
    const claveNormalizada = mapaHeaderANormalizada.get(h) || normalizar(h);
    const value = String(rowNormalizado.get(claveNormalizada) ?? "");
    const lines = splitTextToLinesBody(value, colWidth, font, fontSize);
    cellLines[h] = lines;
    if (lines.length > maxLines) maxLines = lines.length;
  }

  return { cellLines, adjustedHeight: baseRowHeight * maxLines };
};

// Crear nueva página si es necesario
const crearNuevaPaginaSiNecesario = async (
  currentY,
  adjustedHeight,
  marginInferior,
  yInicial,
  pdfDoc,
  plantillaBase
) => {
  if (currentY - adjustedHeight < marginInferior) {
    const [newPage] = await pdfDoc.copyPages(plantillaBase, [0]);
    pdfDoc.addPage(newPage);
    return { page: newPage, y: yInicial };
  }
  return null;
};

// Dibujar celdas de una fila
const dibujarCeldasFila = (config) => {
  const {
    page,
    headers,
    marginX,
    y,
    adjustedHeight,
    getColWidth,
    headerColor,
    cellBgColor,
  } = config;
  let xPos = marginX;
  for (const h of headers) {
    const colWidth = getColWidth(h);
    page.drawRectangle({
      x: xPos,
      y: y - adjustedHeight,
      width: colWidth,
      height: adjustedHeight,
      color: cellBgColor,
      borderColor: headerColor,
      borderWidth: 0.5,
      opacity: 0.7,
    });
    xPos += colWidth;
  }
};

// Dibujar texto de una fila
const dibujarTextoFila = (config) => {
  const {
    page,
    headers,
    cellLines,
    marginX,
    y,
    getColWidth,
    font,
    fontSize,
    textColor,
    baseRowHeight,
  } = config;
  let xPos = marginX;
  for (const h of headers) {
    const lines = cellLines[h];
    let textY = y - 10;
    for (const line of lines) {
      page.drawText(line, {
        x: xPos + 3,
        y: textY,
        size: fontSize,
        font,
        color: textColor,
      });
      textY -= baseRowHeight;
    }
    xPos += getColWidth(h);
  }
};

// Dibujar filas de tabla
const dibujarFilas = async (config) => {
  const {
    page,
    clienteRegistros,
    headers,
    mapaHeaderANormalizada,
    y,
    marginX,
    marginInferior,
    yInicial,
    pdfDoc,
    plantillaBase,
    getColWidth,
    baseRowHeight,
    font,
    fontSize,
    headerColor,
    cellBgColor,
    textColor,
    splitTextToLinesBody,
  } = config;
  let currentY = y;
  let currentPage = page;

  for (const item of clienteRegistros) {
    for (const detalle of item.datos) {
      const row = { "#": `°${item.info_id}`, ...detalle };
      const { cellLines, adjustedHeight } = calcularLineasCeldas({
        row,
        headers,
        mapaHeaderANormalizada,
        getColWidth,
        font,
        fontSize,
        splitTextToLinesBody,
        baseRowHeight,
      });

      const nuevaPagina = await crearNuevaPaginaSiNecesario(
        currentY,
        adjustedHeight,
        marginInferior,
        yInicial,
        pdfDoc,
        plantillaBase
      );
      if (nuevaPagina) {
        currentPage = nuevaPagina.page;
        currentY = nuevaPagina.y;
      }

      dibujarCeldasFila({
        page: currentPage,
        headers,
        marginX,
        y: currentY,
        adjustedHeight,
        getColWidth,
        headerColor,
        cellBgColor,
      });

      dibujarTextoFila({
        page: currentPage,
        headers,
        cellLines,
        marginX,
        y: currentY,
        getColWidth,
        font,
        fontSize,
        textColor,
        baseRowHeight,
      });

      currentY -= adjustedHeight;
    }
  }

  return { page: currentPage, y: currentY - 20 };
};

// Dibujar tabla de un cliente
const dibujarTablaCliente = async (config) => {
  const {
    page,
    clienteRegistros,
    opcionesClientes,
    y,
    marginX,
    marginInferior,
    yInicial,
    pdfDoc,
    plantillaBase,
    usableWidth,
    boldFont,
    font,
    fontSize,
    headerColor,
    headerTextColor,
    cellBgColor,
    textColor,
    baseRowHeight,
    splitTextToLines,
    splitTextToLinesBody,
  } = config;
  const clienteNombre = obtenerNombreCliente(
    clienteRegistros,
    opcionesClientes
  );

  page.drawText("Cliente: ", {
    x: marginX,
    y,
    size: 8,
    font: boldFont,
    color: textColor,
  });
  page.drawText(String(clienteNombre), {
    x: marginX + boldFont.widthOfTextAtSize("Cliente: ", 8),
    y,
    size: 8,
    font,
    color: textColor,
  });
  let currentY = y - 15;

  const { headers, mapaHeaderANormalizada } =
    obtenerHeadersCliente(clienteRegistros);
  const { headerHeight, getColWidth } = dibujarEncabezado({
    page,
    headers,
    y: currentY,
    marginX,
    usableWidth,
    boldFont,
    fontSize,
    headerColor,
    headerTextColor,
    baseRowHeight,
    splitTextToLines,
  });

  currentY -= headerHeight;

  const { page: newPage, y: finalY } = await dibujarFilas({
    page,
    clienteRegistros,
    headers,
    mapaHeaderANormalizada,
    y: currentY,
    marginX,
    marginInferior,
    yInicial,
    pdfDoc,
    plantillaBase,
    getColWidth,
    baseRowHeight,
    font,
    fontSize,
    headerColor,
    cellBgColor,
    textColor,
    splitTextToLinesBody,
  });

  return { page: newPage, y: finalY };
};

export const exportarPDF = async (whichInfo, opcionesClientes) => {
  try {
    const recursos = await inicializarPDF();
    const {
      pdfDoc,
      font,
      boldFont,
      plantillaBase,
      headerColor,
      cellBgColor,
      textColor,
      headerTextColor,
      pageWidth,
      marginX,
      marginInferior,
      usableWidth,
      yInicial,
      baseRowHeight,
      fontSize,
    } = recursos;

    let page = pdfDoc.getPage(0);
    const { fecha, y: yAfterTitle } = dibujarTituloYFecha(
      page,
      boldFont,
      font,
      pageWidth,
      marginX,
      textColor,
      recursos.yInicial
    );

    const registrosPorCliente = agruparPorCliente(whichInfo);
    let currentY = yAfterTitle;
    let currentPage = page;

    for (const clienteId in registrosPorCliente) {
      const clienteRegistros = registrosPorCliente[clienteId];
      const resultado = await dibujarTablaCliente({
        page: currentPage,
        clienteRegistros,
        opcionesClientes,
        y: currentY,
        marginX,
        marginInferior,
        yInicial,
        pdfDoc,
        plantillaBase,
        usableWidth,
        boldFont,
        font,
        fontSize,
        headerColor,
        headerTextColor,
        cellBgColor,
        textColor,
        baseRowHeight,
        splitTextToLines,
        splitTextToLinesBody,
      });
      currentPage = resultado.page;
      currentY = resultado.y;
    }

    const pdfBytesOut = await pdfDoc.save();
    const blob = new Blob([pdfBytesOut], { type: "application/pdf" });
    saveAs(blob, `inventario de equipos ${fecha}.pdf`);
  } catch (error) {
    console.error("Error exportando PDF:", error);
  }
};
