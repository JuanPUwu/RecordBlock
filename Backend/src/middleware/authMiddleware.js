import jwt from "jsonwebtoken";
import { isBlacklisted } from "../config/blacklist.js";

export const verificarToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Token requerido" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token requerido" });
  }

  try {
    // Verificar blacklist
    const blacklisted = await isBlacklisted(token);
    if (blacklisted) {
      return res.status(403).json({ error: "Token inválido (blacklist)" });
    }

    // Verificar JWT
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      // 🔹 Expirado → 401 (puede intentar refresh)
      return res.status(401).json({ error: "Token expirado" });
    }

    // 🔹 Token manipulado / inválido → 403 (logout inmediato)
    return res.status(403).json({ error: "Token inválido" });
  }
};

export const verificarAdmin = (req, res, next) => {
  if (!req.usuario?.isAdmin) {
    return res.status(403).json({
      error:
        "Acceso denegado, solo los administradores pueden realizar esta acción",
    });
  }
  next();
};
