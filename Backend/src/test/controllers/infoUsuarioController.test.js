import { jest } from "@jest/globals";

const MOCK_USER_ID = 1;
const MOCK_INFO_ID = 10;
const MOCK_DATOS = { hostname: "server1", ip: "192.168.1.1" };
const MOCK_DATOS_MINIMOS = ["hostname", "ip"];

const mocks = {
  allAsync: jest.fn(),
  getAsync: jest.fn(),
  runAsync: jest.fn(),
  obtenerCamposMinimos: jest.fn(),
  obtenerUsuarioDestino: jest.fn(),
  normalizar: jest.fn(),
  validarRegistro: jest.fn(),
  validarArchivoCSV: jest.fn(),
  determinarUsuarioDestinoCSV: jest.fn(),
  procesarFilaCSV: jest.fn(),
  procesarCSVCompletado: jest.fn(),
  limpiarArchivo: jest.fn(),
};

jest.unstable_mockModule("../../utils/dbHelper.js", () => ({
  allAsync: mocks.allAsync,
  getAsync: mocks.getAsync,
  runAsync: mocks.runAsync,
}));

jest.unstable_mockModule("../../utils/datosHelper.js", () => ({
  obtenerCamposMinimos: mocks.obtenerCamposMinimos,
  obtenerUsuarioDestino: mocks.obtenerUsuarioDestino,
  normalizar: mocks.normalizar,
  validarRegistro: mocks.validarRegistro,
}));

jest.unstable_mockModule("../../utils/csvHelper.js", () => ({
  limpiarArchivo: mocks.limpiarArchivo,
  validarArchivoCSV: mocks.validarArchivoCSV,
  determinarUsuarioDestinoCSV: mocks.determinarUsuarioDestinoCSV,
  procesarFilaCSV: mocks.procesarFilaCSV,
  procesarCSVCompletado: mocks.procesarCSVCompletado,
}));

jest.unstable_mockModule("node:fs", () => ({
  createReadStream: jest.fn(),
}));

const {
  obtenerInformacion,
  crearInformacion,
  actualizarInformacion,
  eliminarInformacion,
  cargarInformacionCSV,
} = await import("../../controllers/infoUsuarioController.js");

const mockReqRes = (usuario = null) => ({
  req: {
    body: {},
    query: {},
    usuario: usuario || { id: MOCK_USER_ID, isAdmin: 0 },
    file: null,
  },
  res: {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  },
});

// Helper function to safely normalize text
const safeNormalize = (texto) => {
  if (texto == null) return "";
  if (typeof texto !== "string") {
    throw new TypeError("normalizar expects a string");
  }
  return texto.toLowerCase().trim();
};

describe("infoUsuarioController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mocks.normalizar.mockImplementation(safeNormalize);
  });

  describe("obtenerInformacion", () => {
    it("obtiene información como admin sin filtro", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      const mockRows = [
        {
          id: MOCK_INFO_ID,
          usuario_id: MOCK_USER_ID,
          datos: JSON.stringify(MOCK_DATOS),
          datos_minimos: JSON.stringify(MOCK_DATOS_MINIMOS),
          usuario_nombre: "Test User",
        },
      ];

      mocks.allAsync.mockResolvedValue(mockRows);

      await obtenerInformacion(req, res);

      expect(mocks.allAsync).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [
          {
            info_id: MOCK_INFO_ID,
            usuario_id: MOCK_USER_ID,
            usuario_nombre: "Test User",
            datos: [MOCK_DATOS],
            datos_minimos_iniciales: MOCK_DATOS_MINIMOS,
          },
        ],
      });
    });

    it("obtiene información como admin con filtro usuario_id", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.query.usuario_id = "2";
      const mockRows = [
        {
          id: MOCK_INFO_ID,
          usuario_id: 2,
          datos: JSON.stringify(MOCK_DATOS),
          datos_minimos: JSON.stringify(MOCK_DATOS_MINIMOS),
          usuario_nombre: "User 2",
        },
      ];

      mocks.allAsync.mockResolvedValue(mockRows);

      await obtenerInformacion(req, res);

      expect(mocks.allAsync).toHaveBeenCalled();
      const queryCall = mocks.allAsync.mock.calls[0][0];
      expect(queryCall).toContain("AND u.id = ?");
    });

    it("obtiene información como cliente", async () => {
      const { req, res } = mockReqRes({ id: MOCK_USER_ID, isAdmin: 0 });
      const mockRows = [
        {
          id: MOCK_INFO_ID,
          usuario_id: MOCK_USER_ID,
          datos: JSON.stringify(MOCK_DATOS),
          datos_minimos: JSON.stringify(MOCK_DATOS_MINIMOS),
        },
      ];

      mocks.allAsync.mockResolvedValue(mockRows);

      await obtenerInformacion(req, res);

      expect(mocks.allAsync).toHaveBeenCalledWith(
        "SELECT id, usuario_id, datos, datos_minimos FROM informacion_usuario WHERE usuario_id = ?",
        [MOCK_USER_ID]
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [
          {
            info_id: MOCK_INFO_ID,
            usuario_id: MOCK_USER_ID,
            datos: [MOCK_DATOS],
            datos_minimos_iniciales: MOCK_DATOS_MINIMOS,
          },
        ],
      });
    });

    it("maneja errores del servidor", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      const error = new Error("Database error");

      mocks.allAsync.mockRejectedValue(error);

      await obtenerInformacion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error",
        error: error.message,
      });
    });
  });

  describe("crearInformacion", () => {
    it("crea información exitosamente como admin", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = {
        usuario_id: 2,
        datos: MOCK_DATOS,
      };

      mocks.obtenerUsuarioDestino.mockResolvedValue({ usuario_id: 2 });
      mocks.obtenerCamposMinimos.mockResolvedValue(MOCK_DATOS_MINIMOS);
      mocks.validarRegistro.mockReturnValue([]);
      mocks.runAsync.mockResolvedValue({ lastID: MOCK_INFO_ID });

      await crearInformacion(req, res);

      expect(mocks.obtenerUsuarioDestino).toHaveBeenCalled();
      expect(mocks.obtenerCamposMinimos).toHaveBeenCalled();
      expect(mocks.validarRegistro).toHaveBeenCalled();
      expect(mocks.runAsync).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Información creada correctamente",
        data: {
          info_id: MOCK_INFO_ID,
          usuario_id: 2,
          datos: [MOCK_DATOS],
        },
      });
    });

    it("crea información exitosamente como cliente", async () => {
      const { req, res } = mockReqRes({ id: MOCK_USER_ID, isAdmin: 0 });
      req.body = { datos: MOCK_DATOS };

      mocks.obtenerUsuarioDestino.mockResolvedValue({
        usuario_id: MOCK_USER_ID,
      });
      mocks.obtenerCamposMinimos.mockResolvedValue(MOCK_DATOS_MINIMOS);
      mocks.validarRegistro.mockReturnValue([]);
      mocks.runAsync.mockResolvedValue({ lastID: MOCK_INFO_ID });

      await crearInformacion(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("retorna 400 si falta el campo datos", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = {};

      mocks.obtenerUsuarioDestino.mockResolvedValue({ usuario_id: 2 });

      await crearInformacion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "El campo 'datos' es obligatorio",
      });
    });

    it("retorna 400 si datos no es un objeto válido", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = { datos: "not-an-object" };

      mocks.obtenerUsuarioDestino.mockResolvedValue({ usuario_id: 2 });
      mocks.obtenerCamposMinimos.mockResolvedValue(MOCK_DATOS_MINIMOS);

      await crearInformacion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Cada elemento de 'datos' debe ser un JSON válido",
      });
    });

    it("retorna 400 si faltan campos obligatorios", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = { datos: { hostname: "server1" } }; // falta ip

      mocks.obtenerUsuarioDestino.mockResolvedValue({ usuario_id: 2 });
      mocks.obtenerCamposMinimos.mockResolvedValue(MOCK_DATOS_MINIMOS);
      mocks.validarRegistro.mockReturnValue(["ip"]);

      await crearInformacion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Faltan campos obligatorios: ip",
      });
    });

    it("maneja errores del servidor", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = { datos: MOCK_DATOS };

      mocks.obtenerUsuarioDestino.mockResolvedValue({ usuario_id: 2 });
      mocks.obtenerCamposMinimos.mockRejectedValue(new Error("Database error"));

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await crearInformacion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error",
      });

      consoleSpy.mockRestore();
    });
  });

  describe("actualizarInformacion", () => {
    it("actualiza información exitosamente como admin", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = {
        info_id: MOCK_INFO_ID,
        usuario_id: 2,
        datos: { ...MOCK_DATOS, sistema: "Linux" },
      };

      mocks.obtenerUsuarioDestino.mockResolvedValue({ usuario_id: 2 });
      mocks.getAsync.mockResolvedValue({
        id: MOCK_INFO_ID,
        usuario_id: 2,
        datos: JSON.stringify(MOCK_DATOS),
        datos_minimos: JSON.stringify(MOCK_DATOS_MINIMOS),
      });
      mocks.runAsync.mockResolvedValue({});
      // Mock normalizar para que funcione correctamente
      mocks.normalizar.mockImplementation(safeNormalize);

      await actualizarInformacion(req, res);

      expect(mocks.getAsync).toHaveBeenCalled();
      expect(mocks.runAsync).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Información actualizada",
        data: {
          info_id: MOCK_INFO_ID,
          usuario_id: 2,
          datos: { ...MOCK_DATOS, sistema: "Linux" },
        },
      });
    });

    it("actualiza información exitosamente como cliente", async () => {
      const { req, res } = mockReqRes({ id: MOCK_USER_ID, isAdmin: 0 });
      req.body = {
        info_id: MOCK_INFO_ID,
        datos: { ...MOCK_DATOS, sistema: "Linux" },
      };

      mocks.getAsync.mockResolvedValue({
        id: MOCK_INFO_ID,
        usuario_id: MOCK_USER_ID,
        datos: JSON.stringify(MOCK_DATOS),
        datos_minimos: JSON.stringify(MOCK_DATOS_MINIMOS),
      });
      mocks.runAsync.mockResolvedValue({});
      // Mock normalizar para que funcione correctamente
      mocks.normalizar.mockImplementation(safeNormalize);

      await actualizarInformacion(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Información actualizada",
        data: {
          info_id: MOCK_INFO_ID,
          usuario_id: MOCK_USER_ID,
          datos: { ...MOCK_DATOS, sistema: "Linux" },
        },
      });
    });

    it("retorna 400 si falta info_id", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = { datos: MOCK_DATOS };

      await actualizarInformacion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "'info_id' obligatorio",
      });
    });

    it("retorna 400 si datos no es un objeto", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = { info_id: MOCK_INFO_ID, datos: "not-an-object" };

      await actualizarInformacion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "'datos' inválido",
      });
    });

    it("retorna 404 si la información no existe o no pertenece", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = {
        info_id: MOCK_INFO_ID,
        usuario_id: 2,
        datos: MOCK_DATOS,
      };

      mocks.obtenerUsuarioDestino.mockResolvedValue({ usuario_id: 2 });
      mocks.getAsync.mockResolvedValue(null);

      await actualizarInformacion(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "La información no pertenece o no existe",
      });
    });

    it("retorna 400 si faltan campos mínimos iniciales", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = {
        info_id: MOCK_INFO_ID,
        usuario_id: 2,
        datos: { hostname: "server1" }, // falta ip
      };

      mocks.obtenerUsuarioDestino.mockResolvedValue({ usuario_id: 2 });
      mocks.getAsync.mockResolvedValue({
        id: MOCK_INFO_ID,
        usuario_id: 2,
        datos: JSON.stringify(MOCK_DATOS),
        datos_minimos: JSON.stringify(MOCK_DATOS_MINIMOS),
      });
      // Mock normalizar para que funcione correctamente
      mocks.normalizar.mockImplementation(safeNormalize);

      await actualizarInformacion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.stringContaining("Faltan el campo obligatorio"),
      });
    });

    it("maneja errores del servidor", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = {
        info_id: MOCK_INFO_ID,
        usuario_id: 2,
        datos: MOCK_DATOS,
      };

      mocks.obtenerUsuarioDestino.mockRejectedValue(
        new Error("Database error")
      );

      await actualizarInformacion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("eliminarInformacion", () => {
    it("elimina información exitosamente como admin", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = {
        info_id: MOCK_INFO_ID,
        usuario_id: 2,
      };

      mocks.getAsync.mockResolvedValue({
        id: MOCK_INFO_ID,
        usuario_id: 2,
      });
      mocks.runAsync.mockResolvedValue({});

      await eliminarInformacion(req, res);

      expect(mocks.getAsync).toHaveBeenCalled();
      expect(mocks.runAsync).toHaveBeenCalledWith(
        "DELETE FROM informacion_usuario WHERE id = ?",
        [MOCK_INFO_ID]
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Información eliminada",
      });
    });

    it("elimina información exitosamente como cliente", async () => {
      const { req, res } = mockReqRes({ id: MOCK_USER_ID, isAdmin: 0 });
      req.body = { info_id: MOCK_INFO_ID };

      mocks.getAsync.mockResolvedValue({
        id: MOCK_INFO_ID,
        usuario_id: MOCK_USER_ID,
      });
      mocks.runAsync.mockResolvedValue({});

      await eliminarInformacion(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Información eliminada",
      });
    });

    it("retorna 400 si falta info_id", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = {};

      await eliminarInformacion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "El campo 'info_id' es obligatorio",
      });
    });

    it("retorna 400 si admin no envía usuario_id", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = { info_id: MOCK_INFO_ID };

      await eliminarInformacion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "El campo 'usuario_id' es obligatorio para administradores",
      });
    });

    it("retorna 404 si la información no existe o no pertenece", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = {
        info_id: MOCK_INFO_ID,
        usuario_id: 2,
      };

      mocks.getAsync.mockResolvedValue(null);

      await eliminarInformacion(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "La información no pertenece o no existe",
      });
    });

    it("maneja errores del servidor", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = {
        info_id: MOCK_INFO_ID,
        usuario_id: 2,
      };

      mocks.getAsync.mockRejectedValue(new Error("Database error"));

      await eliminarInformacion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("cargarInformacionCSV", () => {
    it("valida archivo CSV y retorna error si es inválido", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.file = { path: "/tmp/test.csv" };

      mocks.validarArchivoCSV.mockReturnValue({
        valido: false,
        mensaje: "Archivo inválido",
      });

      await cargarInformacionCSV(req, res);

      expect(mocks.validarArchivoCSV).toHaveBeenCalledWith(req.file);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Archivo inválido",
      });
    });

    it("maneja errores al procesar CSV", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.file = { path: "/tmp/test.csv" };

      mocks.validarArchivoCSV.mockReturnValue({ valido: true });
      mocks.determinarUsuarioDestinoCSV.mockRejectedValue(
        new Error("Processing error")
      );

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await cargarInformacionCSV(req, res);

      expect(mocks.limpiarArchivo).toHaveBeenCalledWith("/tmp/test.csv");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error al procesar la carga masiva",
        error: "Processing error",
      });

      consoleSpy.mockRestore();
    });
  });

  describe("obtenerInformacion - JSON Parsing Edge Cases", () => {
    it("maneja datos_minimos inválido (JSON corrupto) en admin", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      const mockRows = [
        {
          id: MOCK_INFO_ID,
          usuario_id: MOCK_USER_ID,
          datos: JSON.stringify(MOCK_DATOS),
          datos_minimos: "{ invalid json", // JSON inválido
          usuario_nombre: "Test User",
        },
      ];

      mocks.allAsync.mockResolvedValue(mockRows);

      await obtenerInformacion(req, res);

      // Debe retornar array vacío en casos de error
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [
          {
            info_id: MOCK_INFO_ID,
            usuario_id: MOCK_USER_ID,
            usuario_nombre: "Test User",
            datos: [MOCK_DATOS],
            datos_minimos_iniciales: [],
          },
        ],
      });
    });

    it("maneja datos_minimos null en cliente", async () => {
      const { req, res } = mockReqRes({ id: MOCK_USER_ID, isAdmin: 0 });
      const mockRows = [
        {
          id: MOCK_INFO_ID,
          usuario_id: MOCK_USER_ID,
          datos: JSON.stringify(MOCK_DATOS),
          datos_minimos: null, // null
        },
      ];

      mocks.allAsync.mockResolvedValue(mockRows);

      await obtenerInformacion(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [
          {
            info_id: MOCK_INFO_ID,
            usuario_id: MOCK_USER_ID,
            datos: [MOCK_DATOS],
            datos_minimos_iniciales: [],
          },
        ],
      });
    });
  });

  describe("actualizarInformacion - Validación de no-mínimos", () => {
    it("rechaza si campo no-mínimo es null", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = {
        info_id: MOCK_INFO_ID,
        usuario_id: 2,
        datos: { hostname: "test", ip: "192.168.1.1", sistema: null }, // sistema es null
      };

      mocks.obtenerUsuarioDestino.mockResolvedValue({ usuario_id: 2 });
      mocks.getAsync.mockResolvedValue({
        id: MOCK_INFO_ID,
        usuario_id: 2,
        datos: JSON.stringify(MOCK_DATOS),
        datos_minimos: JSON.stringify(["hostname", "ip"]), // hostname, ip son mínimos
      });
      mocks.normalizar.mockImplementation(safeNormalize);

      await actualizarInformacion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.stringContaining("NO mínimos"),
      });
    });

    it("rechaza si campo no-mínimo es string vacío", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = {
        info_id: MOCK_INFO_ID,
        usuario_id: 2,
        datos: { hostname: "test", ip: "192.168.1.1", sistema: "   " }, // espacios
      };

      mocks.obtenerUsuarioDestino.mockResolvedValue({ usuario_id: 2 });
      mocks.getAsync.mockResolvedValue({
        id: MOCK_INFO_ID,
        usuario_id: 2,
        datos: JSON.stringify(MOCK_DATOS),
        datos_minimos: JSON.stringify(["hostname", "ip"]),
      });
      mocks.normalizar.mockImplementation(safeNormalize);

      await actualizarInformacion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.stringContaining("NO mínimos"),
      });
    });

    it("permite campos mínimos vacíos", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = {
        info_id: MOCK_INFO_ID,
        usuario_id: 2,
        datos: { hostname: "", ip: "192.168.1.1", sistema: "Linux" }, // hostname es mínimo y está vacío
      };

      mocks.obtenerUsuarioDestino.mockResolvedValue({ usuario_id: 2 });
      mocks.getAsync.mockResolvedValue({
        id: MOCK_INFO_ID,
        usuario_id: 2,
        datos: JSON.stringify(MOCK_DATOS),
        datos_minimos: JSON.stringify(["hostname", "ip"]),
      });
      mocks.runAsync.mockResolvedValue({});
      mocks.normalizar.mockImplementation(safeNormalize);

      await actualizarInformacion(req, res);

      // No debe retornar error 400
      expect(res.status).not.toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Información actualizada",
        data: {
          info_id: MOCK_INFO_ID,
          usuario_id: 2,
          datos: { hostname: "", ip: "192.168.1.1", sistema: "Linux" },
        },
      });
    });

    it("rechaza si todos los datos están vacíos (null)", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = {
        info_id: MOCK_INFO_ID,
        usuario_id: 2,
        datos: { hostname: null, ip: null }, // todos los datos son null
      };

      mocks.obtenerUsuarioDestino.mockResolvedValue({ usuario_id: 2 });
      mocks.getAsync.mockResolvedValue({
        id: MOCK_INFO_ID,
        usuario_id: 2,
        datos: JSON.stringify(MOCK_DATOS),
        datos_minimos: JSON.stringify(["hostname", "ip"]),
      });
      mocks.normalizar.mockImplementation(safeNormalize);

      await actualizarInformacion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "La información debe tener al menos un dato con valor",
      });
    });

    it("rechaza si todos los datos están vacíos (strings vacíos)", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = {
        info_id: MOCK_INFO_ID,
        usuario_id: 2,
        datos: { hostname: "", ip: "   " }, // todos los datos son strings vacíos o solo espacios
      };

      mocks.obtenerUsuarioDestino.mockResolvedValue({ usuario_id: 2 });
      mocks.getAsync.mockResolvedValue({
        id: MOCK_INFO_ID,
        usuario_id: 2,
        datos: JSON.stringify(MOCK_DATOS),
        datos_minimos: JSON.stringify(["hostname", "ip"]),
      });
      mocks.normalizar.mockImplementation(safeNormalize);

      await actualizarInformacion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "La información debe tener al menos un dato con valor",
      });
    });

    it("rechaza si todos los datos están vacíos (undefined)", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = {
        info_id: MOCK_INFO_ID,
        usuario_id: 2,
        datos: { hostname: undefined, ip: undefined }, // todos los datos son undefined
      };

      mocks.obtenerUsuarioDestino.mockResolvedValue({ usuario_id: 2 });
      mocks.getAsync.mockResolvedValue({
        id: MOCK_INFO_ID,
        usuario_id: 2,
        datos: JSON.stringify(MOCK_DATOS),
        datos_minimos: JSON.stringify(["hostname", "ip"]),
      });
      mocks.normalizar.mockImplementation(safeNormalize);

      await actualizarInformacion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "La información debe tener al menos un dato con valor",
      });
    });

    it("permite actualización si al menos un dato tiene valor", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = {
        info_id: MOCK_INFO_ID,
        usuario_id: 2,
        datos: { hostname: "", ip: "192.168.1.1" }, // hostname vacío pero ip tiene valor
      };

      mocks.obtenerUsuarioDestino.mockResolvedValue({ usuario_id: 2 });
      mocks.getAsync.mockResolvedValue({
        id: MOCK_INFO_ID,
        usuario_id: 2,
        datos: JSON.stringify(MOCK_DATOS),
        datos_minimos: JSON.stringify(["hostname", "ip"]),
      });
      mocks.runAsync.mockResolvedValue({});
      mocks.normalizar.mockImplementation(safeNormalize);

      await actualizarInformacion(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Información actualizada",
        data: {
          info_id: MOCK_INFO_ID,
          usuario_id: 2,
          datos: { hostname: "", ip: "192.168.1.1" },
        },
      });
    });
  });

  describe("eliminarInformacion - Edge Cases", () => {
    it("retorna 500 si req.usuario.id es undefined en cliente", async () => {
      const { req, res } = mockReqRes({ id: undefined, isAdmin: 0 });
      req.body = { info_id: MOCK_INFO_ID };

      await eliminarInformacion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error: ID de usuario no encontrado",
      });
    });
  });

  describe("crearInformacion - Array de datos", () => {
    it("crea múltiples registros cuando datos es array", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      const datosArray = [
        { hostname: "server1", ip: "192.168.1.1" },
        { hostname: "server2", ip: "192.168.1.2" },
      ];

      req.body = {
        usuario_id: 2,
        datos: datosArray,
      };

      mocks.obtenerUsuarioDestino.mockResolvedValue({ usuario_id: 2 });
      mocks.obtenerCamposMinimos.mockResolvedValue(MOCK_DATOS_MINIMOS);
      mocks.validarRegistro.mockReturnValue([]);
      mocks.runAsync.mockResolvedValue({ lastID: MOCK_INFO_ID });

      await crearInformacion(req, res);

      expect(mocks.runAsync).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Información creada correctamente",
        data: {
          info_id: MOCK_INFO_ID,
          usuario_id: 2,
          datos: datosArray,
        },
      });
    });
  });
});
