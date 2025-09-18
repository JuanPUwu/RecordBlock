import { run, all } from "./database.js";

// Agregar token a blacklist
export async function addToBlacklist(token, expiresInSeconds) {
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  await run("INSERT INTO token_blacklist (token, expiresAt) VALUES (?, ?)", [
    token,
    expiresAt,
  ]);
}

// Limpiar tokens expirados
export async function cleanBlacklist() {
  const now = Date.now();
  await run("DELETE FROM token_blacklist WHERE expiresAt <= ?", [now]);
}

// Verificar si token está en blacklist
export async function isBlacklisted(token) {
  await cleanBlacklist(); // limpiar expirados antes de verificar
  const rows = await all("SELECT * FROM token_blacklist WHERE token = ?", [
    token,
  ]);
  return rows.length > 0;
}
