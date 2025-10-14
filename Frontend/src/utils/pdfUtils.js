import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { saveAs } from "file-saver";

// 🔹 Plantilla PDF fija
import plantillaPdf from "../assets/docs/Plantilla Documento Axity Horizontal.pdf";

export const exportarPDF = async (whichInfo, opcionesClientes) => {
  try {
    // 🔹 Cargar plantilla original
    const response = await fetch(plantillaPdf);
    const pdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const plantillaBase = await PDFDocument.load(pdfBytes);

    // 🔹 Colores
    const headerColor = rgb(54 / 255, 4 / 255, 78 / 255);
    const cellBgColor = rgb(1, 1, 1);
    const textColor = rgb(0, 0, 0);
    const headerTextColor = rgb(1, 1, 1);

    // 🔹 Dimensiones y márgenes
    const pageWidth = pdfDoc.getPage(0).getWidth();
    const pageHeight = pdfDoc.getPage(0).getHeight();
    const marginSuperior = 40;
    const marginInferior = 40;
    const marginX = 40;
    const usableWidth = pageWidth - marginX * 2;
    const yInicial = pageHeight - marginSuperior;

    let page = pdfDoc.getPage(0);
    let y = yInicial;
    const baseRowHeight = 12;
    const fontSize = 6;

    // ===== 1️⃣ Título y fecha =====
    const title = "Inventario de equipos";
    const titleWidth = boldFont.widthOfTextAtSize(title, 16);
    page.drawText(title, {
      x: (pageWidth - titleWidth) / 2,
      y,
      size: 16,
      font: boldFont,
      color: textColor,
    });
    y -= 25;

    const fecha = new Date().toLocaleString();
    page.drawText("Fecha de reporte: ", {
      x: marginX,
      y,
      size: 8,
      font: boldFont,
      color: textColor,
    });
    page.drawText(fecha, {
      x: marginX + boldFont.widthOfTextAtSize("Fecha de reporte: ", 8),
      y,
      size: 8,
      font,
      color: textColor,
    });
    y -= 15;

    // ===== 2️⃣ Función para dividir texto en líneas =====
    const splitTextToLines = (text, width, font, fontSize) => {
      if (!text) return [""];
      const parts = text.split("/");
      const lines = [];
      parts.forEach((part, index) => {
        let currentLine = part.trim();
        if (index < parts.length - 1) currentLine += "/";
        let tempLine = "";
        for (let i = 0; i < currentLine.length; i++) {
          const testLine = tempLine + currentLine[i];
          const textWidth = font.widthOfTextAtSize(testLine, fontSize);
          if (textWidth > width - 4) {
            lines.push(tempLine.trimEnd() + "-");
            tempLine = currentLine[i];
          } else {
            tempLine = testLine;
          }
        }
        if (tempLine) lines.push(tempLine);
      });
      return lines;
    };

    // ===== 3️⃣ Agrupar registros por cliente =====
    const registrosPorCliente = whichInfo.reduce((acc, item) => {
      const clienteId = item.usuario_id;
      if (!acc[clienteId]) acc[clienteId] = [];
      acc[clienteId].push(item);
      return acc;
    }, {});

    // ===== 4️⃣ Dibujar tablas por cliente =====
    for (const clienteId in registrosPorCliente) {
      const clienteRegistros = registrosPorCliente[clienteId];

      // 🔹 Normalizar opcionesClientes como array
      const clientesArray = Array.isArray(opcionesClientes)
        ? opcionesClientes
        : [opcionesClientes];

      // 🔹 Buscar cliente compatible con ambos formatos
      const clienteObj = clientesArray.find(
        (c) =>
          (c.value !== undefined &&
            c.value === clienteRegistros[0].usuario_id) ||
          (c.id !== undefined && c.id === clienteRegistros[0].usuario_id)
      );

      const clienteNombre =
        clienteObj?.label ??
        clienteObj?.nombre ??
        clienteRegistros[0].usuario_id;

      // Cliente
      page.drawText("Cliente: ", {
        x: marginX,
        y,
        size: 8,
        font: boldFont,
        color: textColor,
      });
      page.drawText(clienteNombre, {
        x: marginX + boldFont.widthOfTextAtSize("Cliente: ", 8),
        y,
        size: 8,
        font,
        color: textColor,
      });
      y -= 15;

      // Encabezados dinámicos SOLO para este cliente
      const allKeysCliente = new Set();
      allKeysCliente.add("#");
      clienteRegistros.forEach((item) => {
        item.datos.forEach((detalle) => {
          Object.keys(detalle).forEach((k) => allKeysCliente.add(k));
        });
      });
      const headers = Array.from(allKeysCliente);

      const fixedHashWidth = 40;
      const remainingCols = headers.length - 1;
      const otherColWidth = (usableWidth - fixedHashWidth) / remainingCols;
      const getColWidth = (header) =>
        header === "#" ? fixedHashWidth : otherColWidth;

      // Dibujar encabezado
      let xPos = marginX;
      let headerMaxLines = 1;
      const headerLines = headers.map((header) => {
        const colWidth = getColWidth(header);
        const lines = splitTextToLines(header, colWidth, boldFont, fontSize);
        if (lines.length > headerMaxLines) headerMaxLines = lines.length;
        return lines;
      });
      const headerHeight = baseRowHeight * headerMaxLines;

      headers.forEach((header, i) => {
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
        lines.forEach((line) => {
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
        });
        xPos += colWidth;
      });

      y -= headerHeight;

      // Dibujar filas
      for (const item of clienteRegistros) {
        for (const detalle of item.datos) {
          const row = { "#": `°${item.info_id}`, ...detalle };
          const cellLines = {};
          let maxLines = 1;

          headers.forEach((h) => {
            const colWidth = getColWidth(h);
            const value = String(row[h] ?? "");
            const lines = splitTextToLines(value, colWidth, font, fontSize);
            cellLines[h] = lines;
            if (lines.length > maxLines) maxLines = lines.length;
          });

          const adjustedHeight = baseRowHeight * maxLines;

          // Dibujar celdas
          xPos = marginX;
          headers.forEach((h) => {
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
          });

          // Dibujar texto
          xPos = marginX;
          headers.forEach((h) => {
            const lines = cellLines[h];
            let textY = y - 10;
            lines.forEach((line) => {
              page.drawText(line, {
                x: xPos + 3,
                y: textY,
                size: fontSize,
                font,
                color: textColor,
              });
              textY -= baseRowHeight;
            });
            xPos += getColWidth(h);
          });

          y -= adjustedHeight;

          // Nueva página si se llena
          if (y - adjustedHeight < marginInferior) {
            const [newPage] = await pdfDoc.copyPages(plantillaBase, [0]);
            page = newPage;
            pdfDoc.addPage(page);
            y = yInicial;
          }
        }
      }

      y -= 20; // espacio entre clientes
    }

    // Guardar PDF
    const pdfBytesOut = await pdfDoc.save();
    const blob = new Blob([pdfBytesOut], { type: "application/pdf" });
    saveAs(blob, `inventario de equipos ${fecha}.pdf`);
  } catch (error) {
    console.error("Error exportando PDF:", error);
  }
};
