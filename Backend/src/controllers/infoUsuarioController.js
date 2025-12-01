import { runAsync, getAsync, allAsync } from "../utils/dbHelper.js";
import {
  obtenerCamposMinimos,
  obtenerUsuarioDestino,
  validarRegistro,
} from "../utils/datosHelper.js";

// GET Obtener información
export const obtenerInformacion = async (req, res) => {
  try {
    if (req.usuario.isAdmin) {
      return await obtenerInformacionAdmin(req, res);
    }
    return await obtenerInformacionCliente(req, res);
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Error", error: err.message });
  }
};

async function obtenerInformacionAdmin(req, res) {
  const { usuario_id } = req.query;
  let query = `
    SELECT iu.id, iu.usuario_id, iu.datos, u.nombre AS usuario_nombre
    FROM informacion_usuario iu
    JOIN usuario u ON iu.usuario_id = u.id
    WHERE u.isAdmin = 0
  `;

  const params = [];

  if (usuario_id) {
    query += " AND u.id = ?";
    params.push(usuario_id);
  }

  const rows = await allAsync(query, params);

  return res.json({
    success: true,
    data: rows.map((row) => ({
      info_id: row.id,
      usuario_id: row.usuario_id,
      usuario_nombre: row.usuario_nombre,
      datos: [JSON.parse(row.datos)],
    })),
  });
}

async function obtenerInformacionCliente(req, res) {
  const rows = await allAsync(
    "SELECT id, usuario_id, datos FROM informacion_usuario WHERE usuario_id = ?",
    [req.usuario.id]
  );

  return res.json({
    success: true,
    data: rows.map((row) => ({
      info_id: row.id,
      usuario_id: row.usuario_id,
      datos: [JSON.parse(row.datos)],
    })),
  });
}

// POST Crear información
export const crearInformacion = async (req, res) => {
  try {
    const destino = await obtenerUsuarioDestino(req, res);
    if (!destino) return;

    const { datos } = req.body;
    if (!datos)
      return res
        .status(400)
        .json({ success: false, message: "El campo 'datos' es obligatorio" });

    const registros = Array.isArray(datos) ? datos : [datos];
    const camposMinimos = await obtenerCamposMinimos();

    // Validar cada registro
    for (const reg of registros) {
      if (typeof reg !== "object")
        return res.status(400).json({
          success: false,
          message: "Cada elemento de 'datos' debe ser un JSON válido",
        });

      const faltantes = validarRegistro(reg, camposMinimos);
      if (faltantes.length)
        return res.status(400).json({
          success: false,
          message: `Faltan campos obligatorios: ${faltantes.join(", ")}`,
        });
    }

    // Insertar
    const placeholders = registros.map(() => "(?, ?)").join(", ");
    const values = registros.flatMap((reg) => [
      destino.usuario_id,
      JSON.stringify(reg),
    ]);

    const result = await runAsync(
      `INSERT INTO informacion_usuario (usuario_id, datos) VALUES ${placeholders}`,
      values
    );

    return res.status(201).json({
      success: true,
      message: "Información creada correctamente",
      data: {
        info_id: result.lastID,
        usuario_id: destino.usuario_id,
        datos: registros,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Error" });
  }
};

// PUT Actualizar información
export const actualizarInformacion = async (req, res) => {
  try {
    const { info_id, datos } = req.body;

    if (!info_id)
      return res
        .status(400)
        .json({ success: false, message: "'info_id' obligatorio" });

    if (!datos || typeof datos !== "object")
      return res
        .status(400)
        .json({ success: false, message: "'datos' inválido" });

    // Determinar usuario destino
    const destino = req.usuario.isAdmin
      ? await obtenerUsuarioDestino(req, res)
      : { usuario_id: req.usuario.id };

    if (!destino) return;

    // Verificar propiedad
    const existe = await getAsync(
      "SELECT * FROM informacion_usuario WHERE id = ? AND usuario_id = ?",
      [info_id, destino.usuario_id]
    );

    if (!existe)
      return res.status(404).json({
        success: false,
        message: "La información no pertenece o no existe",
      });

    // Validar datos contra campos mínimos
    const faltantes = validarRegistro(datos, await obtenerCamposMinimos());
    if (faltantes.length)
      return res.status(400).json({
        success: false,
        message: `Faltan: ${faltantes.join(", ")}`,
      });

    // Actualizar
    await runAsync("UPDATE informacion_usuario SET datos = ? WHERE id = ?", [
      JSON.stringify(datos),
      info_id,
    ]);

    return res.json({
      success: true,
      message: "Información actualizada",
      data: { info_id, usuario_id: destino.usuario_id, datos },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err });
  }
};

// DELETE Eliminar información
export const eliminarInformacion = async (req, res) => {
  try {
    const { info_id, usuario_id } = req.body;

    if (!info_id)
      return res
        .status(400)
        .json({ success: false, message: "El campo 'info_id' es obligatorio" });

    let destino;
    if (req.usuario.isAdmin) {
      if (!usuario_id) {
        return res.status(400).json({
          success: false,
          message: "El campo 'usuario_id' es obligatorio para administradores",
        });
      }
      destino = usuario_id;
    } else {
      if (!req.usuario.id) {
        return res.status(500).json({
          success: false,
          message: "Error: ID de usuario no encontrado",
        });
      }
      destino = req.usuario.id;
    }

    const row = await getAsync(
      "SELECT * FROM informacion_usuario WHERE id = ? AND usuario_id = ?",
      [info_id, destino]
    );

    if (!row)
      return res.status(404).json({
        success: false,
        message: "La información no pertenece o no existe",
      });

    await runAsync("DELETE FROM informacion_usuario WHERE id = ?", [info_id]);

    return res.json({ success: true, message: "Información eliminada" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err });
  }
};
