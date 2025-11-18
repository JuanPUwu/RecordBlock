export const parseDateDMY = (str) => {
  const [day, month, year] = str.split("/").map(Number);

  // Validar rangos básicos
  if (!day || !month || !year) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  // Crear fecha
  const date = new Date(year, month - 1, day);

  // Validar que JavaScript no "corrigió" una fecha inválida
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null; // fecha inválida
  }

  return date;
};
