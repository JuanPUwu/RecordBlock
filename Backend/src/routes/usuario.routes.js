// routes/usuario.routes.js
import express from "express";
import {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  verificarCorreo,
} from "../controllers/usuarioController.js";

import {
  verificarToken,
  verificarAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/usuario:
 *   get:
 *     summary: Obtener todos los clientes
 *     description: Obtiene todos los clientes. Solo accesible para `Administradores`.
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios (clientes)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *                   email:
 *                     type: string
 *                   rol:
 *                     type: string
 *                   verificado:
 *                     type: boolean
 *       403:
 *         description: Acceso denegado (no admin)
 *       500:
 *         description: Error al obtener usuarios
 */
router.get("/", verificarToken, verificarAdmin, obtenerUsuarios);

/**
 * @swagger
 * /api/usuario:
 *   post:
 *     summary: Crear un nuevo cliente
 *     description: |
 *      Solo accesible para `Administradores`.
 *      - Crea un cliente.
 *      - Envía un correo de verificación al cliente creado.
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *       400:
 *         description: Datos inválidos o faltantes
 *       403:
 *         description: Acceso denegado (no admin)
 *       500:
 *         description: Error al crear usuario
 */
router.post("/", verificarToken, verificarAdmin, crearUsuario);

/**
 * @swagger
 * /api/usuario:
 *   put:
 *     summary: Actualizar contraseña propia
 *     description: Permite que un usuario `Cliente` actualice su propia contraseña
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Contraseña inválida o faltante
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al actualizar contraseña
 */
router.put("/", verificarToken, actualizarUsuario);

/**
 * @swagger
 * /api/usuario/{id}:
 *   put:
 *     summary: Actualizar la contraseña de un usuario por ID
 *     description: |
 *       - Un `Administrador` puede actualizar la contraseña de cualquier cliente.
 *       - Un `Administrador` solo puede actualizar su propia contraseña.
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: usuario_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Contraseña inválida o faltante
 *       403:
 *         description: No tienes permiso para actualizar esta contraseña
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al actualizar usuario
 */
router.put("/:usuario_id", verificarToken, actualizarUsuario);

/**
 * @swagger
 * /api/usuario/{id}:
 *   delete:
 *     summary: Eliminar un usuario por ID
 *     description: Elimina un usuario específico. Solo accesible para `Administradores`.
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       403:
 *         description: Acceso denegado (no admin)
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al eliminar usuario
 */
router.delete("/:id", verificarToken, verificarAdmin, eliminarUsuario);

/**
 * @swagger
 * /api/usuario/verificar/{token}:
 *   get:
 *     summary: Verificar correo electrónico de un usuario
 *     description: Verifica el correo del usuario usando el token enviado por email.
 *     tags: [VerificacionCorreo]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de verificación enviado al correo del usuario
 *     responses:
 *       200:
 *         description: Correo verificado correctamente (HTML)
 *       400:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error al verificar correo
 */
router.get("/verificar/:token", verificarCorreo);

export default router;
