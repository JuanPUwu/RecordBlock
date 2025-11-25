import bcrypt from "bcrypt";
import { all, run } from "../config/database.js";

/**
 * Guarda token de recuperación (hash) para un userId.
 */
export const saveRecoveryToken = async (userId, tokenHash, expiresAtIso) =>
  run(
    `INSERT INTO tokens_recuperacion (user_id, token_hash, expires_at, used)
     VALUES (?, ?, ?, 0)`,
    [userId, tokenHash, expiresAtIso]
  );

/**
 * Verifica si un token de recuperación (texto) coincide con alguno válido (no usados) del email.
 * Devuelve true/false.
 */
export const verifyRecoveryToken = async (email, token) => {
  const tokens = await all(
    `SELECT * FROM tokens_recuperacion
     WHERE used = 0 AND user_id = (SELECT id FROM usuario WHERE email = ?)`,
    [email]
  );

  if (!tokens.length) return false;

  const valido = await Promise.any(
    tokens.map((t) => bcrypt.compare(token, t.token_hash))
  ).catch(() => false);

  return Boolean(valido);
};

/**
 * Marca como usados todos los tokens activos del usuario identificado por email.
 */
export const markRecoveryTokensUsed = async (email) =>
  run(
    `UPDATE tokens_recuperacion
     SET used = 1
     WHERE user_id = (SELECT id FROM usuario WHERE email = ?)`,
    [email]
  );
