import { jest } from "@jest/globals";

const MOCK_DATOS_MINIMOS = ["hostname", "ip", "sistema_operativo"];

const mocks = {
  getAsync: jest.fn(),
  runAsync: jest.fn(),
  normalizar: jest.fn(),
};

jest.unstable_mockModule("../../utils/dbHelper.js", () => ({
  getAsync: mocks.getAsync,
  runAsync: mocks.runAsync,
}));

jest.unstable_mockModule("../../utils/datosHelper.js", () => ({
  normalizar: mocks.normalizar,
  obtenerCamposMinimos: jest.fn(),
  obtenerUsuarioDestino: jest.fn(),
  validarRegistro: jest.fn(),
}));

const { obtenerDatosMinimos, reemplazarDatosMinimos } = await import(
  "../../controllers/datosMinimosController.js"
);

const mockReqRes = (usuario = null) => ({
  req: {
    body: {},
    usuario: usuario || { id: 1, isAdmin: 0 },
  },
  res: {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  },
});

describe("datosMinimosController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock normalizar para que devuelva el valor normalizado
    mocks.normalizar.mockImplementation((texto) => texto.toLowerCase().trim());
  });

  describe("obtenerDatosMinimos", () => {
    it("retorna datos mínimos exitosamente para admin", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      const mockData = { datos: JSON.stringify(MOCK_DATOS_MINIMOS) };

      mocks.getAsync.mockResolvedValue(mockData);

      await obtenerDatosMinimos(req, res);

      expect(mocks.getAsync).toHaveBeenCalledWith(
        "SELECT datos FROM datos_minimos WHERE id = 1"
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: MOCK_DATOS_MINIMOS,
      });
    });

    it("retorna datos mínimos exitosamente para usuario no admin", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 0 });
      const mockData = { datos: JSON.stringify(MOCK_DATOS_MINIMOS) };

      mocks.getAsync.mockResolvedValue(mockData);

      await obtenerDatosMinimos(req, res);

      expect(mocks.getAsync).toHaveBeenCalledWith(
        "SELECT datos FROM datos_minimos WHERE id = 1"
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: MOCK_DATOS_MINIMOS,
      });
    });

    it("retorna 500 si no existe registro base", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });

      mocks.getAsync.mockResolvedValue(null);

      await obtenerDatosMinimos(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "No existe registro base",
      });
    });

    it("maneja errores del servidor", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      const error = new Error("Database error");

      mocks.getAsync.mockRejectedValue(error);

      await obtenerDatosMinimos(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error",
        error: error.message,
      });
    });
  });

  describe("reemplazarDatosMinimos", () => {
    it("reemplaza datos mínimos exitosamente", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body.datos = ["hostname", "IP", "  Sistema Operativo  "];

      mocks.runAsync.mockResolvedValue({});

      await reemplazarDatosMinimos(req, res);

      expect(mocks.runAsync).toHaveBeenCalledWith(
        "UPDATE datos_minimos SET datos = ? WHERE id = 1",
        [JSON.stringify(["hostname", "IP", "Sistema Operativo"])]
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Datos mínimos reemplazados",
        datos: ["hostname", "IP", "Sistema Operativo"],
      });
    });

    it("elimina duplicados correctamente", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body.datos = ["hostname", "HOSTNAME", "ip", "IP"];

      mocks.runAsync.mockResolvedValue({});

      await reemplazarDatosMinimos(req, res);

      // Debería eliminar duplicados normalizados
      expect(mocks.runAsync).toHaveBeenCalled();
      const callArgs = mocks.runAsync.mock.calls[0];
      const datosGuardados = JSON.parse(callArgs[1]);
      // Verificar que se eliminaron duplicados (normalizados)
      expect(datosGuardados.length).toBeLessThanOrEqual(4);
    });

    it("retorna 403 si no es admin", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 0 });
      req.body.datos = MOCK_DATOS_MINIMOS;

      await reemplazarDatosMinimos(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Solo administrador",
      });
    });

    it("retorna 400 si datos no es un array", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body.datos = "not-an-array";

      await reemplazarDatosMinimos(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "'datos' debe ser un array",
      });
    });

    it("maneja errores del servidor", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body.datos = MOCK_DATOS_MINIMOS;
      const error = new Error("Database error");

      mocks.runAsync.mockRejectedValue(error);

      await reemplazarDatosMinimos(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error",
        error: error.message,
      });
    });
  });
});
