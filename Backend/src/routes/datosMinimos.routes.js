import express from "express";
import {
  obtenerDatosMinimos,
  reemplazarDatosMinimos,
} from "../controllers/datosMinimosController.js";
import {
  verificarToken,
  verificarAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/datos_minimos:
 *   get:
 *     summary: Obtener la lista de datos mínimos
 *     description: Disponible para usuarios autenticados.
 *     tags: [DatosMinimos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista actual de datos mínimos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error en servidor
 */
router.get("/", verificarToken, obtenerDatosMinimos);

/**
 * @swagger
 * /api/datos_minimos:
 *   put:
 *     summary: Reemplazar completamente la lista de datos mínimos
 *     description: |
 *      Solo disponible para `Administradores`.
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
 *                   example: "hostname"
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
router.put("/", verificarToken, verificarAdmin, reemplazarDatosMinimos);

export default router;
