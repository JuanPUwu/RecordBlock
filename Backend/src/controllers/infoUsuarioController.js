import { runAsync, getAsync, allAsync } from "../utils/dbHelper.js";
import {
  obtenerCamposMinimos,
  obtenerUsuarioDestino,
} from "../utils/datosHelper.js";
import {
  limpiarArchivo,
  validarArchivoCSV,
  determinarUsuarioDestinoCSV,
  procesarFilaCSV,
  procesarCSVCompletado,
} from "../utils/csvHelper.js";
import csv from "csv-parser";
import { createReadStream } from "node:fs";

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
    SELECT iu.id, iu.usuario_id, iu.datos, iu.datos_minimos, u.nombre AS usuario_nombre
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
      datos_minimos_iniciales: (() => {
        try {
          return JSON.parse(row.datos_minimos || "[]");
        } catch {
          return [];
        }
      })(),
    })),
  });
}

async function obtenerInformacionCliente(req, res) {
  const rows = await allAsync(
    "SELECT id, usuario_id, datos, datos_minimos FROM informacion_usuario WHERE usuario_id = ?",
    [req.usuario.id]
  );

  return res.json({
    success: true,
    data: rows.map((row) => ({
      info_id: row.id,
      usuario_id: row.usuario_id,
      datos: [JSON.parse(row.datos)],
      datos_minimos_iniciales: (() => {
        try {
          return JSON.parse(row.datos_minimos || "[]");
        } catch {
          return [];
        }
      })(),
    })),
  });
}

// POST Crear información
export const crearInformacion = async (req, res) => {
  try {
    const destino = await obtenerUsuarioDestino(req, res);
    if (!destino) return;

    const { datos } = req.body;
    if (!datos) {
      return res
        .status(400)
        .json({ success: false, message: "El campo 'datos' es obligatorio" });
    }

    const registros = Array.isArray(datos) ? datos : [datos];
    const camposMinimos = await obtenerCamposMinimos();
    const datosMinimosIniciales = JSON.stringify(camposMinimos || []);

    // Validación
    for (const reg of registros) {
      if (typeof reg !== "object") {
        return res.status(400).json({
          success: false,
          message: "Cada elemento de 'datos' debe ser un JSON válido",
        });
      }
      const faltantes = validarRegistro(reg, camposMinimos);
      if (faltantes.length) {
        return res.status(400).json({
          success: false,
          message: `Faltan campos obligatorios: ${faltantes.join(", ")}`,
        });
      }
    }

    // Ahora el número de placeholders debe coincidir con 7 columnas pero tú insertas 2 → lo ajustamos a 2 objetos TEXT:
    // usuario_id, datos, datos_minimos
    const placeholders = registros.map(() => "(?, ?, ?)").join(", ");
    const values = registros.flatMap((reg) => [
      destino.usuario_id,
      JSON.stringify(reg),
      datosMinimosIniciales,
    ]);

    const result = await runAsync(
      `INSERT INTO informacion_usuario (usuario_id, datos, datos_minimos) VALUES ${placeholders}`,
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

    // Obtener los campos mínimos INICIALES guardados en el registro.
    let camposMinimosIniciales = [];
    try {
      camposMinimosIniciales = JSON.parse(existe.datos_minimos || "[]");
    } catch {
      camposMinimosIniciales = [];
    }

    // Regla específica para actualización:
    // - SOLO importan los datos_minimos iniciales del registro.
    // - Esos campos pueden estar vacíos, pero DEBEN existir como claves en el JSON.
    // - Los datos_minimos vigentes NO influyen en nada para este registro.
    const clavesNorm = new Set(Object.keys(datos).map((k) => normalizar(k)));
    const camposMinimosInicialesNorm = new Set(
      (camposMinimosIniciales || []).map((c) => normalizar(String(c)))
    );

    // 1) Validar que todas las claves mínimas iniciales existan
    const faltantes = (camposMinimosIniciales || []).filter((campo) => {
      const campoNorm = normalizar(String(campo));
      return !clavesNorm.has(campoNorm);
    });
    if (faltantes.length)
      return res.status(400).json({
        success: false,
        message: `Faltan el campo obligatorio: ${faltantes.join(", ")}`,
      });

    // 2) Validar que los campos que NO son mínimos iniciales NO estén vacíos
    //    (si el cliente los envía, deben tener valor)
    const noMinimosVacios = Object.entries(datos)
      .filter(([clave, valor]) => {
        const claveNorm = normalizar(clave);
        // Si es campo mínimo inicial, puede estar vacío
        if (camposMinimosInicialesNorm.has(claveNorm)) return false;

        // Para campos no mínimos: no se permite null/undefined ni string vacío
        if (valor === null || valor === undefined) return true;
        if (typeof valor === "string" && valor.trim() === "") return true;

        return false;
      })
      .map(([clave]) => clave);

    if (noMinimosVacios.length)
      return res.status(400).json({
        success: false,
        message: `Los siguientes campos NO mínimos no pueden estar vacíos: ${noMinimosVacios.join(
          ", "
        )}`,
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

// POST Carga masiva desde CSV
export const cargarInformacionCSV = async (req, res) => {
  try {
    const validacionArchivo = validarArchivoCSV(req.file);
    if (!validacionArchivo.valido) {
      return res.status(400).json({
        success: false,
        message: validacionArchivo.mensaje,
      });
    }

    const destino = await determinarUsuarioDestinoCSV(req, res);
    if (!destino) return;

    const camposMinimos = await obtenerCamposMinimos();
    const datosMinimosIniciales = JSON.stringify(camposMinimos || []);

    const registros = [];
    const errores = [];
    let numeroFila = 1;

    return new Promise((resolve, reject) => {
      createReadStream(req.file.path)
        .pipe(
          csv({
            separator: ";", // Usar punto y coma como delimitador
            skipEmptyLines: true,
            skipLinesWithError: false,
          })
        )
        .on("data", (row) => {
          numeroFila++;
          procesarFilaCSV(row, numeroFila, camposMinimos, registros, errores);
        })
        .on("end", async () => {
          await procesarCSVCompletado(
            registros,
            errores,
            destino,
            req.file.path,
            res,
            resolve,
            reject,
            datosMinimosIniciales
          );
        })
        .on("error", (err) => {
          limpiarArchivo(req.file.path);
          console.error("Error al leer CSV:", err);
          return reject(
            res.status(500).json({
              success: false,
              message:
                "Error al procesar el archivo CSV. Asegúrate de que el archivo esté delimitado por punto y coma (;).",
              error: err.message,
            })
          );
        });
    });
  } catch (err) {
    limpiarArchivo(req.file?.path);
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Error al procesar la carga masiva",
      error: err.message,
    });
  }
};
