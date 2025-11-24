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
 *       - **Admin**: puede crear información para cualquier usuario indicando `usuario_id`.<br>
 *       - **Cliente**: crea información asociada a su propio ID.<br>
 *       - El campo `datos` acepta un **objeto** o un **array de objetos**.<br>
 *       - Los campos obligatorios se obtienen **dinámicamente desde la tabla `datos_minimos`**.
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
 *                 description: >
 *                   Objeto o array de objetos con los campos definidos en la tabla `datos_minimos`.
 *                 oneOf:
 *                   - type: object
 *                     additionalProperties:
 *                       type: string
 *                     example:
 *                       Hostname: "ServidorPrincipal"
 *                       Plataforma: "Windows Server"
 *                   - type: array
 *                     items:
 *                       type: object
 *                       additionalProperties:
 *                         type: string
 *                     example:
 *                       - Hostname: "ServidorBackup"
 *                         Plataforma: "Ubuntu Server"
 *                       - Hostname: "Firewall1"
 *                         Plataforma: "Fortigate"
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
 *     description: >
 *       - **Admin**: puede actualizar información de cualquier usuario indicando `usuario_id`.
 *       - **Cliente**: solo puede actualizar la información asociada a su propio ID (se ignora `usuario_id` en este caso).
 *       - Los siguientes campos dentro de `datos` son **obligatorios**:
 *         `hostname`, `plataforma`, `"marca/modelo"`, `tipo`, `"firmware/version s.o"`, `ubicacion`, `licenciamiento`.
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
 *                 example: 1
 *               usuario_id:
 *                 type: integer
 *                 example: 1
 *               datos:
 *                 type: object
 *                 required:
 *                   - hostname
 *                   - plataforma
 *                   - "marca/modelo"
 *                   - tipo
 *                   - "firmware/version s.o"
 *                   - ubicacion
 *                   - licenciamiento
 *                 properties:
 *                   hostname:
 *                     type: string
 *                     example: "ServidorPrincipal"
 *                   plataforma:
 *                     type: string
 *                     example: "Windows Server"
 *                   "marca/modelo":
 *                     type: string
 *                     example: "Dell PowerEdge R740"
 *                   tipo:
 *                     type: string
 *                     example: "Servidor"
 *                   "firmware/version s.o":
 *                     type: string
 *                     example: "v2.4.1"
 *                   ubicacion:
 *                     type: string
 *                     example: "Bogotá - Centro de Datos"
 *                   licenciamiento:
 *                     type: string
 *                     example: "Windows Server 2022 Standard"
 *     responses:
 *       200:
 *         description: Información actualizada correctamente
 *       400:
 *         description: Datos inválidos o incompletos
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

/**
 * @swagger
 * /api/informacion_usuario/datos_minimos:
 *   get:
 *     summary: Obtener todos los datos mínimos
 *     description: >
 *       - **Solo ADMIN** puede consultar la lista completa.
 *     tags: [DatosMinimos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de datos mínimos
 *       403:
 *         description: Solo admin
 *       500:
 *         description: Error al obtener datos
 */
router.get("/datos_minimos", verificarToken, obtenerDatosMinimos);

/**
 * @swagger
 * /api/informacion_usuario/datos_minimos:
 *   put:
 *     summary: Reemplazar la lista completa de datos mínimos
 *     description: >
 *       Reemplaza completamente la lista de **datos mínimos** almacenada en la tabla `datos_minimos`.
 *
 *       **Restricciones:**
 *       - Solo un **ADMIN** puede ejecutar esta operación.
 *       - Se eliminarán los valores duplicados automáticamente.
 *       - El sistema normaliza los valores (trim, lowercase para comparación).
 *
 *     tags: [DatosMinimos]
 *     security:
 *       - bearerAuth: []
 *
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
 *                 description: Lista completa de datos mínimos que reemplazará a la existente.
 *                 items:
 *                   type: string
 *                 example:
 *                   - "hostname"
 *                   - "plataforma"
 *                   - "ubicacion"
 *                   - "estado"
 *
 *     responses:
 *       200:
 *         description: Lista reemplazada correctamente
 *       400:
 *         description: Formato inválido (se esperaba un array)
 *       403:
 *         description: Solo administradores pueden realizar esta acción
 *       500:
 *         description: Error interno del servidor
 */
router.put("/datos_minimos", verificarToken, reemplazarDatosMinimos);

export default router;
