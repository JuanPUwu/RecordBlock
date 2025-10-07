import { runAsync, getAsync, allAsync } from "../utils/dbHelpers.js";

/*
  GET
  Admin:
  - Si envía usuario_id → devuelve solo las informaciones de ese usuario.
  - Si no envía nada → devuelve todas las informaciones de todos los clientes.
  Cliente:
  - Ignora cualquier parámetro y devuelve solo las suyas (basado en req.usuario.id).
*/
export const obtenerInformacion = async (req, res) => {
  try {
    const { usuario_id } = req.query;

    if (req.usuario.rol === "admin") {
      let query = `
        SELECT iu.id, iu.usuario_id, iu.datos
        FROM informacion_usuario iu
        JOIN usuario u ON iu.usuario_id = u.id
        WHERE u.rol = 'cliente'
      `;
      const params = [];

      if (usuario_id) {
        query += " AND u.id = ?";
        params.push(usuario_id);
      }

      const rows = await allAsync(query, params);
      const resultados = rows.map((row) => ({
        info_id: row.id,
        usuario_id: row.usuario_id,
        datos: [JSON.parse(row.datos)],
      }));

      return res.json({ success: true, data: resultados });
    }

    if (req.usuario.rol === "cliente") {
      const rows = await allAsync(
        "SELECT id, usuario_id, datos FROM informacion_usuario WHERE usuario_id = ?",
        [req.usuario.id]
      );

      const resultados = rows.map((row) => ({
        info_id: row.id,
        usuario_id: row.usuario_id,
        datos: [JSON.parse(row.datos)],
      }));

      return res.json({ success: true, data: resultados });
    }

    return res.status(403).json({ success: false, message: "Rol no autorizado." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error al obtener información" });
  }
};

/*
  POST
  Admin:
  - Se envía usuario_id en el body.
  Cliente:
  - Ignora el usuario_id en el body y toma el que viene en el token.
*/
export const crearInformacion = async (req, res) => {
  try {
    let usuario_id, datos;

    if (req.usuario.rol === "admin") {
      ({ usuario_id, datos } = req.body);
    } else if (req.usuario.rol === "cliente") {
      usuario_id = req.usuario.id;
      ({ datos } = req.body);
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Rol no autorizado." });
    }

    if (!datos) {
      return res
        .status(400)
        .json({ success: false, message: "El campo 'datos' es obligatorio" });
    }

    const registros = Array.isArray(datos) ? datos : [datos];

    // Campos mínimos requeridos
    const camposRequeridos = [
      "hostname",
      "plataforma",
      "marca/modelo",
      "tipo",
      "firmware/version s.o",
      "ubicacion",
      "licenciamiento",
    ];

    // 🔹 Función para normalizar textos (sin tildes ni mayúsculas)
    const normalizar = (texto) =>
      texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // elimina acentos

    for (const registro of registros) {
      if (typeof registro !== "object") {
        return res.status(400).json({
          success: false,
          message: "Cada elemento de 'datos' debe ser un JSON válido",
        });
      }

      // 🔹 Crear un mapa normalizado de claves
      const clavesNormalizadas = Object.keys(registro).map((k) =>
        normalizar(k)
      );

      // 🔹 Buscar campos faltantes o vacíos
      const faltantes = camposRequeridos.filter((campo) => {
        const campoNormalizado = normalizar(campo);
        const index = clavesNormalizadas.indexOf(campoNormalizado);

        // No existe
        if (index === -1) return true;

        const valor = registro[Object.keys(registro)[index]];
        return (
          valor === null ||
          valor === undefined ||
          valor.toString().trim() === ""
        );
      });

      if (faltantes.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Faltan o están vacíos los siguientes campos obligatorios: ${faltantes.join(
            ", "
          )}`,
        });
      }
    }

    const placeholders = registros.map(() => "(?, ?)").join(", ");
    const values = registros.flatMap((registro) => [
      usuario_id,
      JSON.stringify(registro),
    ]);

    const result = await runAsync(
      `INSERT INTO informacion_usuario (usuario_id, datos) VALUES ${placeholders}`,
      values
    );

    res.status(201).json({
      success: true,
      message: "Información creada correctamente.",
      data: {
        info_id: result.lastID,
        usuario_id,
        datos: registros,
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Error al crear información" });
  }
};

// PUT - Actualizar información de usuario
export const actualizarInformacion = async (req, res) => {
  try {
    const { info_id, usuario_id, datos } = req.body;

    if (!info_id) {
      return res
        .status(400)
        .json({ success: false, message: "El campo 'info_id' es obligatorio" });
    }

    if (!datos || typeof datos !== "object") {
      return res.status(400).json({
        success: false,
        message: "El campo 'datos' debe ser un JSON válido",
      });
    }

    let userId;
    if (req.usuario.rol === "admin") {
      if (!usuario_id) {
        return res.status(400).json({
          success: false,
          message: "El campo 'usuario_id' es obligatorio para admin",
        });
      }
      userId = usuario_id;
    } else if (req.usuario.rol === "cliente") {
      userId = req.usuario.id;
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Rol no autorizado." });
    }

    const row = await getAsync(
      "SELECT * FROM informacion_usuario WHERE id = ? AND usuario_id = ?",
      [info_id, userId]
    );

    if (!row) {
      return res.status(404).json({
        success: false,
        message: "La información no pertenece o no existe.",
      });
    }

    await runAsync("UPDATE informacion_usuario SET datos = ? WHERE id = ?", [
      JSON.stringify(datos),
      info_id,
    ]);

    res.json({
      success: true,
      message: "Información actualizada correctamente.",
      data: { info_id, usuario_id: userId, datos },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Error al actualizar información" });
  }
};

// DELETE
export const eliminarInformacion = async (req, res) => {
  try {
    const { info_id, usuario_id } = req.body;

    let condicionUsuario;
    if (req.usuario.rol === "admin") {
      condicionUsuario = usuario_id;
    } else if (req.usuario.rol === "cliente") {
      condicionUsuario = req.usuario.id;
    } else {
      return res.status(403).json({ success: false, message: "Rol no autorizado." });
    }

    const row = await getAsync(
      "SELECT * FROM informacion_usuario WHERE id = ? AND usuario_id = ?",
      [info_id, condicionUsuario]
    );

    if (!row) {
      return res
        .status(404)
        .json({ success: false, message: "La información no pertenece o no existe." });
    }

    await runAsync("DELETE FROM informacion_usuario WHERE id = ?", [info_id]);

    res.json({ success: true, message: "Información eliminada correctamente." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error al eliminar información" });
  }
};
