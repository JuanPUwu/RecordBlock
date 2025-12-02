import { jest } from "@jest/globals";
import validator from "validator";
import crypto from "node:crypto";
import path from "node:path";

const MOCK_USER_ID = 1;
const MOCK_EMAIL = "test@example.com";
const MOCK_NOMBRE = "Test User";
const MOCK_PASSWORD = "TestP@ssw0rd123";
const MOCK_TOKEN = "verification-token-123";
const MOCK_HASHED_PASSWORD = "hashedPassword123";

const mocks = {
  allAsync: jest.fn(),
  getAsync: jest.fn(),
  runAsync: jest.fn(),
  validarYHashearPassword: jest.fn(),
  enviarCorreoVerificacion: jest.fn(),
  enviarCorreoCambioPasswordAdmin: jest.fn(),
  enviarCorreoCambioPasswordPropio: jest.fn(),
  sendFile: jest.fn(),
};

jest.unstable_mockModule("../../utils/dbHelper.js", () => ({
  allAsync: mocks.allAsync,
  getAsync: mocks.getAsync,
  runAsync: mocks.runAsync,
}));

jest.unstable_mockModule("../../utils/hashHelper.js", () => ({
  validarYHashearPassword: mocks.validarYHashearPassword,
}));

jest.unstable_mockModule("../../utils/emailHelper.js", () => ({
  enviarCorreoVerificacion: mocks.enviarCorreoVerificacion,
  enviarCorreoCambioPasswordAdmin: mocks.enviarCorreoCambioPasswordAdmin,
  enviarCorreoCambioPasswordPropio: mocks.enviarCorreoCambioPasswordPropio,
}));

jest.unstable_mockModule("validator", () => ({
  default: {
    isEmail: jest.fn((email) => validator.isEmail(email)),
  },
}));

jest.unstable_mockModule("node:crypto", () => ({
  default: {
    randomBytes: jest.fn(() => ({
      toString: jest.fn(() => MOCK_TOKEN),
    })),
    createHash: jest.fn(() => ({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn(() => "hashed-token"),
    })),
  },
}));

const {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  verificarCorreo,
} = await import("../../controllers/usuarioController.js");

const mockReqRes = (usuario = null) => ({
  req: {
    body: {},
    params: {},
    usuario: usuario || { id: 1, isAdmin: 0 },
  },
  res: {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    sendFile: mocks.sendFile,
  },
});

describe("usuarioController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("obtenerUsuarios", () => {
    it("retorna lista de usuarios exitosamente", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      const mockUsers = [
        { id: 1, nombre: "User1", email: "user1@test.com", isAdmin: 0, verificado: 1 },
        { id: 2, nombre: "User2", email: "user2@test.com", isAdmin: 0, verificado: 0 },
      ];

      mocks.allAsync.mockResolvedValue(mockUsers);

      await obtenerUsuarios(req, res);

      expect(mocks.allAsync).toHaveBeenCalledWith(
        "SELECT id, nombre, email, isAdmin, verificado FROM usuario WHERE isAdmin = 0"
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsers,
      });
    });

    it("maneja errores de base de datos", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      const error = new Error("Database error");

      mocks.allAsync.mockRejectedValue(error);

      await obtenerUsuarios(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: error.message,
      });
    });
  });

  describe("crearUsuario", () => {
    it("crea usuario exitosamente", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = {
        nombre: MOCK_NOMBRE,
        email: MOCK_EMAIL,
        password: MOCK_PASSWORD,
      };

      mocks.getAsync
        .mockResolvedValueOnce(null) // nombre no existe
        .mockResolvedValueOnce(null); // email no existe
      mocks.validarYHashearPassword.mockResolvedValue(MOCK_HASHED_PASSWORD);
      mocks.runAsync
        .mockResolvedValueOnce({ lastID: MOCK_USER_ID }) // INSERT usuario
        .mockResolvedValueOnce({}); // INSERT token
      mocks.enviarCorreoVerificacion.mockResolvedValue();

      await crearUsuario(req, res);

      expect(mocks.getAsync).toHaveBeenCalledTimes(2);
      expect(mocks.validarYHashearPassword).toHaveBeenCalledWith(MOCK_PASSWORD);
      expect(mocks.runAsync).toHaveBeenCalledTimes(2);
      expect(mocks.enviarCorreoVerificacion).toHaveBeenCalledWith(
        MOCK_EMAIL,
        MOCK_TOKEN
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Usuario creado correctamente. Se envió un correo de verificación",
      });
    });

    it("retorna 400 si faltan campos requeridos", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = { nombre: MOCK_NOMBRE };

      await crearUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Nombre, email y password son requeridos",
      });
    });

    it("retorna 400 si el email es inválido", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = {
        nombre: MOCK_NOMBRE,
        email: "invalid-email",
        password: MOCK_PASSWORD,
      };

      jest.spyOn(validator, "isEmail").mockReturnValue(false);

      await crearUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Email inválido",
      });
    });

    it("retorna 400 si el nombre ya existe", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = {
        nombre: MOCK_NOMBRE,
        email: MOCK_EMAIL,
        password: MOCK_PASSWORD,
      };

      // Mock validator.isEmail para que pase la validación de email
      jest.spyOn(validator, "isEmail").mockReturnValue(true);
      
      mocks.getAsync
        .mockResolvedValueOnce({ id: 999 }) // nombre existe
        .mockResolvedValueOnce(null); // email no existe

      await crearUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Este nombre ya está ligado a una cuenta existente",
      });
    });

    it("retorna 400 si el email ya existe", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = {
        nombre: MOCK_NOMBRE,
        email: MOCK_EMAIL,
        password: MOCK_PASSWORD,
      };

      // Mock validator.isEmail para que pase la validación de email
      jest.spyOn(validator, "isEmail").mockReturnValue(true);

      mocks.getAsync
        .mockResolvedValueOnce(null) // nombre no existe
        .mockResolvedValueOnce({ id: 999 }); // email existe

      await crearUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Este correo ya está ligado a una cuenta existente",
      });
    });

    it("retorna 400 si nombre y email ya existen", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = {
        nombre: MOCK_NOMBRE,
        email: MOCK_EMAIL,
        password: MOCK_PASSWORD,
      };

      // Mock validator.isEmail para que pase la validación de email
      jest.spyOn(validator, "isEmail").mockReturnValue(true);

      mocks.getAsync
        .mockResolvedValueOnce({ id: 999 }) // nombre existe
        .mockResolvedValueOnce({ id: 999 }); // email existe

      await crearUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Este nombre ya está ligado a una cuenta existente. Este correo ya está ligado a una cuenta existente",
      });
    });

    it("maneja errores al crear usuario", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.body = {
        nombre: MOCK_NOMBRE,
        email: MOCK_EMAIL,
        password: MOCK_PASSWORD,
      };

      // Mock validator.isEmail para que pase la validación de email
      jest.spyOn(validator, "isEmail").mockReturnValue(true);

      mocks.getAsync
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mocks.validarYHashearPassword.mockRejectedValue(
        new Error("Password validation failed")
      );

      await crearUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Password validation failed",
      });
    });
  });

  describe("actualizarUsuario", () => {
    it("actualiza contraseña exitosamente como admin para otro usuario", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.params.id = "2";
      req.body.password = MOCK_PASSWORD;

      const usuarioObjetivo = {
        email: "target@test.com",
        nombre: "Target User",
        isAdmin: 0,
      };

      mocks.getAsync.mockResolvedValue({ ...usuarioObjetivo });
      mocks.validarYHashearPassword.mockResolvedValue(MOCK_HASHED_PASSWORD);
      mocks.runAsync.mockResolvedValue({ changes: 1 });
      mocks.enviarCorreoCambioPasswordAdmin.mockResolvedValue();

      await actualizarUsuario(req, res);

      expect(mocks.getAsync).toHaveBeenCalledWith(
        "SELECT email, nombre, isAdmin FROM usuario WHERE id = ?",
        [2]
      );
      expect(mocks.validarYHashearPassword).toHaveBeenCalledWith(MOCK_PASSWORD);
      expect(mocks.runAsync).toHaveBeenCalledWith(
        "UPDATE usuario SET password = ? WHERE id = ?",
        [MOCK_HASHED_PASSWORD, 2]
      );
      expect(mocks.enviarCorreoCambioPasswordAdmin).toHaveBeenCalledWith(
        usuarioObjetivo.email,
        usuarioObjetivo.nombre,
        expect.any(String) // fecha
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Contraseña actualizada correctamente",
        usuario: usuarioObjetivo.email,
      });
    });

    it("actualiza contraseña exitosamente como usuario para sí mismo", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 0 });
      req.params.id = "1";
      req.body.password = MOCK_PASSWORD;

      const usuarioObjetivo = {
        email: MOCK_EMAIL,
        nombre: MOCK_NOMBRE,
        isAdmin: 0,
      };

      mocks.getAsync.mockResolvedValue(usuarioObjetivo);
      mocks.validarYHashearPassword.mockResolvedValue(MOCK_HASHED_PASSWORD);
      mocks.runAsync.mockResolvedValue({ changes: 1 });
      mocks.enviarCorreoCambioPasswordPropio.mockResolvedValue();

      await actualizarUsuario(req, res);

      expect(mocks.getAsync).toHaveBeenCalledWith(
        "SELECT email, nombre, isAdmin FROM usuario WHERE id = ?",
        [1]
      );
      expect(mocks.enviarCorreoCambioPasswordPropio).toHaveBeenCalledWith(
        usuarioObjetivo.email,
        usuarioObjetivo.nombre,
        expect.any(String) // fecha
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Contraseña actualizada correctamente",
        usuario: usuarioObjetivo.email,
      });
    });

    it("retorna 404 si el usuario no existe", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.params.id = "999";
      req.body.password = MOCK_PASSWORD;

      mocks.getAsync.mockResolvedValue(null);

      await actualizarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Usuario no encontrado",
      });
    });

    it("retorna 500 si no se pudo actualizar la contraseña", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.params.id = "2";
      req.body.password = MOCK_PASSWORD;

      mocks.getAsync.mockResolvedValue({ email: MOCK_EMAIL, nombre: MOCK_NOMBRE, isAdmin: 0 });
      mocks.validarYHashearPassword.mockResolvedValue(MOCK_HASHED_PASSWORD);
      mocks.runAsync.mockResolvedValue({ changes: 0 });

      await actualizarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "La contraseña no pudo ser actualizada",
      });
    });

    it("maneja errores del servidor", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.params.id = "2";
      req.body.password = MOCK_PASSWORD;

      mocks.getAsync.mockRejectedValue(new Error("Database error"));

      await actualizarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("eliminarUsuario", () => {
    it("elimina usuario exitosamente", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.params.id = "2";

      mocks.runAsync.mockResolvedValue({ changes: 1 });

      await eliminarUsuario(req, res);

      expect(mocks.runAsync).toHaveBeenCalledWith(
        "DELETE FROM usuario WHERE id = ?",
        ["2"]
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Usuario eliminado correctamente",
      });
    });

    it("retorna 404 si el usuario no existe", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.params.id = "999";

      mocks.runAsync.mockResolvedValue({ changes: 0 });

      await eliminarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Usuario no encontrado",
      });
    });

    it("maneja errores del servidor", async () => {
      const { req, res } = mockReqRes({ id: 1, isAdmin: 1 });
      req.params.id = "2";

      mocks.runAsync.mockRejectedValue(new Error("Database error"));

      await eliminarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("verificarCorreo", () => {
    it("verifica correo exitosamente", async () => {
      const { req, res } = mockReqRes();
      req.params.token = MOCK_TOKEN;

      const registro = {
        user_id: MOCK_USER_ID,
        token_hash: "hashed-token",
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      mocks.getAsync.mockResolvedValue(registro);
      mocks.runAsync
        .mockResolvedValueOnce({}) // UPDATE usuario
        .mockResolvedValueOnce({}); // DELETE tokens

      await verificarCorreo(req, res);

      expect(mocks.getAsync).toHaveBeenCalled();
      expect(mocks.runAsync).toHaveBeenCalledTimes(2);
      expect(mocks.sendFile).toHaveBeenCalled();
      const calledPath = mocks.sendFile.mock.calls[0][0];
      expect(calledPath).toContain("verificacionExitosa.html");
    });

    it("retorna error si no hay token", async () => {
      const { req, res } = mockReqRes();
      req.params.token = undefined;

      await verificarCorreo(req, res);

      expect(mocks.sendFile).toHaveBeenCalled();
      const calledPath = mocks.sendFile.mock.calls[0][0];
      expect(calledPath).toContain("verificacionFallida.html");
    });

    it("retorna error si el token no existe", async () => {
      const { req, res } = mockReqRes();
      req.params.token = MOCK_TOKEN;

      mocks.getAsync.mockResolvedValue(null);

      await verificarCorreo(req, res);

      expect(mocks.sendFile).toHaveBeenCalled();
      const calledPath = mocks.sendFile.mock.calls[0][0];
      expect(calledPath).toContain("verificacionFallida.html");
    });

    it("retorna error si el token expiró", async () => {
      const { req, res } = mockReqRes();
      req.params.token = MOCK_TOKEN;

      const registro = {
        user_id: MOCK_USER_ID,
        token_hash: "hashed-token",
        expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // expirado
      };

      mocks.getAsync.mockResolvedValue(registro);

      await verificarCorreo(req, res);

      expect(mocks.sendFile).toHaveBeenCalled();
      const calledPath = mocks.sendFile.mock.calls[0][0];
      expect(calledPath).toContain("verificacionFallida.html");
    });

    it("maneja errores del servidor", async () => {
      const { req, res } = mockReqRes();
      req.params.token = MOCK_TOKEN;

      mocks.getAsync.mockRejectedValue(new Error("Database error"));

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await verificarCorreo(req, res);

      expect(consoleSpy).toHaveBeenCalled();
      expect(mocks.sendFile).toHaveBeenCalled();
      const calledPath = mocks.sendFile.mock.calls[0][0];
      expect(calledPath).toContain("verificacionFallida.html");

      consoleSpy.mockRestore();
    });
  });
});

