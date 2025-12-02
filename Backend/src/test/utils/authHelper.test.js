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
  saveRefreshToken,
  clearRefreshTokenByValue,
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
    it("retorna usuario si el token existe", async () => {
      const token = "refresh-token-123";
      const mockUser = { id: 1, refresh_token: token };

      authMocks.all.mockResolvedValue([mockUser]);

      const result = await getUserByRefreshToken(token);

      expect(authMocks.all).toHaveBeenCalledWith(
        "SELECT * FROM usuario WHERE refresh_token = ?",
        [token]
      );
      expect(result).toEqual(mockUser);
    });

    it("retorna null si el token no existe", async () => {
      const token = "invalid-token";

      authMocks.all.mockResolvedValue([]);

      const result = await getUserByRefreshToken(token);

      expect(result).toBeNull();
    });
  });

  describe("saveRefreshToken", () => {
    it("guarda refresh token para un usuario", async () => {
      const userId = 1;
      const token = "new-refresh-token";

      authMocks.run.mockResolvedValue();

      await saveRefreshToken(userId, token);

      expect(authMocks.run).toHaveBeenCalledWith(
        "UPDATE usuario SET refresh_token = ? WHERE id = ?",
        [token, userId]
      );
    });
  });

  describe("clearRefreshTokenByValue", () => {
    it("elimina refresh token por valor", async () => {
      const token = "token-to-clear";

      authMocks.run.mockResolvedValue();

      await clearRefreshTokenByValue(token);

      expect(authMocks.run).toHaveBeenCalledWith(
        "UPDATE usuario SET refresh_token = NULL WHERE refresh_token = ?",
        [token]
      );
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

