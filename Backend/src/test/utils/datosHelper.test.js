import { jest } from "@jest/globals";

const mocks = {
  getAsync: jest.fn(),
};

jest.unstable_mockModule("../../utils/dbHelper.js", () => ({
  getAsync: mocks.getAsync,
}));

const {
  normalizar,
  obtenerCamposMinimos,
  obtenerUsuarioDestino,
  validarRegistro,
} = await import("../../utils/datosHelper.js");

describe("datosHelper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("normalizar", () => {
    it("convierte texto a minúsculas", () => {
      expect(normalizar("HOSTNAME")).toBe("hostname");
      expect(normalizar("HostName")).toBe("hostname");
    });

    it("elimina acentos y diacríticos", () => {
      expect(normalizar("José")).toBe("jose");
      expect(normalizar("María")).toBe("maria");
      expect(normalizar("Niño")).toBe("nino");
    });

    it("normaliza espacios y caracteres especiales", () => {
      expect(normalizar("Host Name")).toBe("host name");
      expect(normalizar("HOST-NAME")).toBe("host-name");
    });

    it("maneja strings vacíos", () => {
      expect(normalizar("")).toBe("");
    });
  });

  describe("obtenerCamposMinimos", () => {
    it("retorna campos mínimos normalizados", async () => {
      const mockData = {
        datos: JSON.stringify(["HOSTNAME", "IP", "Sistema Operativo"]),
      };

      mocks.getAsync.mockResolvedValue(mockData);

      const result = await obtenerCamposMinimos();

      expect(mocks.getAsync).toHaveBeenCalledWith(
        "SELECT datos FROM datos_minimos LIMIT 1"
      );
      expect(result).toEqual(["hostname", "ip", "sistema operativo"]);
    });

    it("maneja null retornando array vacío", async () => {
      mocks.getAsync.mockResolvedValue(null);

      // El código intenta acceder a fila.datos cuando fila es null
      // Esto causará un TypeError que es capturado por el catch y retorna []
      const result = await obtenerCamposMinimos();
      
      expect(result).toEqual([]);
    });

    it("maneja JSON inválido retornando array vacío", async () => {
      const mockData = { datos: "invalid-json" };

      mocks.getAsync.mockResolvedValue(mockData);

      // JSON.parse fallará y se capturará en el catch, retornando []
      const result = await obtenerCamposMinimos();
      expect(result).toEqual([]);
    });

    it("maneja datos null o undefined", async () => {
      const mockData = { datos: null };

      mocks.getAsync.mockResolvedValue(mockData);

      const result = await obtenerCamposMinimos();

      expect(result).toEqual([]);
    });
  });

  describe("obtenerUsuarioDestino", () => {
    it("retorna usuario_id del cliente si no es admin", async () => {
      const req = {
        usuario: { id: 1, isAdmin: 0 },
        body: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const result = await obtenerUsuarioDestino(req, res);

      expect(result).toEqual({ usuario_id: 1 });
      expect(mocks.getAsync).not.toHaveBeenCalled();
    });

    it("retorna usuario_id del body si es admin y usuario existe", async () => {
      const req = {
        usuario: { id: 1, isAdmin: 1 },
        body: { usuario_id: 2 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      mocks.getAsync.mockResolvedValue({ isAdmin: 0 });

      const result = await obtenerUsuarioDestino(req, res);

      expect(mocks.getAsync).toHaveBeenCalledWith(
        "SELECT isAdmin FROM usuario WHERE id = ?",
        [2]
      );
      expect(result).toEqual({ usuario_id: 2 });
    });

    it("retorna 404 si admin intenta usar usuario que no existe", async () => {
      const req = {
        usuario: { id: 1, isAdmin: 1 },
        body: { usuario_id: 999 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      mocks.getAsync.mockResolvedValue(null);

      const result = await obtenerUsuarioDestino(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "El usuario destino no existe",
      });
      expect(result).toBeUndefined();
    });

    it("retorna 400 si admin intenta usar otro admin", async () => {
      const req = {
        usuario: { id: 1, isAdmin: 1 },
        body: { usuario_id: 2 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      mocks.getAsync.mockResolvedValue({ isAdmin: 1 });

      const result = await obtenerUsuarioDestino(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "El usuario administrador no puede recibir información",
      });
      expect(result).toBeUndefined();
    });
  });

  describe("validarRegistro", () => {
    it("retorna array vacío si todos los campos mínimos están presentes y tienen valor", () => {
      const registro = {
        hostname: "server1",
        ip: "192.168.1.1",
      };
      const camposMinimos = ["hostname", "ip"];

      const result = validarRegistro(registro, camposMinimos);

      expect(result).toEqual([]);
    });

    it("retorna campos faltantes si no están en el registro", () => {
      const registro = {
        hostname: "server1",
      };
      const camposMinimos = ["hostname", "ip"];

      const result = validarRegistro(registro, camposMinimos);

      expect(result).toEqual(["ip"]);
    });

    it("retorna campos que están vacíos (null)", () => {
      const registro = {
        hostname: "server1",
        ip: null,
      };
      const camposMinimos = ["hostname", "ip"];

      const result = validarRegistro(registro, camposMinimos);

      expect(result).toEqual(["ip"]);
    });

    it("retorna campos que están vacíos (undefined)", () => {
      const registro = {
        hostname: "server1",
        ip: undefined,
      };
      const camposMinimos = ["hostname", "ip"];

      const result = validarRegistro(registro, camposMinimos);

      expect(result).toEqual(["ip"]);
    });

    it("retorna campos que son strings vacíos", () => {
      const registro = {
        hostname: "server1",
        ip: "",
      };
      const camposMinimos = ["hostname", "ip"];

      const result = validarRegistro(registro, camposMinimos);

      expect(result).toEqual(["ip"]);
    });

    it("retorna campos que son strings con solo espacios", () => {
      const registro = {
        hostname: "server1",
        ip: "   ",
      };
      const camposMinimos = ["hostname", "ip"];

      const result = validarRegistro(registro, camposMinimos);

      expect(result).toEqual(["ip"]);
    });

    it("maneja normalización de claves correctamente", () => {
      const registro = {
        HOSTNAME: "server1",
        IP: "192.168.1.1",
      };
      const camposMinimos = ["hostname", "ip"];

      const result = validarRegistro(registro, camposMinimos);

      expect(result).toEqual([]);
    });
  });
});
