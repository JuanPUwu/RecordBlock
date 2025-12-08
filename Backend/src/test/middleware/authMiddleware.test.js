import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";

const mocks = {
  isBlacklisted: jest.fn(),
  jwtVerify: jest.fn(),
  isSessionActive: jest.fn(),
};

jest.unstable_mockModule("../../config/blacklist.js", () => ({
  isBlacklisted: mocks.isBlacklisted,
}));

jest.unstable_mockModule("../../utils/authHelper.js", () => ({
  isSessionActive: mocks.isSessionActive,
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    verify: mocks.jwtVerify,
  },
}));

const { verificarToken, verificarAdmin } = await import(
  "../../middleware/authMiddleware.js"
);

const mockReqResNext = () => {
  const req = {
    headers: {},
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
};

describe("authMiddleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("verificarToken", () => {
    it("retorna 401 si no hay header authorization", async () => {
      const { req, res, next } = mockReqResNext();

      await verificarToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Token requerido" });
      expect(next).not.toHaveBeenCalled();
    });

    it("retorna 401 si el header no tiene formato Bearer", async () => {
      const { req, res, next } = mockReqResNext();
      req.headers.authorization = "InvalidFormat";

      await verificarToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Token requerido" });
      expect(next).not.toHaveBeenCalled();
    });

    it("retorna 401 si el token está vacío después de Bearer", async () => {
      const { req, res, next } = mockReqResNext();
      req.headers.authorization = "Bearer ";

      await verificarToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Token requerido" });
      expect(next).not.toHaveBeenCalled();
    });

    it("retorna 403 si el token está en blacklist", async () => {
      const { req, res, next } = mockReqResNext();
      req.headers.authorization = "Bearer blacklisted-token";

      mocks.isBlacklisted.mockResolvedValue(true);

      await verificarToken(req, res, next);

      expect(mocks.isBlacklisted).toHaveBeenCalledWith("blacklisted-token");
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Token inválido (blacklist)",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("permite acceso si el token es válido sin sessionId", async () => {
      const { req, res, next } = mockReqResNext();
      req.headers.authorization = "Bearer valid-token";

      const decodedToken = { id: 1, isAdmin: 0 };

      mocks.isBlacklisted.mockResolvedValue(false);
      mocks.jwtVerify.mockReturnValue(decodedToken);

      await verificarToken(req, res, next);

      expect(mocks.isBlacklisted).toHaveBeenCalledWith("valid-token");
      expect(mocks.jwtVerify).toHaveBeenCalledWith(
        "valid-token",
        process.env.JWT_ACCESS_SECRET
      );
      expect(mocks.isSessionActive).not.toHaveBeenCalled(); // No tiene sessionId
      expect(req.usuario).toEqual(decodedToken);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("permite acceso si el token es válido y la sesión está activa", async () => {
      const { req, res, next } = mockReqResNext();
      req.headers.authorization = "Bearer valid-token";

      const decodedToken = { id: 1, isAdmin: 0, sessionId: 1 };

      mocks.isBlacklisted.mockResolvedValue(false);
      mocks.jwtVerify.mockReturnValue(decodedToken);
      mocks.isSessionActive.mockResolvedValue(true);

      await verificarToken(req, res, next);

      expect(mocks.isBlacklisted).toHaveBeenCalledWith("valid-token");
      expect(mocks.jwtVerify).toHaveBeenCalledWith(
        "valid-token",
        process.env.JWT_ACCESS_SECRET
      );
      expect(mocks.isSessionActive).toHaveBeenCalledWith(1);
      expect(req.usuario).toEqual(decodedToken);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("retorna 403 si el token tiene sessionId pero la sesión no está activa", async () => {
      const { req, res, next } = mockReqResNext();
      req.headers.authorization = "Bearer valid-token";

      const decodedToken = { id: 1, isAdmin: 0, sessionId: 1 };

      mocks.isBlacklisted.mockResolvedValue(false);
      mocks.jwtVerify.mockReturnValue(decodedToken);
      mocks.isSessionActive.mockResolvedValue(false); // Sesión cerrada

      await verificarToken(req, res, next);

      expect(mocks.isBlacklisted).toHaveBeenCalledWith("valid-token");
      expect(mocks.jwtVerify).toHaveBeenCalledWith(
        "valid-token",
        process.env.JWT_ACCESS_SECRET
      );
      expect(mocks.isSessionActive).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Token inválido (sesión cerrada)",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("retorna 401 si el token expiró", async () => {
      const { req, res, next } = mockReqResNext();
      req.headers.authorization = "Bearer expired-token";

      const expiredError = new Error("Token expired");
      expiredError.name = "TokenExpiredError";

      mocks.isBlacklisted.mockResolvedValue(false);
      mocks.jwtVerify.mockImplementation(() => {
        throw expiredError;
      });

      await verificarToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Token expirado" });
      expect(next).not.toHaveBeenCalled();
    });

    it("retorna 403 si el token es inválido o manipulado", async () => {
      const { req, res, next } = mockReqResNext();
      req.headers.authorization = "Bearer invalid-token";

      const invalidError = new Error("Invalid token");
      invalidError.name = "JsonWebTokenError";

      mocks.isBlacklisted.mockResolvedValue(false);
      mocks.jwtVerify.mockImplementation(() => {
        throw invalidError;
      });

      await verificarToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Token inválido" });
      expect(next).not.toHaveBeenCalled();
    });

    it("retorna 403 para otros tipos de errores", async () => {
      const { req, res, next } = mockReqResNext();
      req.headers.authorization = "Bearer token";

      const otherError = new Error("Other error");

      mocks.isBlacklisted.mockResolvedValue(false);
      mocks.jwtVerify.mockImplementation(() => {
        throw otherError;
      });

      await verificarToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Token inválido" });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("verificarAdmin", () => {
    it("permite acceso si el usuario es admin", () => {
      const { req, res, next } = mockReqResNext();
      req.usuario = { id: 1, isAdmin: 1 };

      verificarAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("retorna 403 si el usuario no es admin", () => {
      const { req, res, next } = mockReqResNext();
      req.usuario = { id: 1, isAdmin: 0 };

      verificarAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error:
          "Acceso denegado, solo los administradores pueden realizar esta acción",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("retorna 403 si req.usuario no existe", () => {
      const { req, res, next } = mockReqResNext();
      req.usuario = undefined;

      verificarAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error:
          "Acceso denegado, solo los administradores pueden realizar esta acción",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("retorna 403 si req.usuario.isAdmin es falsy (0, null, undefined)", () => {
      const testCases = [
        { isAdmin: 0 },
        { isAdmin: null },
        { isAdmin: undefined },
        { isAdmin: false },
      ];

      testCases.forEach((usuario) => {
        const { req, res, next } = mockReqResNext();
        req.usuario = usuario;

        verificarAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
          error:
            "Acceso denegado, solo los administradores pueden realizar esta acción",
        });
        expect(next).not.toHaveBeenCalled();
      });
    });
  });
});
