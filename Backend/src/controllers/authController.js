import { all, run } from "../config/database.js";
import { addToBlacklist } from "../config/blacklist.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// ==================== CONFIGURACIÓN DE TOKENS ====================
const TOKEN_CONFIG = {
  ACCESS_TOKEN_EXPIRY: "15m",
  ACCESS_TOKEN_EXPIRY_SECONDS: 15 * 60, // 15 minutos en segundos
  REFRESH_TOKEN_EXPIRY: "7d",
  REFRESH_TOKEN_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
};

// ==================== LOGIN ====================
export const loginUsuario = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña son requeridos" });
  }

  try {
    const usuarios = await all("SELECT * FROM usuario WHERE email = ?", [email]);
    const usuario = usuarios[0];

    if (!usuario) {
      return res.status(401).json({ error: "Usuario o contraseña no válido" });
    }

    // Verificar si el usuario confirmó su correo
    if (!usuario.verificado) {
      return res.status(403).json({
        success: false,
        message: "Debes verificar tu correo antes de iniciar sesión.",
      });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ error: "Usuario o contraseña no válido" });
    }

    // payload con id y rol
    const payload = { id: usuario.id, rol: usuario.rol };

    // access token -> 15 minutos
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY,
    });

    // refresh token -> 7 días
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY,
    });

    // Guardar refresh token en la BD
    await run("UPDATE usuario SET refresh_token = ? WHERE id = ?", [
      refreshToken,
      usuario.id,
    ]);

    // Mandar refresh token como cookie httpOnly
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // true solo en producción con HTTPS
      sameSite: "lax",
      maxAge: TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY_MS,
    });

    res.json({
      mensaje: "Login exitoso",
      accessToken,
      usuario: { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre },
    });
  } catch (err) {
    console.error("Error al hacer login:", err.message);
    res.status(500).json({ error: "Error en el servidor" });
  }
};


// ==================== REFRESH TOKEN ====================
export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token requerido" });
  }

  try {
    // Verificar en BD que el refreshToken sigue siendo válido
    const usuarios = await all(
      "SELECT * FROM usuario WHERE refresh_token = ?",
      [refreshToken]
    );
    const usuario = usuarios[0];

    if (!usuario) {
      return res
        .status(403)
        .json({ error: "Refresh token inválido o expirado" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // ================= ROTAR REFRESH TOKEN =================
    const payload = { id: decoded.id, rol: decoded.rol };

    // Nuevo access token
    const newAccessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY,
    });

    // Nuevo refresh token (mismo tiempo de expiración)
    const newRefreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY,
    });

    // Guardar el nuevo refresh token en la BD
    await run("UPDATE usuario SET refresh_token = ? WHERE id = ?", [
      newRefreshToken,
      usuario.id,
    ]);

    // Mandar nuevo refresh token en cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY_MS,
    });

    // 🔹 SOLUCIÓN: Incluir datos del usuario en la respuesta
    return res.json({
      accessToken: newAccessToken,
      usuario: {
        id: usuario.id,
        rol: usuario.rol,
        email: usuario.email,
        nombre: usuario.nombre
      }
    });
  } catch (err) {
    console.error("Error en refresh:", err.message);
    return res.status(403).json({ error: "Refresh token inválido o expirado" });
  }
};

// ==================== LOGOUT ====================
export const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  const accessToken = req.headers["authorization"]?.split(" ")[1]; // Obtener access token de la cabecera

  // Limpiar refresh token de la BD
  if (refreshToken) {
    try {
      await run(
        "UPDATE usuario SET refresh_token = NULL WHERE refresh_token = ?",
        [refreshToken]
      );
    } catch (err) {
      console.error("Error al limpiar refresh token en logout:", err.message);
    }
  }

  // Agregar access token a blacklist para invalidarlo inmediatamente
  if (accessToken) {
    try {
      // Ahora usa la configuración centralizada
      await addToBlacklist(accessToken, TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY_SECONDS);
    } catch (err) {
      console.error("Error al agregar token a la blacklist:", err.message);
    }
  }

  // Limpiar cookie de refresh token
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.json({ message: "Sesión cerrada correctamente" });
};