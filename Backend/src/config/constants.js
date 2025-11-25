import dotenv from "dotenv";
dotenv.config();

export const IS_PRODUCTION = process.env.NODE_ENV === "production";

export const COOKIE_CONFIG = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: IS_PRODUCTION ? "none" : "lax",
};

export const TOKEN_CONFIG = {
  ACCESS_TOKEN_EXPIRY: "15m",
  ACCESS_TOKEN_EXPIRY_SECONDS: 15 * 60,
  REFRESH_TOKEN_EXPIRY: "8h",
  REFRESH_TOKEN_EXPIRY_MS: 8 * 60 * 60 * 1000,
};
