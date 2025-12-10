// Función para parsear CSV
export const parsearCSV = (texto) => {
  const lineas = texto.split("\n").filter((linea) => linea.trim() !== "");
  if (lineas.length === 0) return { headers: [], filas: [] };

  // Función auxiliar para parsear una línea CSV (delimitado por punto y coma)
  const parsearLineaCSV = (linea) => {
    const valores = [];
    let valorActual = "";
    let dentroComillas = false;

    for (const char of linea) {
      if (char === '"') {
        dentroComillas = !dentroComillas;
      } else if (char === ";" && !dentroComillas) {
        valores.push(valorActual.trim().replaceAll(/(?:^"|"$)/g, ""));
        valorActual = "";
      } else {
        valorActual += char;
      }
    }
    valores.push(valorActual.trim().replaceAll(/(?:^"|"$)/g, "")); // Último valor

    return valores;
  };

  // Obtener headers (primera línea)
  const headers = parsearLineaCSV(lineas[0]);

  // Parsear filas (resto de líneas)
  const filas = lineas.slice(1).map((linea) => parsearLineaCSV(linea));

  return { headers, filas };
};

// Función para generar tabla HTML del CSV
export const generarTablaCSV = (headers, filas) => {
  const maxFilasMostrar = 50; // Limitar a 50 filas para no sobrecargar
  const filasAMostrar = filas.slice(0, maxFilasMostrar);
  const hayMasFilas = filas.length > maxFilasMostrar;

  let tablaHTML = `
    <div class="cont-tabla-csv">
      <table>
        <thead>
          <tr>
  `;

  // Headers
  for (const header of headers) {
    tablaHTML += `<th>${header}</th>`;
  }
  tablaHTML += `</tr></thead><tbody>`;

  // Filas
  for (const fila of filasAMostrar) {
    tablaHTML += `<tr>`;
    for (let colIndex = 0; colIndex < headers.length; colIndex++) {
      const valor = fila[colIndex] || "";
      tablaHTML += `<td title="${valor}">${valor}</td>`;
    }
    tablaHTML += `</tr>`;
  }

  tablaHTML += `</tbody></table></div>`;

  if (hayMasFilas) {
    tablaHTML += `<p>Mostrando ${maxFilasMostrar} de ${filas.length} filas...</p>`;
  }

  return tablaHTML;
};

