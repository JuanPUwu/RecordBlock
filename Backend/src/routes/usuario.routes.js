// routes/usuario.routes.js
import express from "express";
import {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
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
 *     description: Crea un usuario con rol "cliente" por defecto. Solo accesible para administradores.
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
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 example: Contraseña123@
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario creado correctamente
 *                 usuarioId:
 *                   type: integer
 *                   example: 7
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

export default router;
