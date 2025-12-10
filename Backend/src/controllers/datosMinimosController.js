import { runAsync, getAsync } from "../utils/dbHelper.js";
import { normalizar } from "../utils/datosHelper.js";

// GET Datos mínimos
export const obtenerDatosMinimos = async (req, res) => {
  try {
    const row = await getAsync("SELECT datos FROM datos_minimos WHERE id = 1");

    if (!row)
      return res.status(500).json({
        success: false,
        message: "No existe registro base",
      });

    return res.json({ success: true, data: JSON.parse(row.datos) });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error",
      error: err.message,
    });
  }
};

// PUT Reemplazar datos mínimos
export const reemplazarDatosMinimos = async (req, res) => {
  try {
    if (!req.usuario.isAdmin)
      return res.status(403).json({
        success: false,
        message: "Solo administrador",
      });

    const { datos } = req.body;
    if (!Array.isArray(datos))
      return res.status(400).json({
        success: false,
        message: "'datos' debe ser un array",
      });

    const vistos = new Set();
    const listaFinal = [];

    for (const item of datos) {
      const cmp = normalizar(String(item));
      if (!vistos.has(cmp)) {
        vistos.add(cmp);
        listaFinal.push(String(item).trim());
      }
    }

    await runAsync("UPDATE datos_minimos SET datos = ? WHERE id = 1", [
      JSON.stringify(listaFinal),
    ]);

    return res.json({
      success: true,
      message: "Datos mínimos reemplazados",
      datos: listaFinal,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error",
      error: err.message,
    });
  }
};


