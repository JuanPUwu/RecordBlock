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
        SELECT iu.id, iu.usuario_id, iu.datos, u.nombre AS usuario_nombre
        FROM informacion_usuario iu
        JOIN usuario u ON iu.usuario_id = u.id
        WHERE u.rol = 'cliente'
      `;
      const params = [];

      if (usuario_id) {
        query += " AND u.id = ?";
        params.push(usuario_id);
      }

      query += ";";

      const rows = await allAsync(query, params);
      const resultados = rows.map((row) => ({
        info_id: row.id,
        usuario_id: row.usuario_id,
        usuario_nombre: row.usuario_nombre,
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

    return res
      .status(403)
      .json({ success: false, message: "Rol no autorizado." });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al obtener información",
      error: err.message,
    });
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

    // Rol admin puede elegir usuario_id, cliente usa el suyo del token
    if (req.usuario.rol === "admin") {
      ({ usuario_id, datos } = req.body);

      // Bloquear intento de asociar información a un usuario admin
      const usuarioDestino = await getAsync(
        "SELECT rol FROM usuario WHERE id = ?",
        [usuario_id]
      );
      if (!usuarioDestino) {
        return res.status(404).json({
          success: false,
          message: "El usuario destino no existe.",
        });
      }
      if (usuarioDestino.rol === "admin") {
        return res.status(400).json({
          success: false,
          message: "No puedes crear información para un usuario administrador.",
        });
      }
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

    const normalizar = (texto) =>
      texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    // Leer el JSON de datos mínimos almacenado en la tabla
    const fila = await getAsync("SELECT datos FROM datos_minimos LIMIT 1");

    // Convertir el JSON a array real
    let camposRequeridosRaw = [];
    try {
      camposRequeridosRaw = JSON.parse(fila.datos);
    } catch {
      camposRequeridosRaw = [];
    }

    // Normalizar todos los campos
    const camposRequeridos = camposRequeridosRaw.map((campo) =>
      normalizar(campo)
    );

    for (const registro of registros) {
      if (typeof registro !== "object") {
        return res.status(400).json({
          success: false,
          message: "Cada elemento de 'datos' debe ser un JSON válido",
        });
      }

      const clavesNormalizadas = Object.keys(registro).map((k) =>
        normalizar(k)
      );

      const faltantes = camposRequeridos.filter((campo) => {
        const campoNormalizado = normalizar(campo);
        const index = clavesNormalizadas.indexOf(campoNormalizado);
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
    res.status(500).json({
      success: false,
      message: "Error al crear información",
    });
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

    // ================= VALIDAR CAMPOS OBLIGATORIOS =================
    const camposRequeridos = [
      "hostname",
      "plataforma",
      "marca/modelo",
      "tipo",
      "firmware/version s.o",
      "ubicacion",
      "licenciamiento",
    ];

    const normalizar = (texto) =>
      texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const clavesNormalizadas = Object.keys(datos).map((k) => normalizar(k));

    const faltantes = camposRequeridos.filter((campo) => {
      const campoNormalizado = normalizar(campo);
      const index = clavesNormalizadas.indexOf(campoNormalizado);

      if (index === -1) return true;

      const valor = datos[Object.keys(datos)[index]];
      return (
        valor === null || valor === undefined || valor.toString().trim() === ""
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
    // ================================================================

    // Determinar el usuario dueño de la información
    let userId;
    if (req.usuario.rol === "admin") {
      if (!usuario_id) {
        return res.status(400).json({
          success: false,
          message: "El campo 'usuario_id' es obligatorio para admin",
        });
      }

      // ✅ Verificar que el usuario_id no sea admin
      const usuarioDestino = await getAsync(
        "SELECT rol FROM usuario WHERE id = ?",
        [usuario_id]
      );

      if (!usuarioDestino) {
        return res.status(404).json({
          success: false,
          message: "El usuario destino no existe.",
        });
      }

      if (usuarioDestino.rol === "admin") {
        return res.status(400).json({
          success: false,
          message:
            "No puedes actualizar información de un usuario administrador.",
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

    // Verificar que exista esa información y le pertenezca
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

    // Actualizar información
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
      return res
        .status(403)
        .json({ success: false, message: "Rol no autorizado." });
    }

    const row = await getAsync(
      "SELECT * FROM informacion_usuario WHERE id = ? AND usuario_id = ?",
      [info_id, condicionUsuario]
    );

    if (!row) {
      return res.status(404).json({
        success: false,
        message: "La información no pertenece o no existe.",
      });
    }

    await runAsync("DELETE FROM informacion_usuario WHERE id = ?", [info_id]);

    res.json({
      success: true,
      message: "Información eliminada correctamente.",
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error al eliminar información" });
  }
};

// GET datos minimos
export const obtenerDatosMinimos = async (req, res) => {
  try {
    if (req.usuario.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Solo un administrador puede consultar los datos mínimos.",
      });
    }

    const row = await getAsync("SELECT datos FROM datos_minimos WHERE id = 1");

    if (!row) {
      return res.status(500).json({
        success: false,
        message: "No existe registro base en datos_minimos.",
      });
    }

    return res.json({
      success: true,
      data: JSON.parse(row.datos),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener datos mínimos.",
      error: err.message,
    });
  }
};
// PUT reemplazar lista completa de datos minimos
export const reemplazarDatosMinimos = async (req, res) => {
  try {
    if (req.usuario.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Solo un administrador puede reemplazar la lista de datos mínimos.",
      });
    }

    const { datos } = req.body;

    if (!Array.isArray(datos)) {
      return res.status(400).json({
        success: false,
        message: "El campo 'datos' debe ser un array.",
      });
    }

    // Normalizador para almacenar (lo que realmente guarda SQLite)
    const normalizeForStorage = (v) => {
      if (typeof v === "string") return v.trim();
      if (typeof v === "number" || typeof v === "boolean") return String(v);
      try {
        return JSON.stringify(v);
      } catch {
        return String(v);
      }
    };

    // Normalizador solo para comparar duplicados
    const normalizeForCompare = (v) => {
      if (typeof v === "string") return v.trim().toLowerCase();
      if (typeof v === "number" || typeof v === "boolean")
        return String(v).toLowerCase();
      try {
        return JSON.stringify(v).toLowerCase();
      } catch {
        return String(v).toLowerCase();
      }
    };

    const listaFinal = [];
    const vistos = new Set();

    for (const item of datos) {
      const cmp = normalizeForCompare(item);
      if (vistos.has(cmp)) continue; // evitar duplicados
      vistos.add(cmp);
      listaFinal.push(normalizeForStorage(item));
    }

    // Guardar la nueva lista completa
    await runAsync("UPDATE datos_minimos SET datos = ? WHERE id = 1", [
      JSON.stringify(listaFinal),
    ]);

    res.json({
      success: true,
      message: "Lista de datos mínimos reemplazada correctamente.",
      datos: listaFinal,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al reemplazar la lista de datos mínimos",
      error: err.message,
    });
  }
};
