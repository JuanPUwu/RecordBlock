import { all, run } from "../config/database.js";
import { addToBlacklist } from "../config/blacklist.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { enviarCorreoRecuperacion } from "../utils/email.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// ==================== CONFIGURACIÓN DE TOKENS ====================
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const COOKIE_CONFIG = {
  httpOnly: true,
  secure: IS_PRODUCTION, // Solo TRUE cuando está en producción
  sameSite: IS_PRODUCTION ? "none" : "lax",
};

const TOKEN_CONFIG = {
  ACCESS_TOKEN_EXPIRY: "15m",
  ACCESS_TOKEN_EXPIRY_SECONDS: 15 * 60, // 15 minutos en segundos
  REFRESH_TOKEN_EXPIRY: "8h",
  REFRESH_TOKEN_EXPIRY_MS: 8 * 60 * 60 * 1000, // 8 horas en milisegundos
};

// ==================== UTILIDADES PARA RUTAS ABSOLUTAS ====================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== LOGIN ====================
export const loginUsuario = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña son requeridos" });
  }

  try {
    const usuarios = await all("SELECT * FROM usuario WHERE email = ?", [
      email,
    ]);
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
      ...COOKIE_CONFIG,
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
      ...COOKIE_CONFIG,
      maxAge: TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY_MS,
    });

    // 🔹 SOLUCIÓN: Incluir datos del usuario en la respuesta
    return res.json({
      accessToken: newAccessToken,
      usuario: {
        id: usuario.id,
        rol: usuario.rol,
        email: usuario.email,
        nombre: usuario.nombre,
      },
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
      await addToBlacklist(
        accessToken,
        TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY_SECONDS
      );
    } catch (err) {
      console.error("Error al agregar token a la blacklist:", err.message);
    }
  }

  // Limpiar cookie de refresh token
  res.clearCookie("refreshToken", {
    ...COOKIE_CONFIG,
  });

  return res.json({ message: "Sesión cerrada correctamente" });
};

// ==================== RECUPERAR CONTRASEÑA ====================

// Paso 1: Usuario solicita restablecimiento
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const usuarios = await all("SELECT * FROM usuario WHERE email = ?", [
      email,
    ]);
    const usuario = usuarios[0];

    if (!usuario)
      return res.status(404).json({
        error: "El correo no está asociado\na ningun usuario existente",
      });

    // Verificar si el usuario está verificado
    if (usuario.verificado !== 1)
      return res.status(403).json({ error: "El correo no ha sido verificado" });

    // Generar token
    const token = jwt.sign({ email }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: "15m",
    });

    // Hashear el token y guardar en BD
    const tokenHash = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await run(
      `INSERT INTO tokens_recuperacion (user_id, token_hash, expires_at, used)
       VALUES (?, ?, ?, 0)`,
      [usuario.id, tokenHash, expiresAt.toISOString()]
    );

    // Enviar correo solo si está verificado
    await enviarCorreoRecuperacion(email, token);

    console.log(`[auth] Token de recuperación creado para ${email}`);

    return res.json({
      success: true,
      message: "Correo de recuperación enviado",
    });
  } catch (err) {
    console.error("Error en forgotPassword:", err.message);
    return res.status(500).json({ error: "Error interno" });
  }
};

// Paso 2: Mostrar formulario HTML
export const showResetPasswordPage = async (req, res) => {
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Buscar el token en la tabla y validar que no esté usado ni vencido
    const tokens = await all(
      "SELECT * FROM tokens_recuperacion WHERE used = 0 AND user_id = (SELECT id FROM usuario WHERE email = ?)",
      [decoded.email]
    );

    if (!tokens.length) {
      return res.sendFile(
        path.join(__dirname, "../views/resetPasswordFallida.html")
      );
    }

    // Validar que alguno coincida (bcrypt.compare)
    const valido = await Promise.any(
      tokens.map((t) => bcrypt.compare(token, t.token_hash))
    ).catch(() => false);

    if (!valido) {
      return res.sendFile(
        path.join(__dirname, "../views/resetPasswordFallida.html")
      );
    }

    // Si todo bien, muestra formulario
    res.sendFile(path.join(__dirname, "../views/resetPassword.html"));
  } catch (err) {
    console.error("Error en showResetPasswordPage:", err.message);
    res.sendFile(path.join(__dirname, "../views/resetPasswordFallida.html"));
  }
};

// Paso 3: Actualizar contraseña y marcar token como usado
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Validar complejidad de la contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).send(`
        <h2>La contraseña no cumple con los requisitos mínimos:</h2>
        <ul>
          <li>Mínimo 8 caracteres</li>
          <li>Al menos una letra mayúscula</li>
          <li>Al menos una letra minúscula</li>
          <li>Al menos un número</li>
          <li>Al menos un carácter especial</li>
        </ul>
      `);
    }

    // Buscar tokens activos del usuario
    const tokens = await all(
      "SELECT * FROM tokens_recuperacion WHERE used = 0 AND user_id = (SELECT id FROM usuario WHERE email = ?)",
      [decoded.email]
    );

    if (!tokens.length)
      return res.sendFile(
        path.join(__dirname, "../views/resetPasswordFallida.html")
      );

    // Verificar hash
    const valido = await Promise.any(
      tokens.map((t) => bcrypt.compare(token, t.token_hash))
    ).catch(() => false);

    if (!valido)
      return res.sendFile(
        path.join(__dirname, "../views/resetPasswordFallida.html")
      );

    // Actualizar contraseña
    const hashed = await bcrypt.hash(password, 10);
    await run("UPDATE usuario SET password = ? WHERE email = ?", [
      hashed,
      decoded.email,
    ]);

    // Marcar token como usado
    await run(
      "UPDATE tokens_recuperacion SET used = 1 WHERE user_id = (SELECT id FROM usuario WHERE email = ?)",
      [decoded.email]
    );

    console.log(`[auth] Contraseña restablecida para ${decoded.email}`);
    res.sendFile(path.join(__dirname, "../views/resetPasswordExitosa.html"));
  } catch (err) {
    console.error("Error en resetPassword:", err.message);
    res.sendFile(path.join(__dirname, "../views/resetPasswordFallida.html"));
  }
};
