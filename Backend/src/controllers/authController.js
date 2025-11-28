import { run } from "../config/database.js";
import { addToBlacklist } from "../config/blacklist.js";
import bcrypt from "bcrypt";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { enviarCorreoRecuperacion } from "../utils/emailHelper.js";

import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../utils/tokensHelper.js";

import {
  findUserByEmail,
  getUserByRefreshToken,
  saveRefreshToken,
  clearRefreshTokenByValue,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "../utils/authHelper.js";

import {
  saveRecoveryToken,
  verifyRecoveryToken,
  markRecoveryTokensUsed,
} from "../utils/recoveryHelper.js";
import { validarYHashearPassword } from "../utils/hashHelper.js";
import { TOKEN_CONFIG } from "../config/constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const safeServerError = (res, err, msg = "Error en el servidor") => {
  console.error(err);
  return res.status(500).json({ error: msg });
};

// Login
export const loginUsuario = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email y contraseña son requeridos" });

  try {
    const usuario = await findUserByEmail(email);
    if (!usuario) {
      return res.status(401).json({ error: "Usuario o contraseña no válido" });
    }

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

    const payload = { id: usuario.id, isAdmin: usuario.isAdmin };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    await saveRefreshToken(usuario.id, refreshToken);
    setRefreshTokenCookie(res, refreshToken);

    return res.json({
      mensaje: "Login exitoso",
      accessToken,
      usuario: {
        id: usuario.id,
        isAdmin: usuario.isAdmin,
        nombre: usuario.nombre,
      },
    });
  } catch (err) {
    return safeServerError(res, err, "Error en el servidor");
  }
};

// Refresh Token
export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ error: "Refresh token requerido" });

  try {
    const usuario = await getUserByRefreshToken(refreshToken);
    if (!usuario)
      return res
        .status(403)
        .json({ error: "Refresh token inválido o expirado" });

    const decoded = verifyRefreshToken(refreshToken);

    const payload = { id: decoded.id, isAdmin: decoded.isAdmin };
    const newAccessToken = createAccessToken(payload);
    const newRefreshToken = createRefreshToken(payload);

    await saveRefreshToken(usuario.id, newRefreshToken);
    setRefreshTokenCookie(res, newRefreshToken);

    return res.json({
      accessToken: newAccessToken,
      usuario: {
        id: usuario.id,
        isAdmin: usuario.isAdmin,
        email: usuario.email,
        nombre: usuario.nombre,
      },
    });
  } catch (err) {
    return res.status(403).json({
      error: "Refresh token inválido o expirado",
      message: err,
    });
  }
};

// Logout
export const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  const accessToken = req.headers["authorization"]?.split(" ")[1];

  if (!refreshToken) {
    return res.status(401).json({
      error: "No hay sesión activa. No se puede cerrar sesión.",
    });
  }

  // Limpiar refresh token de la BD (no se detiene el flujo si falla)
  try {
    await clearRefreshTokenByValue(refreshToken);
  } catch (err) {
    console.error(
      "Error al limpiar refresh token en logout:",
      err?.message ?? err
    );
  }

  // Añadir access token a blacklist si existe
  if (accessToken) {
    try {
      await addToBlacklist(
        accessToken,
        TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY_SECONDS
      );
    } catch (err) {
      console.error(
        "Error al agregar token a la blacklist:",
        err?.message ?? err
      );
    }
  }

  clearRefreshTokenCookie(res);
  return res.json({ message: "Sesión cerrada correctamente" });
};

// Forgot Password (Step 1)
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const usuario = await findUserByEmail(email);
    if (!usuario) {
      return res.status(404).json({
        error: "El correo no está asociado\na ningun usuario existente",
      });
    }

    if (usuario.verificado !== 1) {
      return res.status(403).json({ error: "El correo no ha sido verificado" });
    }

    // Generar token JWT corto (solo como identificador que luego encriptamos)
    const token = createAccessToken({ email }); // 15m por config

    // Guardar hash del token
    const tokenHash = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await saveRecoveryToken(usuario.id, tokenHash, expiresAt.toISOString());

    await enviarCorreoRecuperacion(email, token);

    return res.json({
      success: true,
      message: "Correo de recuperación enviado",
    });
  } catch (err) {
    return safeServerError(res, err, "Error interno");
  }
};

// Show Reset Password Page (Step 2)
export const showResetPasswordPage = async (req, res) => {
  const { token } = req.params;
  if (!token) {
    return res.sendFile(
      path.join(__dirname, "../views/resetPasswordFallida.html")
    );
  }

  try {
    // Decodificamos para obtener email
    const jwtLib = await import("jsonwebtoken");
    const decodedJwt = jwtLib.default.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );
    const email = decodedJwt.email;

    const valido = await verifyRecoveryToken(email, token);
    if (!valido) {
      return res.sendFile(
        path.join(__dirname, "../views/resetPasswordFallida.html")
      );
    }

    return res.sendFile(path.join(__dirname, "../views/resetPassword.html"));
  } catch (err) {
    console.error("Error en showResetPasswordPage:", err?.message ?? err);
    return res.sendFile(
      path.join(__dirname, "../views/resetPasswordFallida.html")
    );
  }
};

// Reset Password (Step 3)
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Validar y hashear contraseña en un solo paso
    let hashed;
    try {
      hashed = await validarYHashearPassword(password);
    } catch (err) {
      return res.status(400).send(`
        <h2>${err.message}</h2>
        <ul>
          <li>Mínimo 8 caracteres</li>
          <li>Al menos una letra mayúscula</li>
          <li>Al menos una letra minúscula</li>
          <li>Al menos un número</li>
          <li>Al menos un carácter especial</li>
        </ul>
      `);
    }

    // Decodificar token para obtener email
    const jwtLib = await import("jsonwebtoken");
    const decoded = jwtLib.default.verify(token, process.env.JWT_ACCESS_SECRET);
    const email = decoded.email;

    // Verificar token contra hashes almacenados
    const valido = await verifyRecoveryToken(email, token);
    if (!valido) {
      return res.sendFile(
        path.join(__dirname, "../views/resetPasswordFallida.html")
      );
    }

    // Actualizar contraseña
    await run("UPDATE usuario SET password = ? WHERE email = ?", [
      hashed,
      email,
    ]);

    // Marcar tokens usados
    await markRecoveryTokensUsed(email);

    return res.sendFile(
      path.join(__dirname, "../views/resetPasswordExitosa.html")
    );
  } catch (err) {
    console.error("Error en resetPassword:", err?.message ?? err);
    return res.sendFile(
      path.join(__dirname, "../views/resetPasswordFallida.html")
    );
  }
};
