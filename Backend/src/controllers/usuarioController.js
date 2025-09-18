import bcrypt from "bcrypt";
import validator from "validator"; // para validar email
import { runAsync, getAsync, allAsync } from "../utils/dbHelpers.js";

// Obtener todos los usuarios con rol "cliente" (solo admin)
export const obtenerUsuarios = async (req, res) => {
  try {
    if (req.usuario.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Solo los administradores pueden ver la lista de clientes.",
      });
    }

    const rows = await allAsync(
      "SELECT id, nombre, email, rol FROM usuario WHERE rol = 'cliente'"
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error al obtener clientes" });
  }
};

// Crear un nuevo usuario (solo admin, rol cliente por defecto)
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
      return res
        .status(400)
        .json({ success: false, message: "Nombre, email y password son requeridos." });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Email inválido." });
    }

    const existe = await getAsync(
      "SELECT * FROM usuario WHERE nombre = ? OR email = ?",
      [nombre, email]
    );

    if (existe) {
      return res.status(400).json({ success: false, message: "El cliente ya existe." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await runAsync(
      "INSERT INTO usuario (nombre, email, password, rol) VALUES (?, ?, ?, 'cliente')",
      [nombre, email, hashedPassword]
    );

    res.status(201).json({ success: true, message: "Usuario creado correctamente." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error al crear cliente" });
  }
};

// Actualizar solo la contraseña de un usuario (admin o el mismo cliente)
export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params; // id de la URL
    const idToken = req.usuario.id; // id del usuario del token
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: "La contraseña es obligatoria." });
    }

    const idFinal = id ? parseInt(id) : idToken;

    if (req.usuario.rol !== "admin" && idFinal !== idToken) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para actualizar la contraseña de este usuario.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await runAsync(
      "UPDATE usuario SET password = ? WHERE id = ?",
      [hashedPassword, idFinal]
    );

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado." });
    }

    res.json({ success: true, message: "Contraseña actualizada correctamente." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error al actualizar usuario" });
  }
};

// Eliminar un usuario (solo admin)
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
      return res.status(404).json({ success: false, message: "Usuario no encontrado." });
    }

    res.json({ success: true, message: "Usuario eliminado correctamente." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error al eliminar usuario" });
  }
};
