// routes/auth.routes.js
import express from "express";
import {
  loginUsuario,
  refreshToken,
  logout,
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

export default router;
