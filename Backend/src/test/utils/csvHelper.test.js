import { jest } from "@jest/globals";

const mocks = {
  unlinkSync: jest.fn(),
  runAsync: jest.fn(),
  getAsync: jest.fn(),
  normalizar: jest.fn(),
  validarRegistro: jest.fn(),
};

jest.unstable_mockModule("node:fs", () => ({
  unlinkSync: mocks.unlinkSync,
}));

jest.unstable_mockModule("../../utils/dbHelper.js", () => ({
  runAsync: mocks.runAsync,
  getAsync: mocks.getAsync,
}));

jest.unstable_mockModule("../../utils/datosHelper.js", () => ({
  normalizar: mocks.normalizar,
  validarRegistro: mocks.validarRegistro,
}));

const {
  limpiarArchivo,
  contieneEmojis,
  validarArchivoCSV,
  determinarUsuarioDestinoCSV,
  procesarFilaCSV,
  insertarRegistros,
  procesarCSVCompletado,
} = await import("../../utils/csvHelper.js");

describe("csvHelper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mocks.normalizar.mockImplementation((texto) => {
      if (typeof texto !== "string") {
        return "";
      }
      return texto.toLowerCase().trim();
    });
  });

  describe("limpiarArchivo", () => {
    it("elimina archivo exitosamente", () => {
      const filePath = "/tmp/test.csv";

      limpiarArchivo(filePath);

      expect(mocks.unlinkSync).toHaveBeenCalledWith(filePath);
    });

    it("no hace nada si filePath es undefined", () => {
      limpiarArchivo(undefined);

      expect(mocks.unlinkSync).not.toHaveBeenCalled();
    });

    it("no hace nada si filePath es null", () => {
      limpiarArchivo(null);

      expect(mocks.unlinkSync).not.toHaveBeenCalled();
    });

    it("maneja errores silenciosamente", () => {
      const filePath = "/tmp/test.csv";
      const error = new Error("File not found");

      mocks.unlinkSync.mockImplementation(() => {
        throw error;
      });

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // No debería lanzar error, solo loguearlo
      expect(() => limpiarArchivo(filePath)).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error al eliminar archivo:",
        error
      );

      consoleSpy.mockRestore();
    });
  });

  describe("contieneEmojis", () => {
    it("retorna false para texto sin emojis", () => {
      expect(contieneEmojis("hostname")).toBe(false);
      expect(contieneEmojis("192.168.1.1")).toBe(false);
      expect(contieneEmojis("Test Server")).toBe(false);
    });

    it("retorna true para texto con emojis", () => {
      expect(contieneEmojis("server 😀")).toBe(true);
      expect(contieneEmojis("🚀 rocket")).toBe(true);
      expect(contieneEmojis("test ✅")).toBe(true);
    });

    it("retorna false para null o undefined", () => {
      expect(contieneEmojis(null)).toBe(false);
      expect(contieneEmojis(undefined)).toBe(false);
    });

    it("retorna false para no-string", () => {
      expect(contieneEmojis(123)).toBe(false);
      expect(contieneEmojis({})).toBe(false);
    });

    it("detecta diferentes tipos de emojis", () => {
      expect(contieneEmojis("😀")).toBe(true); // Emoticones
      expect(contieneEmojis("🚀")).toBe(true); // Transporte
      expect(contieneEmojis("🏳️")).toBe(true); // Banderas
      expect(contieneEmojis("⚡")).toBe(true); // Símbolos varios
    });
  });

  describe("validarArchivoCSV", () => {
    it("retorna válido para archivo CSV correcto", () => {
      const file = {
        originalname: "test.csv",
        path: "/tmp/test.csv",
      };

      const result = validarArchivoCSV(file);

      expect(result).toEqual({ valido: true });
    });

    it("retorna inválido si no hay archivo", () => {
      const result = validarArchivoCSV(null);

      expect(result).toEqual({
        valido: false,
        mensaje: expect.stringContaining(
          "No se proporcionó ningún archivo CSV"
        ),
      });
    });

    it("retorna inválido si no es archivo CSV", () => {
      const file = {
        originalname: "test.txt",
        path: "/tmp/test.txt",
      };

      const result = validarArchivoCSV(file);

      expect(result).toEqual({
        valido: false,
        mensaje: expect.stringContaining("El archivo debe ser un CSV"),
      });
      expect(mocks.unlinkSync).toHaveBeenCalledWith("/tmp/test.txt");
    });

    it("acepta archivos CSV en mayúsculas", () => {
      const file = {
        originalname: "TEST.CSV",
        path: "/tmp/test.csv",
      };

      const result = validarArchivoCSV(file);

      expect(result).toEqual({ valido: true });
    });
  });

  describe("determinarUsuarioDestinoCSV", () => {
    it("retorna usuario_id del cliente si no es admin", async () => {
      const req = {
        usuario: { id: 1, isAdmin: 0 },
        body: {},
        file: { path: "/tmp/test.csv" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const result = await determinarUsuarioDestinoCSV(req, res);

      expect(result).toEqual({ usuario_id: 1 });
      expect(mocks.getAsync).not.toHaveBeenCalled();
    });

    it("retorna usuario_id del body si es admin y usuario existe", async () => {
      const req = {
        usuario: { id: 1, isAdmin: 1 },
        body: { usuario_id: 2 },
        file: { path: "/tmp/test.csv" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      mocks.getAsync.mockResolvedValue({ isAdmin: 0 });

      const result = await determinarUsuarioDestinoCSV(req, res);

      expect(mocks.getAsync).toHaveBeenCalledWith(
        "SELECT isAdmin FROM usuario WHERE id = ?",
        [2]
      );
      expect(result).toEqual({ usuario_id: 2 });
    });

    it("retorna 400 si admin no envía usuario_id", async () => {
      const req = {
        usuario: { id: 1, isAdmin: 1 },
        body: {},
        file: { path: "/tmp/test.csv" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const result = await determinarUsuarioDestinoCSV(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "El campo 'usuario_id' es obligatorio para administradores",
      });
      expect(mocks.unlinkSync).toHaveBeenCalledWith("/tmp/test.csv");
      expect(result).toBeNull();
    });

    it("retorna 404 si usuario no existe", async () => {
      const req = {
        usuario: { id: 1, isAdmin: 1 },
        body: { usuario_id: 999 },
        file: { path: "/tmp/test.csv" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      mocks.getAsync.mockResolvedValue(null);

      const result = await determinarUsuarioDestinoCSV(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(mocks.unlinkSync).toHaveBeenCalledWith("/tmp/test.csv");
      expect(result).toBeNull();
    });

    it("retorna 400 si usuario es admin", async () => {
      const req = {
        usuario: { id: 1, isAdmin: 1 },
        body: { usuario_id: 2 },
        file: { path: "/tmp/test.csv" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      mocks.getAsync.mockResolvedValue({ isAdmin: 1 });

      const result = await determinarUsuarioDestinoCSV(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mocks.unlinkSync).toHaveBeenCalledWith("/tmp/test.csv");
      expect(result).toBeNull();
    });
  });

  describe("procesarFilaCSV", () => {
    it("procesa fila válida correctamente", () => {
      const row = { hostname: "server1", ip: "192.168.1.1" };
      const numeroFila = 2;
      const camposMinimos = ["hostname", "ip"];
      const registros = [];
      const errores = [];

      mocks.validarRegistro.mockReturnValue([]);

      procesarFilaCSV(row, numeroFila, camposMinimos, registros, errores);

      expect(registros.length).toBe(1);
      expect(errores.length).toBe(0);
    });

    it("agrega error si faltan campos obligatorios", () => {
      const row = { hostname: "server1" };
      const numeroFila = 2;
      const camposMinimos = ["hostname", "ip"];
      const registros = [];
      const errores = [];

      mocks.validarRegistro.mockReturnValue(["ip"]);

      procesarFilaCSV(row, numeroFila, camposMinimos, registros, errores);

      expect(registros.length).toBe(0);
      expect(errores.length).toBe(1);
      expect(errores[0].error).toContain("Faltan campos obligatorios");
    });

    it("agrega error si hay emojis en claves", () => {
      const row = { "hostname😀": "server1", ip: "192.168.1.1" };
      const numeroFila = 2;
      const camposMinimos = ["hostname", "ip"];
      const registros = [];
      const errores = [];

      procesarFilaCSV(row, numeroFila, camposMinimos, registros, errores);

      expect(errores.length).toBe(1);
      expect(errores[0].error).toContain("No se permiten emojis");
    });

    it("agrega error si la fila está vacía", () => {
      const row = {};
      const numeroFila = 2;
      const camposMinimos = ["hostname"];
      const registros = [];
      const errores = [];

      procesarFilaCSV(row, numeroFila, camposMinimos, registros, errores);

      expect(errores.length).toBe(1);
      expect(errores[0].error).toBe("Fila vacía");
    });

    it("maneja errores durante el procesamiento", () => {
      const row = { hostname: "server1" };
      const numeroFila = 2;
      const camposMinimos = ["hostname"];
      const registros = [];
      const errores = [];

      mocks.normalizar.mockImplementation(() => {
        throw new Error("Normalization error");
      });

      procesarFilaCSV(row, numeroFila, camposMinimos, registros, errores);

      expect(errores.length).toBe(1);
      expect(errores[0].error).toContain("Error al procesar fila");
    });
  });

  describe("insertarRegistros", () => {
    it("inserta múltiples registros correctamente", async () => {
      const registros = [
        { hostname: "server1", ip: "192.168.1.1" },
        { hostname: "server2", ip: "192.168.1.2" },
      ];
      const destino = { usuario_id: 1 };
      const datosMinimosIniciales = JSON.stringify(["hostname", "ip"]);

      mocks.runAsync.mockResolvedValue();

      await insertarRegistros(registros, destino, datosMinimosIniciales);

      expect(mocks.runAsync).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO informacion_usuario"),
        expect.arrayContaining([
          1,
          expect.any(String),
          datosMinimosIniciales,
          1,
          expect.any(String),
          datosMinimosIniciales,
        ])
      );
    });

    it("no hace nada si no hay registros", async () => {
      const registros = [];
      const destino = { usuario_id: 1 };
      const datosMinimosIniciales = JSON.stringify([]);

      await insertarRegistros(registros, destino, datosMinimosIniciales);

      expect(mocks.runAsync).not.toHaveBeenCalled();
    });
  });

  describe("procesarCSVCompletado", () => {
    it("retorna error si hay errores y no hay registros", async () => {
      const registros = [];
      const errores = [{ fila: 2, error: "Error en fila" }];
      const destino = { usuario_id: 1 };
      const filePath = "/tmp/test.csv";
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const promiseCallbacks = {
        resolve: jest.fn(),
        reject: jest.fn(),
      };
      const datosMinimosIniciales = JSON.stringify([]);

      await procesarCSVCompletado(
        registros,
        errores,
        destino,
        filePath,
        res,
        promiseCallbacks,
        datosMinimosIniciales
      );

      expect(mocks.unlinkSync).toHaveBeenCalledWith(filePath);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(promiseCallbacks.resolve).toHaveBeenCalled();
    });

    it("inserta registros y retorna éxito", async () => {
      const registros = [{ hostname: "server1", ip: "192.168.1.1" }];
      const errores = [];
      const destino = { usuario_id: 1 };
      const filePath = "/tmp/test.csv";
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const promiseCallbacks = {
        resolve: jest.fn(),
        reject: jest.fn(),
      };
      const datosMinimosIniciales = JSON.stringify([]);

      mocks.runAsync.mockResolvedValue();

      await procesarCSVCompletado(
        registros,
        errores,
        destino,
        filePath,
        res,
        promiseCallbacks,
        datosMinimosIniciales
      );

      expect(mocks.unlinkSync).toHaveBeenCalledWith(filePath);
      expect(mocks.runAsync).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(promiseCallbacks.resolve).toHaveBeenCalled();
    });

    it("maneja errores al insertar", async () => {
      const registros = [{ hostname: "server1", ip: "192.168.1.1" }];
      const errores = [];
      const destino = { usuario_id: 1 };
      const filePath = "/tmp/test.csv";
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const promiseCallbacks = {
        resolve: jest.fn(),
        reject: jest.fn(),
      };
      const datosMinimosIniciales = JSON.stringify([]);

      const error = new Error("Database error");
      mocks.runAsync.mockRejectedValue(error);

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await procesarCSVCompletado(
        registros,
        errores,
        destino,
        filePath,
        res,
        promiseCallbacks,
        datosMinimosIniciales
      );

      expect(consoleSpy).toHaveBeenCalledWith(error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(promiseCallbacks.reject).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("validarArchivoCSV - Edge Cases", () => {
    it("rechaza cuando el archivo no existe", () => {
      const file = null;

      const result = validarArchivoCSV(file);

      expect(result.valido).toBe(false);
      expect(result.mensaje).toBeDefined();
    });

    it("rechaza cuando el mimetype no es CSV", () => {
      const file = {
        fieldname: "archivo",
        originalname: "document.txt",
        mimetype: "text/plain",
        size: 1024,
      };

      const result = validarArchivoCSV(file);

      expect(result.valido).toBe(false);
      expect(result.mensaje).toContain("CSV");
    });

    it("rechaza cuando el nombre no termina en .csv", () => {
      const file = {
        fieldname: "archivo",
        originalname: "data.txt",
        mimetype: "text/csv",
        size: 1024,
      };

      const result = validarArchivoCSV(file);

      expect(result.valido).toBe(false);
      expect(result.mensaje).toContain("CSV");
    });

    it("acepta archivo CSV válido", () => {
      const file = {
        fieldname: "archivo",
        originalname: "data.csv",
        mimetype: "text/csv",
        size: 1024,
      };

      const result = validarArchivoCSV(file);

      expect(result.valido).toBe(true);
    });
  });

  describe("contieneEmojis - Edge Cases", () => {
    it("detecta emojis comunes", () => {
      expect(contieneEmojis("Hello 😀")).toBe(true);
      expect(contieneEmojis("Test 🎉")).toBe(true);
    });

    it("no detecta emojis en texto normal", () => {
      expect(contieneEmojis("Hello World")).toBe(false);
      expect(contieneEmojis("Test123")).toBe(false);
    });

    it("retorna false para null/undefined", () => {
      expect(contieneEmojis(null)).toBe(false);
      expect(contieneEmojis(undefined)).toBe(false);
    });

    it("retorna false para no-string", () => {
      expect(contieneEmojis(123)).toBe(false);
      expect(contieneEmojis({})).toBe(false);
    });

    it("detecta banderas (emojis de rango alto)", () => {
      expect(contieneEmojis("Country 🇨🇴")).toBe(true);
    });

    it("detecta símbolos especiales", () => {
      expect(contieneEmojis("Symbol ☀️")).toBe(true);
    });
  });

  describe("procesarFilaCSV - Validación de emojis", () => {
    it("rechaza fila con emojis en campos", () => {
      const row = { hostname: "server 😀", ip: "192.168.1.1" };
      const registros = [];
      const errores = [];
      const camposMinimos = ["hostname", "ip"];

      procesarFilaCSV(row, 2, camposMinimos, registros, errores);

      expect(errores).toContainEqual(
        expect.objectContaining({
          fila: 2,
          error: expect.stringContaining("emoji"),
        })
      );
    });

    it("acepta fila sin emojis", () => {
      const row = { hostname: "server1", ip: "192.168.1.1" };
      const registros = [];
      const errores = [];
      const camposMinimos = ["hostname", "ip"];

      mocks.validarRegistro.mockReturnValue([]);

      procesarFilaCSV(row, 2, camposMinimos, registros, errores);

      expect(registros).toContainEqual(row);
      expect(errores.length).toBe(0);
    });
  });
});
