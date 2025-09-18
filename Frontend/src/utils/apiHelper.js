export const handleRequest = async (callback) => {
  try {
    const res = await callback();
    return { success: true, data: res.data };
  } catch (error) {
    const msg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Error en la petición";

    return { success: false, error: msg };
  }
};
