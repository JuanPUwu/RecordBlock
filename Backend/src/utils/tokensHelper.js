// utils/tokens.js
import jwt from "jsonwebtoken";
import { TOKEN_CONFIG } from "../config/constants.js";

export const createAccessToken = (payload, sessionId = null) => {
  const tokenPayload = { ...payload };
  // Incluir sessionId en el payload si se proporciona
  if (sessionId) {
    tokenPayload.sessionId = sessionId;
  }
  return jwt.sign(tokenPayload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY,
  });
};

export const createRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY,
  });

export const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_ACCESS_SECRET);

export const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET);
