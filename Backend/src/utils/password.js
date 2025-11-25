export const isValidPassword = (password) => {
  // Mantenemos la misma regla que tenías
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
};
