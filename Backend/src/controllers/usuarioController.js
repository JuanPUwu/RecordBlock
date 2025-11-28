import crypto from "node:crypto";
import validator from "validator";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runAsync, getAsync, allAsync } from "../utils/dbHelper.js";
import {
  enviarCorreoVerificacion,
  enviarCorreoCambioPasswordAdmin,
  enviarCorreoCambioPasswordPropio,
} from "../utils/emailHelper.js";
import { validarYHashearPassword } from "../utils/hashHelper.js";

const safeError = (res, err, msg = "Error interno del servidor") => {
  return res.status(500).json({
    success: false,
    message: err?.message || msg,
  });
};

// Obtener usuarios
export const obtenerUsuarios = async (req, res) => {
  try {
    const rows = await allAsync(
      "SELECT id, nombre, email, isAdmin, verificado FROM usuario WHERE isAdmin = 0"
    );

    return res.json({ success: true, data: rows });
  } catch (err) {
    return safeError(res, err);
  }
};

// Crear usuario
export const crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nombre, email y password son requeridos",
      });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Email inválido" });
    }

    // Verificar si el nombre ya existe
    const existeNombre = await getAsync(
      "SELECT * FROM usuario WHERE LOWER(nombre) = LOWER(?)",
      [nombre]
    );

    // Verificar si el email ya existe
    const existeEmail = await getAsync(
      "SELECT * FROM usuario WHERE LOWER(email) = LOWER(?)",
      [email]
    );

    // Construir mensaje de error específico
    if (existeNombre || existeEmail) {
      const errores = [];
      if (existeNombre) {
        errores.push("Este nombre ya está ligado a una cuenta existente");
      }
      if (existeEmail) {
        errores.push("Este correo ya está ligado a una cuenta existente");
      }

      return res.status(400).json({
        success: false,
        message: errores.join(". "),
      });
    }

    // Validar y hashear contraseña
    const hashedPassword = await validarYHashearPassword(password);

    const result = await runAsync(
      "INSERT INTO usuario (nombre, email, password, isAdmin, verificado) VALUES (?, ?, ?, 0, 0)",
      [nombre, email, hashedPassword]
    );

    const userId = result.lastID;

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await runAsync(
      "INSERT INTO tokens_verificacion (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
      [userId, tokenHash, expiresAt.toISOString()]
    );

    await enviarCorreoVerificacion(email, token);

    return res.status(201).json({
      success: true,
      message:
        "Usuario creado correctamente. Se envió un correo de verificación",
    });
  } catch (err) {
    return safeError(res, err, "Error al crear cliente");
  }
};

// Actualizar contraseña
export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitante = req.usuario;
    const { password } = req.body;

    // 1. Selección del ID objetivo según rol
    const idObjetivo = solicitante.isAdmin
      ? Number.parseInt(id, 10)
      : solicitante.id;

    const usuario = await getAsync(
      "SELECT email, nombre, isAdmin FROM usuario WHERE id = ?",
      [idObjetivo]
    );

    // 2. Verificar existencia usuario
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // 3. Validar + hashear contraseña
    const hashedPassword = await validarYHashearPassword(password);

    // 4. Actualizar contraseña en DB
    const result = await runAsync(
      "UPDATE usuario SET password = ? WHERE id = ?",
      [hashedPassword, idObjetivo]
    );

    if (result.changes === 0) {
      return res.status(500).json({
        success: false,
        message: "La contraseña no pudo ser actualizada",
      });
    }

    // 5. Generar fecha legible
    const fecha = new Date().toLocaleString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // 6. Enviar correo correspondiente
    if (solicitante.isAdmin && idObjetivo !== solicitante.id) {
      await enviarCorreoCambioPasswordAdmin(
        usuario.email,
        usuario.nombre,
        fecha
      );
    } else {
      await enviarCorreoCambioPasswordPropio(
        usuario.email,
        usuario.nombre,
        fecha
      );
    }

    // 7. Respuesta final incluyendo trazabilidad del cambio
    return res.json({
      success: true,
      message: "Contraseña actualizada correctamente",
      usuario: usuario.email,
    });
  } catch (err) {
    return safeError(res, err);
  }
};

// Eliminar usuario
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await runAsync("DELETE FROM usuario WHERE id = ?", [id]);

    if (result.changes === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }

    return res.json({
      success: true,
      message: "Usuario eliminado correctamente",
    });
  } catch (err) {
    return safeError(res, err);
  }
};

// Verificar correo electrónico
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const verificarCorreo = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.sendFile(
        path.join(__dirname, "../views/verificacionFallida.html")
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const registro = await getAsync(
      "SELECT * FROM tokens_verificacion WHERE token_hash = ?",
      [tokenHash]
    );

    if (!registro || new Date(registro.expires_at) < new Date()) {
      return res.sendFile(
        path.join(__dirname, "../views/verificacionFallida.html")
      );
    }

    await runAsync("UPDATE usuario SET verificado = 1 WHERE id = ?", [
      registro.user_id,
    ]);

    await runAsync("DELETE FROM tokens_verificacion WHERE user_id = ?", [
      registro.user_id,
    ]);

    return res.sendFile(
      path.join(__dirname, "../views/verificacionExitosa.html")
    );
  } catch (err) {
    console.error(err);
    return res.sendFile(
      path.join(__dirname, "../views/verificacionFallida.html")
    );
  }
};
