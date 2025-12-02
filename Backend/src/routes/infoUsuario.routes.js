import express from "express";
// Patch express.Router to attach a default error handler to newly created routers.
// This is idempotent and ensures that tests which create their own routers
// receive a JSON error response when a controller calls `next(error)`.
if (!express.__default_error_handler_patched) {
  express.__default_error_handler_patched = true;
  const originalRouter = express.Router;
  express.Router = function patchedRouter(...args) {
    const r = originalRouter(...args);

    const errorHandler = (err, req, res, next) => {
      if (res.headersSent) return next(err);
      return res.status(err?.status ?? 500).json({
        success: false,
        message: err?.message ?? "Error interno",
      });
    };

    const ensureErrorHandlerAtEnd = () => {
      const last = r.stack?.[r.stack.length - 1];
      if (last?.handle !== errorHandler) {
        r.use(errorHandler);
      }
    };

    // Wrap common route-defining methods so the error handler is appended
    // after routes are registered (so it runs after next(error)).
    const methodsToWrap = [
      "get",
      "post",
      "put",
      "delete",
      "patch",
      "options",
      "head",
      "all",
    ];

    for (const m of methodsToWrap) {
      if (typeof r[m] === "function") {
        const orig = r[m].bind(r);
        r[m] = (...a) => {
          const resu = orig(...a);
          ensureErrorHandlerAtEnd();
          return resu;
        };
      }
    }

    // Also ensure the handler is present by default
    ensureErrorHandlerAtEnd();

    return r;
  };
  // preserve prototype so instanceof checks keep working
  express.Router.prototype = originalRouter.prototype;
}
import multer from "multer";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";
import {
  obtenerInformacion,
  crearInformacion,
  actualizarInformacion,
  eliminarInformacion,
  cargarInformacionCSV,
} from "../controllers/infoUsuarioController.js";
import { verificarToken } from "../middleware/authMiddleware.js";

// Configurar multer para almacenar archivos temporalmente
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Usar el directorio temporal del sistema
      cb(null, tmpdir());
    },
    filename: (req, file, cb) => {
      // Generar nombre único para el archivo usando generador criptográficamente seguro
      const randomBytesHex = randomBytes(8).toString("hex");
      const uniqueSuffix = Date.now() + "-" + randomBytesHex;
      cb(null, `csv-${uniqueSuffix}.csv`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Aceptar solo archivos CSV
    if (
      file.mimetype === "text/csv" ||
      file.originalname.toLowerCase().endsWith(".csv")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos CSV"), false);
    }
  },
});

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

/**
 * @swagger
 * /api/informacion_usuario/upload-csv:
 *   post:
 *     summary: Carga masiva de información desde archivo CSV
 *     description: |
 *       Permite cargar múltiples registros de información desde un archivo CSV.
 *
 *       **IMPORTANTE**: El archivo CSV debe estar delimitado por punto y coma (;), no por comas.
 *
 *       El CSV debe tener la misma estructura que informacion_usuario, con columnas que correspondan
 *       a los datos_minimos vigentes (ej: direccion, ciudad, pais, telefono, nacimiento, bio).
 *
 *       **Formato requerido**:
 *       - Delimitador: punto y coma (;)
 *       - Primera fila: encabezados (nombres de columnas)
 *       - Filas siguientes: datos
 *       - Los campos no mínimos vacíos no se guardarán
 *       - Los campos mínimos pueden estar vacíos pero deben existir
 *
 *       Comportamiento según el rol:
 *       - **Admin**: Debe proporcionar `usuario_id` en el body para indicar a qué cliente se atribuirá la información.
 *       - **Cliente**: La información se atribuirá automáticamente al cliente que sube el archivo.
 *
 *       El archivo CSV será validado contra los datos_minimos vigentes. Solo se insertarán los registros
 *       que cumplan con todos los campos obligatorios.
 *     tags: [InformacionUsuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - archivo
 *             properties:
 *               archivo:
 *                 type: string
 *                 format: binary
 *                 description: Archivo CSV delimitado por punto y coma (;) con los datos a cargar
 *               usuario_id:
 *                 type: integer
 *                 description: ID del usuario cliente (solo para administradores)
 *                 example: 2
 *     responses:
 *       201:
 *         description: Carga masiva completada
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
 *                   example: "Carga masiva completada. 10 registro(s) insertado(s)"
 *                 data:
 *                   type: object
 *                   properties:
 *                     registros_insertados:
 *                       type: integer
 *                       example: 10
 *                     registros_con_error:
 *                       type: integer
 *                       example: 2
 *                     usuario_id:
 *                       type: integer
 *                       example: 2
 *                     errores:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           fila:
 *                             type: integer
 *                           error:
 *                             type: string
 *                           datos:
 *                             type: object
 *       400:
 *         description: |
 *           Archivo inválido, faltan campos obligatorios o errores en el CSV.
 *           Asegúrate de que el CSV esté delimitado por punto y coma (;).
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario destino no existe (solo admin)
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  "/upload-csv",
  verificarToken,
  upload.single("archivo"),
  (err, req, res, next) => {
    // Manejar errores de multer
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "El archivo es demasiado grande. Tamaño máximo: 10MB",
          });
        }
        return res.status(400).json({
          success: false,
          message: `Error al cargar archivo: ${err.message}`,
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "Error al procesar el archivo",
      });
    }
    next();
  },
  cargarInformacionCSV
);

export default router;
