export const resaltarTexto = (texto, termino, esLlave = false) => {
  if (!termino || !texto) return String(texto);

  if (!String(texto).toLowerCase().includes(termino.toLowerCase())) {
    return String(texto);
  }

  const regex = new RegExp(
    `(${termino.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const partes = String(texto).split(regex);

  return partes.map((parte, index) => {
    if (regex.test(parte)) {
      return (
        <span key={index} className={esLlave ? "highlight-key" : "highlight"}>
          {parte}
        </span>
      );
    }
    return parte;
  });
};
