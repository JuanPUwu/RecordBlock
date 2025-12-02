import { jest } from "@jest/globals";

const mocks = {
  dbAll: jest.fn(),
  dbRun: jest.fn(),
};

// Variable para rastrear la promesa de serialize
let serializePromise = null;

// Mock de sqlite3 antes de importar database
function MockDatabase(path) {
  this.path = path;

  // Mock para la llamada inicial a run (PRAGMA foreign_keys)
  // y todas las llamadas dentro de serialize
  const initRun = jest.fn(function (sql, params, cb) {
    if (typeof params === "function") {
      cb = params;
    }
    if (cb) {
      const mockThis = { lastID: 0, changes: 0 };
      // Ejecutar callback de forma síncrona para PRAGMA y DROP/CREATE
      cb.call(mockThis, null);
    }
    return { lastID: 0, changes: 0 };
  });

  const initAll = jest.fn((sql, params, cb) => {
    if (typeof params === "function") {
      cb = params;
    }
    if (cb) {
      // Para obtenerDatosMinimosIniciales
      if (sql?.includes("datos_minimos")) {
        cb(null, [
          {
            datos:
              '["direccion", "ciudad", "pais", "telefono", "nacimiento", "bio"]',
          },
        ]);
      } else if (sql?.includes("COUNT(*)")) {
        // Para seedInformacionUsuario - conteo
        cb(null, [{ total: 0 }]);
      } else if (sql?.includes("SELECT id FROM usuario")) {
        // Para seedInformacionUsuario - usuarios
        cb(null, [{ id: 1 }, { id: 2 }]);
      } else {
        cb(null, []);
      }
    }
  });

  // Usar los mocks de inicialización para run y all
  this.run = initRun;
  this.all = initAll;

  // Mock de serialize que espera correctamente el callback async
  this.serialize = jest.fn((callback) => {
    // Ejecutar el callback - puede ser async
    const result = callback();
    // Si es una promesa, guardarla para poder esperarla después
    if (result && typeof result.then === "function") {
      serializePromise = result
        .then(() => {
          // Después de que serialize termine, cambiar a los mocks de test
          this.run = mocks.dbRun;
          this.all = mocks.dbAll;
        })
        .catch(() => {
          // Ignorar errores durante la inicialización
          // Pero aún así cambiar a los mocks de test
          this.run = mocks.dbRun;
          this.all = mocks.dbAll;
        });
    } else {
      // Si no es async, cambiar inmediatamente
      this.run = mocks.dbRun;
      this.all = mocks.dbAll;
    }
  });
}

const mockSqlite3 = {
  Database: MockDatabase,
};

jest.unstable_mockModule("sqlite3", () => ({
  default: mockSqlite3,
}));

// Mock de bcrypt
jest.unstable_mockModule("bcrypt", () => ({
  default: {
    hash: jest.fn().mockResolvedValue("hashedPassword"),
  },
}));

// Mock de faker
jest.unstable_mockModule("@faker-js/faker", () => ({
  faker: {
    location: {
      streetAddress: jest.fn().mockReturnValue("123 Main St"),
      city: jest.fn().mockReturnValue("Test City"),
      country: jest.fn().mockReturnValue("Test Country"),
    },
    phone: {
      number: jest.fn().mockReturnValue("1234567890"),
    },
    date: {
      birthdate: jest.fn().mockReturnValue({
        toISOString: jest.fn().mockReturnValue("1990-01-01T00:00:00.000Z"),
      }),
    },
    lorem: {
      sentence: jest.fn().mockReturnValue("Test bio"),
    },
  },
}));

// Importar el módulo - la inicialización se ejecutará
const databaseModule = await import("../../config/database.js");

// Esperar a que serialize termine si hay una promesa
if (serializePromise) {
  await Promise.resolve(serializePromise);
}

// Esperar un poco más para asegurar que termine
await new Promise((resolve) => setTimeout(resolve, 100));

const { all, run } = databaseModule;

describe("database", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("all", () => {
    it("resuelve con filas cuando la consulta es exitosa", async () => {
      const sql = "SELECT * FROM usuario";
      const params = [];
      const mockRows = [
        { id: 1, nombre: "Usuario 1" },
        { id: 2, nombre: "Usuario 2" },
      ];

      mocks.dbAll.mockImplementation((sql, params, callback) => {
        callback(null, mockRows);
      });

      const result = await all(sql, params);

      expect(mocks.dbAll).toHaveBeenCalledWith(
        sql,
        params,
        expect.any(Function)
      );
      expect(result).toEqual(mockRows);
    });

    it("rechaza con error cuando la consulta falla", async () => {
      const sql = "SELECT * FROM usuario";
      const params = [];
      const error = new Error("Database error");

      mocks.dbAll.mockImplementation((sql, params, callback) => {
        callback(error);
      });

      await expect(all(sql, params)).rejects.toThrow("Database error");
    });

    it("usa array vacío como params por defecto", async () => {
      const sql = "SELECT * FROM usuario";
      const mockRows = [];

      mocks.dbAll.mockImplementation((sql, params, callback) => {
        callback(null, mockRows);
      });

      await all(sql);

      expect(mocks.dbAll).toHaveBeenCalledWith(sql, [], expect.any(Function));
    });
  });

  describe("run", () => {
    it("resuelve con id y changes cuando la consulta es exitosa", async () => {
      const sql = "INSERT INTO usuario (nombre) VALUES (?)";
      const params = ["Test User"];
      const mockContext = {
        lastID: 1,
        changes: 1,
      };

      mocks.dbRun.mockImplementation(function (sql, params, callback) {
        this.lastID = mockContext.lastID;
        this.changes = mockContext.changes;
        callback.call(this, null);
        return this;
      });

      const result = await run(sql, params);

      expect(mocks.dbRun).toHaveBeenCalledWith(
        sql,
        params,
        expect.any(Function)
      );
      expect(result).toEqual({
        id: mockContext.lastID,
        changes: mockContext.changes,
      });
    });

    it("rechaza con error cuando la consulta falla", async () => {
      const sql = "INSERT INTO usuario (nombre) VALUES (?)";
      const params = ["Test User"];
      const error = new Error("Database error");

      mocks.dbRun.mockImplementation((sql, params, callback) => {
        callback(error);
      });

      await expect(run(sql, params)).rejects.toThrow("Database error");
    });

    it("usa array vacío como params por defecto", async () => {
      const sql = "DELETE FROM usuario";
      const mockContext = {
        lastID: 0,
        changes: 5,
      };

      mocks.dbRun.mockImplementation(function (sql, params, callback) {
        this.lastID = mockContext.lastID;
        this.changes = mockContext.changes;
        callback.call(this, null);
        return this;
      });

      const result = await run(sql);

      expect(mocks.dbRun).toHaveBeenCalledWith(sql, [], expect.any(Function));
      expect(result).toEqual({
        id: mockContext.lastID,
        changes: mockContext.changes,
      });
    });

    it("retorna id undefined cuando no hay lastID", async () => {
      const sql = "UPDATE usuario SET nombre = ? WHERE id = ?";
      const params = ["New Name", 1];
      const mockContext = {
        lastID: undefined,
        changes: 1,
      };

      mocks.dbRun.mockImplementation(function (sql, params, callback) {
        this.lastID = mockContext.lastID;
        this.changes = mockContext.changes;
        callback.call(this, null);
        return this;
      });

      const result = await run(sql, params);

      expect(result).toEqual({
        id: undefined,
        changes: mockContext.changes,
      });
    });
  });
});
