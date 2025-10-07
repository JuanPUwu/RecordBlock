// routes/infoUsuario.routes.js
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
 *     summary: Obtener informaciones de usuario
 *     description: >
 *       - **Admin**: Devuelve todas las informaciones de los usuarios con rol cliente.
 *         Opcionalmente puede filtrar por `usuario_id` usando query params.
 *       - **Cliente**: Devuelve solo las informaciones asociadas al usuario del token
 *         (si se envía `usuario_id` en el query, será ignorado).
 *     tags: [InformacionUsuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: usuario_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: (Solo admin)
 *     responses:
 *       200:
 *         description: Lista de informaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   info_id:
 *                     type: integer
 *                     example: 1
 *                   usuario_id:
 *                     type: integer
 *                     example: 1
 *                   datos:
 *                     type: object
 *                     example:
 *                       direccion: "Calle 123"
 *                       telefono: "3000000000"
 *       403:
 *         description: Rol no autorizado
 *       500:
 *         description: Error al obtener informaciones
 */
router.get("/", verificarToken, obtenerInformacion);

/**
 * @swagger
 * /api/informacion_usuario:
 *   post:
 *     summary: Crear información de usuario
 *     description: >
 *       - **Admin**: puede crear información para cualquier usuario indicando `usuario_id`.
 *       - **Cliente**: crea información asociada a su propio ID (se ignora `usuario_id` en este caso).
 *       - El campo `datos` acepta un **objeto JSON único** o un **array de objetos JSON**.
 *       - Los siguientes campos dentro de `datos` son **obligatorios**:
 *         `hostname`, `plataforma`, `marca_modelo`, `tipo`, `firmware_version`, `ubicacion`, `licenciamiento`.
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
 *                 example: 1
 *               datos:
 *                 oneOf:
 *                   - type: object
 *                     required:
 *                       - hostname
 *                       - plataforma
 *                       - marca_modelo
 *                       - tipo
 *                       - firmware_version
 *                       - ubicacion
 *                       - licenciamiento
 *                     properties:
 *                       hostname:
 *                         type: string
 *                         example: "ServidorPrincipal"
 *                       plataforma:
 *                         type: string
 *                         example: "Windows Server"
 *                       marca_modelo:
 *                         type: string
 *                         example: "Dell PowerEdge R740"
 *                       tipo:
 *                         type: string
 *                         example: "Servidor"
 *                       firmware_version:
 *                         type: string
 *                         example: "v2.4.1"
 *                       ubicacion:
 *                         type: string
 *                         example: "Bogotá - Centro de Datos"
 *                       licenciamiento:
 *                         type: string
 *                         example: "Windows Server 2022 Standard"
 *                   - type: array
 *                     items:
 *                       type: object
 *                       required:
 *                         - hostname
 *                         - plataforma
 *                         - marca_modelo
 *                         - tipo
 *                         - firmware_version
 *                         - ubicacion
 *                         - licenciamiento
 *                       properties:
 *                         hostname:
 *                           type: string
 *                           example: "ServidorBackup"
 *                         plataforma:
 *                           type: string
 *                           example: "Ubuntu Server"
 *                         marca_modelo:
 *                           type: string
 *                           example: "HP ProLiant DL380"
 *                         tipo:
 *                           type: string
 *                           example: "Servidor"
 *                         firmware_version:
 *                           type: string
 *                           example: "v3.0.5"
 *                         ubicacion:
 *                           type: string
 *                           example: "Medellín - Centro Secundario"
 *                         licenciamiento:
 *                           type: string
 *                           example: "Ubuntu 22.04 LTS"
 *     responses:
 *       201:
 *         description: Información creada correctamente
 *       400:
 *         description: Datos inválidos o incompletos
 *       403:
 *         description: Rol no autorizado
 *       500:
 *         description: Error al crear información
 */
router.post("/", verificarToken, crearInformacion);

/**
 * @swagger
 * /api/informacion_usuario:
 *   put:
 *     summary: Actualizar información de usuario
 *     description:
 *       - Si es **admin** puede actualizar información de cualquier usuario (validando pertenencia con `usuario_id`).
 *       - Si es **cliente** solo puede actualizar su propia información.
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
 *               - id
 *               - datos
 *             properties:
 *               info_id:
 *                 type: integer
 *                 example: 1
 *               usuario_id:
 *                 type: integer
 *                 example: 1
 *               datos:
 *                 type: object
 *                 example:
 *                   direccion: "Calle 456"
 *                   telefono: "3111111111"
 *     responses:
 *       200:
 *         description: Información actualizada correctamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: Rol no autorizado o información no perteneciente
 *       404:
 *         description: Información no encontrada
 *       500:
 *         description: Error al actualizar información
 */
router.put("/", verificarToken, actualizarInformacion);

/**
 * @swagger
 * /api/informacion_usuario:
 *   delete:
 *     summary: Eliminar información de usuario
 *     description:
 *       - Si es **admin** puede eliminar información de cualquier usuario (validando pertenencia con `usuario_id`).
 *       - Si es **cliente** solo puede eliminar su propia información.
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
 *                 example: 1
 *               usuario_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Información eliminada correctamente
 *       403:
 *         description: Rol no autorizado o información no perteneciente
 *       404:
 *         description: Información no encontrada
 *       500:
 *         description: Error al eliminar información
 */
router.delete("/", verificarToken, eliminarInformacion);

export default router;
