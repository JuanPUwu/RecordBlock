import express from "express";
import {
  loginUsuario,
  refreshToken,
  logout,
  forgotPassword,
  showResetPasswordPage,
  resetPassword,
  getMySessions,
  deleteSession,
  deleteAllOtherSessions,
} from "../controllers/authController.js";
import { verificarToken } from "../middleware/authMiddleware.js";

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
 *                 format: email
 *                 example: "admin@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Contraseña123@"
 *     responses:
 *       200:
 *         description: Login exitoso. Devuelve accessToken y guarda refreshToken en cookie HttpOnly.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 accessToken:
 *                   type: string
 *                 usuario:
 *                   type: object
 *       401:
 *         description: Credenciales inválidas
 *       403:
 *         description: Correo no verificado
 */
router.post("/login", loginUsuario);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar access token usando el refresh token (desde cookie)
 *     tags: [Auth]
 *     description: >
 *       Obtiene el refresh token desde una cookie HttpOnly.
 *       Devuelve un nuevo accessToken y renueva también el refreshToken.
 *     responses:
 *       200:
 *         description: Token renovado correctamente
 *       401:
 *         description: No se envió refresh token
 *       403:
 *         description: Token inválido o expirado
 */
router.post("/refresh", refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión del usuario
 *     tags: [Auth]
 *     description: >
 *       Elimina el refresh token de la base de datos
 *       + limpia la cookie
 *       + agrega el accessToken actual a la blacklist.
 *
 *       Requiere:
 *       - Cookie "refreshToken"
 *       - Header Authorization: Bearer {accessToken} (opcional)
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
 *       401:
 *         description: No hay refresh token (no hay sesión activa)
 */
router.post("/logout", logout);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Enviar correo para recuperación de contraseña
 *     tags: [ForgotPassword]
 *     security: []
 *     description: Envía un correo con un enlace HTML para restablecer la contraseña.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Correo de recuperación enviado
 *       404:
 *         description: Email no existe
 *       403:
 *         description: Correo sin verificar
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   get:
 *     summary: Página HTML para restablecer contraseña
 *     tags: [ForgotPassword]
 *     description: Retorna una página HTML con un formulario.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: HTML de formulario o error
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
router.get("/reset-password/:token", showResetPasswordPage);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: Procesar el formulario HTML para restablecer contraseña
 *     tags: [ForgotPassword]
 *     description: >
 *       Recibe datos desde un formulario (x-www-form-urlencoded).
 *       Devuelve una página HTML de éxito o fallo.
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
 *     responses:
 *       200:
 *         description: Página HTML indicando éxito o error
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
router.post("/reset-password/:token", resetPassword);

/**
 * @swagger
 * /api/auth/sessions:
 *   get:
 *     summary: Obtener todas las sesiones activas del usuario
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     description: Retorna todas las sesiones activas del usuario autenticado
 *     responses:
 *       200:
 *         description: Lista de sesiones activas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 sessions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       deviceInfo:
 *                         type: string
 *                       ipAddress:
 *                         type: string
 *                       userAgent:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                       lastUsedAt:
 *                         type: string
 *                       expiresAt:
 *                         type: string
 *       401:
 *         description: No autenticado
 */
router.get("/sessions", verificarToken, getMySessions);

/**
 * @swagger
 * /api/auth/sessions/{sessionId}:
 *   delete:
 *     summary: Eliminar una sesión específica
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     description: Elimina una sesión específica del usuario. No se puede eliminar la sesión actual.
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sesión eliminada correctamente
 *       400:
 *         description: No se puede eliminar la sesión actual
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Sesión no encontrada
 */
router.delete("/sessions/:sessionId", verificarToken, deleteSession);

/**
 * @swagger
 * /api/auth/sessions/others:
 *   delete:
 *     summary: Eliminar todas las demás sesiones
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     description: Elimina todas las sesiones del usuario excepto la sesión actual
 *     responses:
 *       200:
 *         description: Todas las demás sesiones han sido cerradas
 *       401:
 *         description: No autenticado o no hay sesión activa
 */
router.delete("/sessions/others", verificarToken, deleteAllOtherSessions);

export default router;
