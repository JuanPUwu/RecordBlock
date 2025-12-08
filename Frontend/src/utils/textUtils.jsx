export const resaltarTexto = (texto, termino, esLlave = false) => {
  if (!termino || !texto) return String(texto);

  const terminoEscapado = termino.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${terminoEscapado})`, "gi");

  const partes = String(texto).split(regex);

  return partes.map((parte, index) => {
    if (parte.toLowerCase() === termino.toLowerCase()) {
      return (
        <span key={index} className={esLlave ? "highlight-key" : "highlight"}>
          {parte}
        </span>
      );
    }
    return parte;
  });
};
