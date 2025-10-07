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
 *     summary: Obtener todos los usuarios con rol cliente (admin)
 *     description: Devuelve la lista de usuarios cuyo rol es "cliente". Solo accesible para administradores.
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
 *                     example: 3
 *                   nombre:
 *                     type: string
 *                     example: María López
 *                   email:
 *                     type: string
 *                     example: maria@example.com
 *                   rol:
 *                     type: string
 *                     example: cliente
 *                   verificado:
 *                      type: boolean
 *                      example: true
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
 *     summary: Crear un nuevo usuario, rol por defecto "cliente" (admin)
 *     description: Crea un usuario con rol "cliente" por defecto. Solo accesible para administradores. Envía un correo con enlace de verificación al usuario.
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
 *                 example: Pablo
 *               email:
 *                 type: string
 *                 example: pablys8@gmail.com
 *               password:
 *                 type: string
 *                 example: Contraseña123@
 *     responses:
 *       201:
 *         description: Usuario creado correctamente y correo de verificación enviado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario creado correctamente. Se envió un correo de verificación.
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
 * /api/usuario/{id}:
 *   put:
 *     summary: Actualizar la contraseña de un usuario
 *     description: Un admin puede actualizar la contraseña de cualquier usuario. Un cliente solo puede actualizar su propia contraseña (mismo id).
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID del usuario a actualizar
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
 *                 example: NuevaContraseña123@
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
router.put("/:id", verificarToken, actualizarUsuario);

/**
 * @swagger
 * /api/usuario/{id}:
 *   delete:
 *     summary: Eliminar un usuario por ID (admin)
 *     description: Elimina al usuario indicado. Solo accesible para administradores.
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
 *     summary: Verificar correo electrónico del usuario
 *     description: Verifica el correo electrónico del usuario usando el token enviado por correo. Si el token es válido y no ha expirado, marca la cuenta como verificada.
 *     tags: [Usuario]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token único de verificación enviado al correo del usuario
 *     responses:
 *       200:
 *         description: Correo verificado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Correo verificado correctamente.
 *       400:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error al verificar correo
 */
router.get("/verificar/:token", verificarCorreo);

export default router;
