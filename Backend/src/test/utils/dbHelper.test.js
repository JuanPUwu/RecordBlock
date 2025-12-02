import { jest } from "@jest/globals";

const mocks = {
  dbRun: jest.fn(),
  dbGet: jest.fn(),
  dbAll: jest.fn(),
};

const mockDb = {
  run: mocks.dbRun,
  get: mocks.dbGet,
  all: mocks.dbAll,
};

jest.unstable_mockModule("../../config/database.js", () => ({
  default: mockDb,
}));

const { runAsync, getAsync, allAsync } = await import(
  "../../utils/dbHelper.js"
);

describe("dbHelper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("runAsync", () => {
    it("ejecuta consulta de escritura exitosamente", async () => {
      const sql = "INSERT INTO usuario (nombre) VALUES (?)";
      const params = ["Test User"];

      // Crear un objeto mock que simula 'this' de db.run
      const mockContext = {
        lastID: 1,
        changes: 1,
      };

      mocks.dbRun.mockImplementation(function (sql, params, callback) {
        // Asignar propiedades al contexto this antes de llamar callback
        this.lastID = mockContext.lastID;
        this.changes = mockContext.changes;
        // Llamar callback con null (sin error) y pasar this como contexto
        callback.call(this, null);
        return this;
      });

      const result = await runAsync(sql, params);

      expect(mocks.dbRun).toHaveBeenCalledWith(
        sql,
        params,
        expect.any(Function)
      );
      // Verificar que result tiene las propiedades esperadas
      expect(result).toBeDefined();
      expect(result.lastID).toBe(1);
      expect(result.changes).toBe(1);
    });

    it("rechaza promesa si hay error", async () => {
      const sql = "INSERT INTO usuario (nombre) VALUES (?)";
      const params = ["Test User"];
      const error = new Error("Database error");

      mocks.dbRun.mockImplementation((sql, params, callback) => {
        callback(error);
      });

      await expect(runAsync(sql, params)).rejects.toThrow("Database error");
    });

    it("usa array vacío como params por defecto", async () => {
      const sql = "DELETE FROM usuario";

      const mockThis = { changes: 5 };
      mocks.dbRun.mockImplementation(function (sql, params, callback) {
        callback(null);
        return mockThis;
      });

      await runAsync(sql);

      expect(mocks.dbRun).toHaveBeenCalledWith(sql, [], expect.any(Function));
    });
  });

  describe("getAsync", () => {
    it("retorna un registro exitosamente", async () => {
      const sql = "SELECT * FROM usuario WHERE id = ?";
      const params = [1];
      const mockRow = { id: 1, nombre: "Test User" };

      mocks.dbGet.mockImplementation((sql, params, callback) => {
        callback(null, mockRow);
      });

      const result = await getAsync(sql, params);

      expect(mocks.dbGet).toHaveBeenCalledWith(
        sql,
        params,
        expect.any(Function)
      );
      expect(result).toEqual(mockRow);
    });

    it("retorna undefined si no hay registro", async () => {
      const sql = "SELECT * FROM usuario WHERE id = ?";
      const params = [999];

      mocks.dbGet.mockImplementation((sql, params, callback) => {
        callback(null, undefined);
      });

      const result = await getAsync(sql, params);

      expect(result).toBeUndefined();
    });

    it("rechaza promesa si hay error", async () => {
      const sql = "SELECT * FROM usuario WHERE id = ?";
      const params = [1];
      const error = new Error("Database error");

      mocks.dbGet.mockImplementation((sql, params, callback) => {
        callback(error);
      });

      await expect(getAsync(sql, params)).rejects.toThrow("Database error");
    });
  });

  describe("allAsync", () => {
    it("retorna múltiples registros exitosamente", async () => {
      const sql = "SELECT * FROM usuario";
      const params = [];
      const mockRows = [
        { id: 1, nombre: "User 1" },
        { id: 2, nombre: "User 2" },
      ];

      mocks.dbAll.mockImplementation((sql, params, callback) => {
        callback(null, mockRows);
      });

      const result = await allAsync(sql, params);

      expect(mocks.dbAll).toHaveBeenCalledWith(
        sql,
        params,
        expect.any(Function)
      );
      expect(result).toEqual(mockRows);
    });

    it("retorna array vacío si no hay registros", async () => {
      const sql = "SELECT * FROM usuario WHERE id > 999";
      const params = [];

      mocks.dbAll.mockImplementation((sql, params, callback) => {
        callback(null, []);
      });

      const result = await allAsync(sql, params);

      expect(result).toEqual([]);
    });

    it("rechaza promesa si hay error", async () => {
      const sql = "SELECT * FROM usuario";
      const params = [];
      const error = new Error("Database error");

      mocks.dbAll.mockImplementation((sql, params, callback) => {
        callback(error);
      });

      await expect(allAsync(sql, params)).rejects.toThrow("Database error");
    });
  });
});
