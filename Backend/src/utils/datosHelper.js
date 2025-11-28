import { getAsync } from "./dbHelper.js";
// Normalizar texto
export const normalizar = (texto) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "");

// Leer campos mínimos
export const obtenerCamposMinimos = async () => {
  const fila = await getAsync("SELECT datos FROM datos_minimos LIMIT 1");
  let lista = [];
  try {
    lista = JSON.parse(fila.datos || "[]");
  } catch {
    lista = [];
  }
  return lista.map(normalizar);
};

// Validar rol admin/cliente
export const obtenerUsuarioDestino = async (req, res) => {
  const isAdmin = req.usuario.isAdmin;

  if (isAdmin) {
    const { usuario_id } = req.body;
    const usuario = await getAsync("SELECT isAdmin FROM usuario WHERE id = ?", [
      usuario_id,
    ]);

    if (!usuario)
      return res.status(404).json({
        success: false,
        message: "El usuario destino no existe.",
      });

    if (usuario.isAdmin)
      return res.status(400).json({
        success: false,
        message: "El usuario administrador no puede recibir información.",
      });

    return { usuario_id };
  }

  if (!isAdmin) {
    return { usuario_id: req.usuario.id };
  }

  res.status(403).json({ success: false, message: "Rol no autorizado." });
  return null;
};

// Validar campos mínimos en un registro
export const validarRegistro = (registro, camposMinimos) => {
  const clavesNorm = Object.keys(registro).map((k) => normalizar(k));

  const faltantes = camposMinimos.filter((campo) => {
    const idx = clavesNorm.indexOf(campo);
    if (idx === -1) return true;

    const valor = registro[Object.keys(registro)[idx]];
    return (
      valor === null ||
      valor === undefined ||
      (typeof valor === "string" && valor.trim() === "")
    );
  });

  return faltantes;
};
