import { all, run } from "../config/database.js";
import { COOKIE_CONFIG, TOKEN_CONFIG } from "../config/constants.js";

/**
 * Busca usuario por email.
 * Retorna null si no existe.
 */
export const findUserByEmail = async (email) => {
  const rows = await all("SELECT * FROM usuario WHERE LOWER(email) = LOWER(?)", [email]);
  return rows[0] || null;
};

/**
 * Extrae información del dispositivo desde el request.
 */
export const getDeviceInfo = (req) => {
  const userAgent = req.headers["user-agent"] || "Unknown";
  
  // Obtener IP: req.ip funciona cuando trust proxy está configurado
  // Fallback a headers comunes de proxies
  let ipAddress = req.ip || 
                  req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
                  req.headers["x-real-ip"] ||
                  req.connection?.remoteAddress ||
                  req.socket?.remoteAddress ||
                  "Unknown";
  
  // Intentar extraer información básica del user agent
  let deviceInfo = "Unknown Device";
  const ua = userAgent.toLowerCase();
  
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
    deviceInfo = "Mobile Device";
  } else if (ua.includes("tablet") || ua.includes("ipad")) {
    deviceInfo = "Tablet";
  } else if (ua.includes("windows")) {
    deviceInfo = "Windows";
  } else if (ua.includes("mac") || ua.includes("darwin")) {
    deviceInfo = "Mac";
  } else if (ua.includes("linux")) {
    deviceInfo = "Linux";
  }

  return {
    deviceInfo,
    ipAddress: ipAddress.substring(0, 45), // IPv6 puede ser largo, limitar
    userAgent: userAgent.substring(0, 255), // Limitar longitud
  };
};

/**
 * Crea una nueva sesión para un usuario.
 * Retorna el ID de la sesión creada.
 */
export const createUserSession = async (userId, refreshToken, deviceInfo, ipAddress, userAgent) => {
  const expiresAt = new Date(Date.now() + TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY_MS);
  
  const result = await run(
    `INSERT INTO user_sessions (user_id, refresh_token, device_info, ip_address, user_agent, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, refreshToken, deviceInfo, ipAddress, userAgent, expiresAt.toISOString()]
  );
  
  return result.id; // Retornar el ID de la sesión creada
};

/**
 * Busca sesión por refresh token y retorna el usuario asociado.
 */
export const getUserByRefreshToken = async (token) => {
  const rows = await all(
    `SELECT u.*, s.id as session_id, s.expires_at as session_expires_at
     FROM usuario u
     INNER JOIN user_sessions s ON u.id = s.user_id
     WHERE s.refresh_token = ? AND s.expires_at > datetime('now')`,
    [token]
  );
  return rows[0] || null;
};

/**
 * Verifica si una sesión existe y está activa por su ID.
 */
export const isSessionActive = async (sessionId) => {
  const rows = await all(
    `SELECT id FROM user_sessions 
     WHERE id = ? AND expires_at > datetime('now')`,
    [sessionId]
  );
  return rows.length > 0;
};

/**
 * Actualiza la fecha de último uso de una sesión.
 */
export const updateSessionLastUsed = async (token) => {
  await run(
    "UPDATE user_sessions SET last_used_at = CURRENT_TIMESTAMP WHERE refresh_token = ?",
    [token]
  );
};

/**
 * Elimina una sesión específica por refresh token (logout de sesión individual).
 */
export const clearRefreshTokenByValue = async (token) => {
  await run("DELETE FROM user_sessions WHERE refresh_token = ?", [token]);
};

/**
 * Elimina todas las sesiones de un usuario (logout de todas las sesiones).
 */
export const clearAllUserSessions = async (userId) => {
  await run("DELETE FROM user_sessions WHERE user_id = ?", [userId]);
};

/**
 * Obtiene todas las sesiones activas de un usuario.
 */
export const getUserSessions = async (userId) => {
  const rows = await all(
    `SELECT id, device_info, ip_address, user_agent, created_at, last_used_at, expires_at
     FROM user_sessions
     WHERE user_id = ? AND expires_at > datetime('now')
     ORDER BY last_used_at DESC`,
    [userId]
  );
  return rows;
};

/**
 * Elimina una sesión específica por ID (para gestión de sesiones).
 */
export const deleteSessionById = async (sessionId, userId) => {
  const result = await run(
    "DELETE FROM user_sessions WHERE id = ? AND user_id = ?",
    [sessionId, userId]
  );
  return result.changes > 0;
};

/**
 * Limpia sesiones expiradas (útil para mantenimiento).
 */
export const cleanExpiredSessions = async () => {
  await run("DELETE FROM user_sessions WHERE expires_at <= datetime('now')");
};

/**
 * Encapsula envío de cookie de refresh token.
 */
export const setRefreshTokenCookie = (res, token) =>
  res.cookie("refreshToken", token, {
    ...COOKIE_CONFIG,
    maxAge: TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY_MS,
  });

/**
 * Limpia cookie de refresh token.
 */
export const clearRefreshTokenCookie = (res) =>
  res.clearCookie("refreshToken", { ...COOKIE_CONFIG });
