// routes/infoUsuario.routes.js
import express from "express";
import {
  obtenerInformacion,
  crearInformacion,
  actualizarInformacion,
  eliminarInformacion,
  obtenerDatosMinimos,
  reemplazarDatosMinimos,
} from "../controllers/infoUsuarioController.js";
import { verificarToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/informacion_usuario:
 *   get:
 *     summary: Obtener informaciones de usuario
 *     description: >
 *       Comportamiento según el rol:
 *       - **Admin**: Obtiene toda la información de usuarios cliente.
 *         Puede filtrar opcionalmente con `usuario_id`.
 *       - **Cliente**: Obtiene únicamente su propia información, ignorando cualquier `usuario_id` enviado.
 *     tags: [InformacionUsuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: usuario_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Solo permitido para admin
 *     responses:
 *       200:
 *         description: Información encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       info_id:
 *                         type: integer
 *                       usuario_id:
 *                         type: integer
 *                       usuario_nombre:
 *                         type: string
 *                       datos:
 *                         type: array
 *                         items:
 *                           type: object
 *       403:
 *         description: Rol no autorizado
 *       500:
 *         description: Error interno
 */
router.get("/", verificarToken, obtenerInformacion);

/**
 * @swagger
 * /api/informacion_usuario:
 *   post:
 *     summary: Crear información de usuario
 *     description: >
 *       - **Admin**: Puede crear información para cualquier usuario especificando `usuario_id`.
 *       - **Cliente**: Solo crea información asociada a su propio ID.
 *
 *       El campo `datos` puede ser:
 *       - un **objeto**, o
 *       - un **array de objetos**.
 *
 *       Cada objeto será validado contra la lista de **datos mínimos** almacenados en BD.
 *     tags: [InformacionUsuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuario_id:
 *                 type: integer
 *                 description: Solo admin
 *               datos:
 *                 description: Objeto o array de objetos JSON
 *                 oneOf:
 *                   - type: object
 *                   - type: array
 *                     items:
 *                       type: object
 *     responses:
 *       201:
 *         description: Información creada correctamente
 *       400:
 *         description: Datos faltantes o inválidos
 *       403:
 *         description: Rol no autorizado
 *       500:
 *         description: Error interno
 */
router.post("/", verificarToken, crearInformacion);

/**
 * @swagger
 * /api/informacion_usuario:
 *   put:
 *     summary: Actualizar información existente
 *     description: >
 *       - **Admin**: Puede actualizar información para cualquier usuario usando `usuario_id`.
 *       - **Cliente**: Solo puede actualizar registros que le pertenecen.
 *
 *       El objeto `datos` será validado contra los **datos mínimos** obtenidos de BD.
 *     tags: [InformacionUsuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - info_id
 *               - datos
 *             properties:
 *               info_id:
 *                 type: integer
 *               usuario_id:
 *                 type: integer
 *                 description: Solo admin
 *               datos:
 *                 type: object
 *                 description: JSON con los campos requeridos según `datos_minimos`
 *     responses:
 *       200:
 *         description: Información actualizada
 *       400:
 *         description: Datos inválidos o faltantes
 *       403:
 *         description: No autorizado
 *       404:
 *         description: El registro no pertenece al usuario o no existe
 *       500:
 *         description: Error interno
 */
router.put("/", verificarToken, actualizarInformacion);

/**
 * @swagger
 * /api/informacion_usuario:
 *   delete:
 *     summary: Eliminar información de usuario
 *     description: >
 *       - **Admin**: Puede eliminar información de cualquier usuario (requiere `usuario_id`).
 *       - **Cliente**: Solo puede eliminar registros que le pertenecen.
 *     tags: [InformacionUsuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               info_id:
 *                 type: integer
 *               usuario_id:
 *                 type: integer
 *                 description: Solo admin
 *     responses:
 *       200:
 *         description: Información eliminada
 *       403:
 *         description: No autorizado
 *       404:
 *         description: No existe o no pertenece
 *       500:
 *         description: Error interno
 */
router.delete("/", verificarToken, eliminarInformacion);

/**
 * @swagger
 * /api/informacion_usuario/datos_minimos:
 *   get:
 *     summary: Obtener la lista de datos mínimos
 *     description: Solo disponible para administradores.
 *     tags: [DatosMinimos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista actual de datos mínimos
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error en servidor
 */
router.get("/datos_minimos", verificarToken, obtenerDatosMinimos);

/**
 * @swagger
 * /api/informacion_usuario/datos_minimos:
 *   put:
 *     summary: Reemplazar completamente la lista de datos mínimos
 *     description: >
 *       - Solo ADMIN
 *       - Elimina duplicados automáticamente
 *       - Normaliza el texto (trim, lowercase para comparación)
 *     tags: [DatosMinimos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - datos
 *             properties:
 *               datos:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Lista reemplazada correctamente
 *       400:
 *         description: Formato inválido
 *       403:
 *         description: Solo admin
 *       500:
 *         description: Error en servidor
 */
router.put("/datos_minimos", verificarToken, reemplazarDatosMinimos);

export default router;
