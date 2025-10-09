// routes/auth.routes.js
import express from "express";
import {
  loginUsuario,
  refreshToken,
  logout,
  forgotPassword,
  showResetPasswordPage,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 example: Contraseña123@
 *     responses:
 *       200:
 *         description: Login exitoso
 */
router.post("/login", loginUsuario);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar access token usando refresh token
 *     tags: [Auth]
 */
router.post("/refresh", refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión y eliminar refresh token
 *     tags: [Auth]
 */
router.post("/logout", logout);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Enviar correo para recuperación de contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: juan@example.com
 *     responses:
 *       200:
 *         description: Correo de recuperación enviado
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   get:
 *     summary: Página para restablecer contraseña
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Página HTML para restablecer contraseña
 */
router.get("/reset-password/:token", showResetPasswordPage);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: Restablecer contraseña del usuario
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 example: NuevaContraseña123@
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 */
router.post("/reset-password/:token", resetPassword);

export default router;
