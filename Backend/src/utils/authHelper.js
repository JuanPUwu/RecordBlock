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
 * Busca usuario por refresh token (exact match).
 */
export const getUserByRefreshToken = async (token) => {
  const rows = await all("SELECT * FROM usuario WHERE refresh_token = ?", [
    token,
  ]);
  return rows[0] || null;
};

/**
 * Guarda el refresh token para un usuario.
 */
export const saveRefreshToken = async (userId, token) =>
  run("UPDATE usuario SET refresh_token = ? WHERE id = ?", [token, userId]);

/**
 * Elimina refresh token de la BD por valor (logout).
 */
export const clearRefreshTokenByValue = async (token) =>
  run("UPDATE usuario SET refresh_token = NULL WHERE refresh_token = ?", [
    token,
  ]);

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
