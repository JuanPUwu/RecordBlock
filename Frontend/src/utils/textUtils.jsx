export const resaltarTexto = (texto, termino, esLlave = false) => {
  if (!termino || !texto) return [String(texto)];

  const terminoEscapado = termino.replaceAll(
    /[.*+?^${}()|[\]\\]/g,
    String.raw`\$&`
  );
  const regex = new RegExp(`(${terminoEscapado})`, "gi");

  const partes = String(texto).split(regex);

  return partes.map((parte, index) => {
    const key = `${index}-${parte.substring(0, 10)}`;
    if (parte.toLowerCase() === termino.toLowerCase()) {
      return (
        <span key={key} className={esLlave ? "highlight-key" : "highlight"}>
          {parte}
        </span>
      );
    }
    return <span key={key}>{parte}</span>;
  });
};
