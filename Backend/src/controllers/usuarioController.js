import bcrypt from "bcrypt";
import crypto from "node:crypto";
import validator from "validator";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runAsync, getAsync, allAsync } from "../utils/dbHelpers.js";
import {
  enviarCorreoVerificacion,
  enviarCorreoCambioPasswordAdmin,
  enviarCorreoCambioPasswordPropio,
} from "../utils/email.js";

const safeError = (res, err, msg = "Error interno del servidor") => {
  console.error(err);
  return res.status(500).json({ success: false, message: msg });
};

// Obtener usuarios
export const obtenerUsuarios = async (req, res) => {
  try {
    if (req.usuario.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Solo los administradores pueden ver la lista de clientes.",
      });
    }

    const rows = await allAsync(
      "SELECT id, nombre, email, rol, verificado FROM usuario WHERE rol = 'cliente'"
    );

    return res.json({ success: true, data: rows });
  } catch (err) {
    return safeError(res, err);
  }
};

// Crear usuario
export const crearUsuario = async (req, res) => {
  try {
    if (req.usuario.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Solo los administradores pueden crear clientes.",
      });
    }

    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nombre, email y password son requeridos.",
      });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Email inválido." });
    }

    const existe = await getAsync(
      "SELECT * FROM usuario WHERE nombre = ? OR email = ?",
      [nombre, email]
    );

    if (existe) {
      return res
        .status(400)
        .json({ success: false, message: "El cliente ya existe." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await runAsync(
      "INSERT INTO usuario (nombre, email, password, rol, verificado) VALUES (?, ?, ?, 'cliente', 0)",
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
        "Usuario creado correctamente. Se envió un correo de verificación.",
    });
  } catch (err) {
    return safeError(res, err, "Error al crear cliente");
  }
};

// Verificar correo
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

// Actualizar contraseña
export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const idToken = req.usuario.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "La contraseña es obligatoria.",
      });
    }

    let idFinal;

    if (id) {
      idFinal = Number.parseInt(id, 10);
    } else {
      idFinal = idToken;
    }

    if (req.usuario.rol !== "admin" && idFinal !== idToken) {
      return res.status(403).json({
        success: false,
        message:
          "No tienes permiso para actualizar la contraseña de este usuario.",
      });
    }

    const usuario = await getAsync(
      "SELECT email, nombre FROM usuario WHERE id = ?",
      [idFinal]
    );

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await runAsync(
      "UPDATE usuario SET password = ? WHERE id = ?",
      [hashedPassword, idFinal]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado.",
      });
    }

    const fecha = new Date().toLocaleString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    if (req.usuario.rol === "admin" && idFinal !== idToken) {
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

    return res.json({
      success: true,
      message:
        "Contraseña actualizada correctamente. Se envió notificación por correo.",
    });
  } catch (err) {
    return safeError(res, err, "Error al actualizar contraseña");
  }
};

// Eliminar usuario
export const eliminarUsuario = async (req, res) => {
  try {
    if (req.usuario.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Solo los administradores pueden eliminar usuarios.",
      });
    }

    const { id } = req.params;

    const result = await runAsync("DELETE FROM usuario WHERE id = ?", [id]);

    if (result.changes === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado." });
    }

    return res.json({
      success: true,
      message: "Usuario eliminado correctamente.",
    });
  } catch (err) {
    return safeError(res, err);
  }
};
