import express from "express";
import {
  obtenerInformacion,
  crearInformacion,
  actualizarInformacion,
  eliminarInformacion,
} from "../controllers/infoUsuarioController.js";
import { verificarToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/informacion_usuario:
 *   get:
 *     summary: Obtener informaciones de clientes
 *     description: |
 *       Comportamiento según el rol:
 *       - **Admin**: Puede obtener la información de todos los usuarios clientes.
 *         Opcionalmente, puede filtrar la información mediante `usuario_id`.
 *       - **Cliente**: Solo puede obtener su propia información.
 *     tags: [InformacionUsuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: usuario_id
 *         schema:
 *           type: integer
 *         required: false
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
 *     summary: Crear información de cliente
 *     description: |
 *      Comportamiento según el rol:
 *       - **Admin**: Puede crear información para cualquier cliente según su `usuario_id`.
 *       - **Cliente**: Solo crea información asociada a su propio ID. ignora el parametro `usuario_id`.
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
 *                 example: 2
 *               datos:
 *                 type: object
 *                 description: Objeto JSON con información del cliente
 *                 example:
 *                   hostname: "hostnameExample"
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
 *     description: |
 *       Comportamiento según el rol:
 *       - **Admin**: Puede actualizar información para cualquier cliente según su `usuario_id` e `info_id`.
 *       - **Cliente**: Solo puede actualizar registros que le pertenecen. ignora el parametro `usuario_id`.
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
 *                 description: Objeto JSON con la información actualizada
 *                 example:
 *                   hostname: "hostnameExample"
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
 *     description: |
 *       Comportamiento según el rol:
 *       - **Admin**: Puede eliminar información de cualquier cliente segun su `usuario_id`.
 *       - **Cliente**: Solo puede eliminar información que le pertenezca. ignora el parametro `usuario_id`.
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

export default router;
