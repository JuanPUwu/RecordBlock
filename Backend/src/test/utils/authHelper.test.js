import { jest } from "@jest/globals";

const authMocks = {
  all: jest.fn(),
  run: jest.fn(),
  cookie: jest.fn(),
  clearCookie: jest.fn(),
};

jest.unstable_mockModule("../../config/database.js", () => ({
  all: authMocks.all,
  run: authMocks.run,
}));

const {
  findUserByEmail,
  getUserByRefreshToken,
  createUserSession,
  updateSessionLastUsed,
  clearRefreshTokenByValue,
  getUserSessions,
  deleteSessionById,
  clearAllUserSessions,
  isSessionActive,
  getDeviceInfo,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = await import("../../utils/authHelper.js");

describe("authHelper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findUserByEmail", () => {
    it("retorna usuario si existe", async () => {
      const email = "test@example.com";
      const mockUser = { id: 1, email, nombre: "Test User" };

      authMocks.all.mockResolvedValue([mockUser]);

      const result = await findUserByEmail(email);

      expect(authMocks.all).toHaveBeenCalledWith(
        "SELECT * FROM usuario WHERE LOWER(email) = LOWER(?)",
        [email]
      );
      expect(result).toEqual(mockUser);
    });

    it("retorna null si el usuario no existe", async () => {
      const email = "notfound@example.com";

      authMocks.all.mockResolvedValue([]);

      const result = await findUserByEmail(email);

      expect(result).toBeNull();
    });
  });

  describe("getUserByRefreshToken", () => {
    it("retorna usuario si el token existe y no está expirado", async () => {
      const token = "refresh-token-123";
      const mockUser = { 
        id: 1, 
        email: "test@example.com",
        nombre: "Test User",
        isAdmin: 0,
        session_id: 1,
        session_expires_at: new Date(Date.now() + 10000).toISOString()
      };

      authMocks.all.mockResolvedValue([mockUser]);

      const result = await getUserByRefreshToken(token);

      expect(authMocks.all).toHaveBeenCalledWith(
        expect.stringContaining("INNER JOIN user_sessions"),
        [token]
      );
      expect(result).toEqual(mockUser);
    });

    it("retorna null si el token no existe o está expirado", async () => {
      const token = "invalid-token";

      authMocks.all.mockResolvedValue([]);

      const result = await getUserByRefreshToken(token);

      expect(result).toBeNull();
    });
  });

  describe("createUserSession", () => {
    it("crea una nueva sesión para un usuario y retorna el ID", async () => {
      const userId = 1;
      const token = "new-refresh-token";
      const deviceInfo = "Windows";
      const ipAddress = "192.168.1.1";
      const userAgent = "Mozilla/5.0";

      authMocks.run.mockResolvedValue({ id: 1, changes: 1 });

      const sessionId = await createUserSession(userId, token, deviceInfo, ipAddress, userAgent);

      expect(authMocks.run).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO user_sessions"),
        expect.arrayContaining([userId, token, deviceInfo, ipAddress, userAgent])
      );
      expect(sessionId).toBe(1);
    });
  });

  describe("updateSessionLastUsed", () => {
    it("actualiza la fecha de último uso de una sesión", async () => {
      const token = "refresh-token-123";

      authMocks.run.mockResolvedValue();

      await updateSessionLastUsed(token);

      expect(authMocks.run).toHaveBeenCalledWith(
        "UPDATE user_sessions SET last_used_at = CURRENT_TIMESTAMP WHERE refresh_token = ?",
        [token]
      );
    });
  });

  describe("clearRefreshTokenByValue", () => {
    it("elimina sesión por refresh token", async () => {
      const token = "token-to-clear";

      authMocks.run.mockResolvedValue();

      await clearRefreshTokenByValue(token);

      expect(authMocks.run).toHaveBeenCalledWith(
        "DELETE FROM user_sessions WHERE refresh_token = ?",
        [token]
      );
    });
  });

  describe("getUserSessions", () => {
    it("retorna todas las sesiones activas de un usuario", async () => {
      const userId = 1;
      const mockSessions = [
        { id: 1, device_info: "Windows", ip_address: "192.168.1.1" },
        { id: 2, device_info: "Mobile Device", ip_address: "192.168.1.2" },
      ];

      authMocks.all.mockResolvedValue(mockSessions);

      const result = await getUserSessions(userId);

      expect(authMocks.all).toHaveBeenCalledWith(
        expect.stringContaining("SELECT id, device_info"),
        [userId]
      );
      expect(result).toEqual(mockSessions);
    });
  });

  describe("deleteSessionById", () => {
    it("elimina una sesión específica por ID", async () => {
      const sessionId = 1;
      const userId = 1;

      authMocks.run.mockResolvedValue({ changes: 1 });

      const result = await deleteSessionById(sessionId, userId);

      expect(authMocks.run).toHaveBeenCalledWith(
        "DELETE FROM user_sessions WHERE id = ? AND user_id = ?",
        [sessionId, userId]
      );
      expect(result).toBe(true);
    });

    it("retorna false si la sesión no existe", async () => {
      const sessionId = 999;
      const userId = 1;

      authMocks.run.mockResolvedValue({ changes: 0 });

      const result = await deleteSessionById(sessionId, userId);

      expect(result).toBe(false);
    });
  });

  describe("clearAllUserSessions", () => {
    it("elimina todas las sesiones de un usuario", async () => {
      const userId = 1;

      authMocks.run.mockResolvedValue();

      await clearAllUserSessions(userId);

      expect(authMocks.run).toHaveBeenCalledWith(
        "DELETE FROM user_sessions WHERE user_id = ?",
        [userId]
      );
    });
  });

  describe("isSessionActive", () => {
    it("retorna true si la sesión existe y está activa", async () => {
      const sessionId = 1;

      authMocks.all.mockResolvedValue([{ id: 1 }]);

      const result = await isSessionActive(sessionId);

      expect(authMocks.all).toHaveBeenCalledWith(
        expect.stringContaining("SELECT id FROM user_sessions"),
        [sessionId]
      );
      expect(result).toBe(true);
    });

    it("retorna false si la sesión no existe o está expirada", async () => {
      const sessionId = 999;

      authMocks.all.mockResolvedValue([]);

      const result = await isSessionActive(sessionId);

      expect(result).toBe(false);
    });
  });

  describe("getDeviceInfo", () => {
    it("extrae información del dispositivo desde el request", () => {
      const req = {
        headers: {
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
        ip: "192.168.1.1",
      };

      const result = getDeviceInfo(req);

      expect(result).toHaveProperty("deviceInfo");
      expect(result).toHaveProperty("ipAddress");
      expect(result).toHaveProperty("userAgent");
      expect(result.deviceInfo).toBe("Windows");
      expect(result.ipAddress).toBe("192.168.1.1");
    });

    it("detecta dispositivo móvil", () => {
      const req = {
        headers: {
          "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
        },
        ip: "192.168.1.1",
      };

      const result = getDeviceInfo(req);

      expect(result.deviceInfo).toBe("Mobile Device");
    });

    it("usa valores por defecto si no hay información disponible", () => {
      const req = {
        headers: {},
      };

      const result = getDeviceInfo(req);

      expect(result.deviceInfo).toBe("Unknown Device");
      expect(result.ipAddress).toBe("Unknown");
    });
  });

  describe("setRefreshTokenCookie", () => {
    it("establece cookie de refresh token", () => {
      const res = {
        cookie: authMocks.cookie,
      };
      const token = "refresh-token";

      setRefreshTokenCookie(res, token);

      expect(authMocks.cookie).toHaveBeenCalledWith(
        "refreshToken",
        token,
        expect.objectContaining({
          maxAge: expect.any(Number),
        })
      );
    });
  });

  describe("clearRefreshTokenCookie", () => {
    it("limpia cookie de refresh token", () => {
      const res = {
        clearCookie: authMocks.clearCookie,
      };

      clearRefreshTokenCookie(res);

      expect(authMocks.clearCookie).toHaveBeenCalledWith(
        "refreshToken",
        expect.any(Object)
      );
    });
  });
});

