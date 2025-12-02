import { unlinkSync } from "node:fs";
import { runAsync, getAsync } from "./dbHelper.js";
import { normalizar, validarRegistro } from "./datosHelper.js";

/**
 * Limpia un archivo temporal del sistema
 * @param {string} filePath - Ruta del archivo a eliminar
 */
export const limpiarArchivo = (filePath) => {
  if (!filePath) return;
  try {
    unlinkSync(filePath);
  } catch (error_) {
    console.error("Error al eliminar archivo:", error_);
  }
};

/**
 * Detecta si un texto contiene emojis
 * @param {string} texto - Texto a validar
 * @returns {boolean} - true si contiene emojis, false en caso contrario
 */
export const contieneEmojis = (texto) => {
  if (!texto || typeof texto !== "string") return false;
  // Verificar si contiene emojis iterando sobre los caracteres
  let i = 0;
  while (i < texto.length) {
    const code = texto.codePointAt(i);
    if (!code) {
      i++;
      continue;
    }
    // Rangos principales de emojis Unicode
    if (
      (code >= 0x2600 && code <= 0x26ff) || // Símbolos varios
      (code >= 0x2700 && code <= 0x27bf) || // Dingbats
      (code >= 0x1f300 && code <= 0x1f9ff) || // Emojis varios
      (code >= 0x1f600 && code <= 0x1f64f) || // Emoticones
      (code >= 0x1f680 && code <= 0x1f6ff) || // Transporte y símbolos
      (code >= 0x1f1e0 && code <= 0x1f1ff) || // Banderas
      code === 0x200d // Zero-width joiner
    ) {
      return true;
    }
    // Saltar caracteres suplementarios (surrogate pairs)
    // Incrementar i según el tamaño del carácter
    i += code > 0xffff ? 2 : 1;
  }
  return false;
};

/**
 * Valida que el archivo sea un CSV válido
 * @param {Object} file - Objeto del archivo subido
 * @returns {{valido: boolean, mensaje?: string}} - Resultado de la validación
 */
export const validarArchivoCSV = (file) => {
  if (!file) {
    return {
      valido: false,
      mensaje:
        "No se proporcionó ningún archivo CSV. El archivo debe estar delimitado por punto y coma (;).",
    };
  }
  if (!file.originalname.toLowerCase().endsWith(".csv")) {
    limpiarArchivo(file.path);
    return {
      valido: false,
      mensaje:
        "El archivo debe ser un CSV (.csv) delimitado por punto y coma (;).",
    };
  }
  return { valido: true };
};

/**
 * Determina el usuario destino para la carga masiva según el rol
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<{usuario_id: number}|null>} - Usuario destino o null si hay error
 */
export const determinarUsuarioDestinoCSV = async (req, res) => {
  if (!req.usuario.isAdmin) {
    return { usuario_id: req.usuario.id };
  }

  const { usuario_id } = req.body;
  if (!usuario_id) {
    limpiarArchivo(req.file?.path);
    res.status(400).json({
      success: false,
      message: "El campo 'usuario_id' es obligatorio para administradores",
    });
    return null;
  }

  const usuario = await getAsync("SELECT isAdmin FROM usuario WHERE id = ?", [
    usuario_id,
  ]);

  if (!usuario) {
    limpiarArchivo(req.file?.path);
    res.status(404).json({
      success: false,
      message: "El usuario destino no existe",
    });
    return null;
  }

  if (usuario.isAdmin) {
    limpiarArchivo(req.file?.path);
    res.status(400).json({
      success: false,
      message: "El usuario administrador no puede recibir información",
    });
    return null;
  }

  return { usuario_id: Number.parseInt(usuario_id, 10) };
};

/**
 * Procesa una fila del CSV y la valida
 * @param {Object} row - Fila del CSV
 * @param {number} numeroFila - Número de fila (para reporte de errores)
 * @param {Array<string>} camposMinimos - Lista de campos mínimos normalizados
 * @param {Array<Object>} registros - Array donde se guardan los registros válidos
 * @param {Array<Object>} errores - Array donde se guardan los errores
 */
export const procesarFilaCSV = (
  row,
  numeroFila,
  camposMinimos,
  registros,
  errores
) => {
  try {
    const registro = {};
    const camposMinimosSet = new Set(camposMinimos);
    const camposConEmojis = [];

    // Normalizar claves al procesar el CSV
    for (const [clave, valor] of Object.entries(row)) {
      const claveNormalizada = normalizar(clave.trim());
      const valorTrimmed = valor ? valor.trim() : "";

      // Validar emojis en claves y valores
      if (contieneEmojis(clave)) {
        camposConEmojis.push(`clave "${clave}"`);
      }
      if (valorTrimmed !== "" && contieneEmojis(valorTrimmed)) {
        camposConEmojis.push(`campo "${clave}"`);
      }

      // Si es un campo mínimo, siempre se guarda (aunque esté vacío)
      // Si NO es campo mínimo y está vacío, no se guarda
      const esCampoMinimo = camposMinimosSet.has(claveNormalizada);
      if (esCampoMinimo || valorTrimmed !== "") {
        registro[claveNormalizada] = valorTrimmed;
      }
    }

    // Si hay emojis, rechazar la fila
    if (camposConEmojis.length > 0) {
      errores.push({
        fila: numeroFila,
        error: `No se permiten emojis. Campos con emojis: ${camposConEmojis.join(
          ", "
        )}`,
      });
      return;
    }

    if (Object.keys(registro).length === 0) {
      errores.push({ fila: numeroFila, error: "Fila vacía" });
      return;
    }

    const faltantes = validarRegistro(registro, camposMinimos);
    if (faltantes.length > 0) {
      errores.push({
        fila: numeroFila,
        error: `Faltan campos obligatorios: ${faltantes.join(", ")}`,
        datos: registro,
      });
      return;
    }

    registros.push(registro);
  } catch (err) {
    errores.push({
      fila: numeroFila,
      error: `Error al procesar fila: ${err.message}`,
    });
  }
};

/**
 * Inserta múltiples registros en la base de datos
 * @param {Array<Object>} registros - Registros a insertar
 * @param {{usuario_id: number}} destino - Usuario destino
 * @param {string} datosMinimosIniciales - JSON string de los datos mínimos iniciales
 */
export const insertarRegistros = async (
  registros,
  destino,
  datosMinimosIniciales
) => {
  if (registros.length === 0) return;

  const placeholders = registros.map(() => "(?, ?, ?)").join(", ");
  const values = registros.flatMap((reg) => [
    destino.usuario_id,
    JSON.stringify(reg),
    datosMinimosIniciales,
  ]);

  await runAsync(
    `INSERT INTO informacion_usuario (usuario_id, datos, datos_minimos) VALUES ${placeholders}`,
    values
  );
};

/**
 * Procesa la finalización de la carga masiva CSV
 * @param {Array<Object>} registros - Registros válidos procesados
 * @param {Array<Object>} errores - Errores encontrados durante el procesamiento
 * @param {{usuario_id: number}} destino - Usuario destino
 * @param {string} filePath - Ruta del archivo temporal
 * @param {Object} res - Response object de Express
 * @param {{resolve: Function, reject: Function}} promiseCallbacks - Callbacks de Promise
 * @param {string} datosMinimosIniciales - JSON string de los datos mínimos iniciales
 */
export const procesarCSVCompletado = async (
  registros,
  errores,
  destino,
  filePath,
  res,
  promiseCallbacks,
  datosMinimosIniciales
) => {
  try {
    limpiarArchivo(filePath);

    if (errores.length > 0 && registros.length === 0) {
      return promiseCallbacks.resolve(
        res.status(400).json({
          success: false,
          message: "No se pudo procesar ningún registro del CSV",
          errores,
        })
      );
    }

    await insertarRegistros(registros, destino, datosMinimosIniciales);

    return promiseCallbacks.resolve(
      res.status(201).json({
        success: true,
        message: `Carga masiva completada. ${registros.length} registro(s) insertado(s)`,
        data: {
          registros_insertados: registros.length,
          registros_con_error: errores.length,
          usuario_id: destino.usuario_id,
          errores: errores.length > 0 ? errores : undefined,
        },
      })
    );
  } catch (err) {
    console.error(err);
    return promiseCallbacks.reject(
      res.status(500).json({
        success: false,
        message: "Error al insertar registros en la base de datos",
        error: err.message,
      })
    );
  }
};
