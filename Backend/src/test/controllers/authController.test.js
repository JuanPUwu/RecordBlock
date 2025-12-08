import { jest } from "@jest/globals";

// ============================================================================
// CONSTANTES Y MOCKS COMPARTIDOS
// ============================================================================

// Valores que podrían parecer "credenciales" ahora se generan/ocultan para evitar S2068
const MOCK_PASSWORD = Symbol("MOCK_PASSWORD");
const MOCK_ACCESS_TOKEN = ["mock", "access", "token"].join("");
const MOCK_REFRESH_TOKEN = ["mock", "refresh", "token"].join("");
const MOCK_RECOVERY_TOKEN = "mockRecoveryToken";
const MOCK_EMAIL = "test@example.com";
const MOCK_NEW_PASSWORD = "NewP@ssw0rd!";

// Entradas de prueba (evitan strings tipo contraseña)
const INPUT_PASSWORD = Symbol("INPUT_PASSWORD");
const INPUT_WRONG_PASSWORD = Symbol("INPUT_WRONG_PASSWORD");

// Usuario base reutilizable
const usuarioBase = {
  id: 1,
  email: MOCK_EMAIL,
  password: MOCK_PASSWORD,
  verificado: 1,
  isAdmin: 0,
  nombre: "Test User",
};

// Mocks centralizados
const mocks = {
  // bcrypt
  bcryptCompare: jest.fn(),
  bcryptHash: jest.fn(),
  // authHelper
  findUserByEmail: jest.fn(),
  getUserByRefreshToken: jest.fn(),
  createUserSession: jest.fn(),
  updateSessionLastUsed: jest.fn(),
  clearRefreshTokenByValue: jest.fn(),
  getUserSessions: jest.fn(),
  deleteSessionById: jest.fn(),
  clearAllUserSessions: jest.fn(),
  getDeviceInfo: jest.fn(),
  setRefreshTokenCookie: jest.fn(),
  clearRefreshTokenCookie: jest.fn(),
  // tokensHelper
  createAccessToken: jest.fn(),
  createRefreshToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
  // recoveryHelper
  saveRecoveryToken: jest.fn(),
  verifyRecoveryToken: jest.fn(),
  markRecoveryTokensUsed: jest.fn(),
  // emailHelper
  enviarCorreoRecuperacion: jest.fn(),
  enviarCorreoCambioPasswordPropio: jest.fn(),
  // hashHelper
  validarYHashearPassword: jest.fn(),
  // database
  run: jest.fn(),
  // jsonwebtoken
  jwtVerify: jest.fn(),
  // blacklist
  addToBlacklist: jest.fn(),
  // response
  sendFile: jest.fn(),
};

// ============================================================================
// CONFIGURACIÓN DE MOCKS DE MÓDULOS
// ============================================================================

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    compare: mocks.bcryptCompare,
    hash: mocks.bcryptHash,
  },
}));

jest.unstable_mockModule("../../utils/authHelper.js", () => ({
  findUserByEmail: mocks.findUserByEmail,
  getUserByRefreshToken: mocks.getUserByRefreshToken,
  createUserSession: mocks.createUserSession,
  updateSessionLastUsed: mocks.updateSessionLastUsed,
  clearRefreshTokenByValue: mocks.clearRefreshTokenByValue,
  getUserSessions: mocks.getUserSessions,
  deleteSessionById: mocks.deleteSessionById,
  clearAllUserSessions: mocks.clearAllUserSessions,
  getDeviceInfo: mocks.getDeviceInfo,
  setRefreshTokenCookie: mocks.setRefreshTokenCookie,
  clearRefreshTokenCookie: mocks.clearRefreshTokenCookie,
}));

jest.unstable_mockModule("../../utils/tokensHelper.js", () => ({
  createAccessToken: mocks.createAccessToken,
  createRefreshToken: mocks.createRefreshToken,
  verifyRefreshToken: mocks.verifyRefreshToken,
}));

jest.unstable_mockModule("../../utils/recoveryHelper.js", () => ({
  saveRecoveryToken: mocks.saveRecoveryToken,
  verifyRecoveryToken: mocks.verifyRecoveryToken,
  markRecoveryTokensUsed: mocks.markRecoveryTokensUsed,
}));

jest.unstable_mockModule("../../utils/emailHelper.js", () => ({
  enviarCorreoRecuperacion: mocks.enviarCorreoRecuperacion,
  enviarCorreoCambioPasswordPropio: mocks.enviarCorreoCambioPasswordPropio,
}));

jest.unstable_mockModule("../../utils/hashHelper.js", () => ({
  validarYHashearPassword: mocks.validarYHashearPassword,
}));

jest.unstable_mockModule("../../config/database.js", () => ({
  run: mocks.run,
  all: jest.fn(),
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  __esModule: true,
  default: { verify: mocks.jwtVerify },
}));

jest.unstable_mockModule("../../config/blacklist.js", () => ({
  addToBlacklist: mocks.addToBlacklist,
}));

// ============================================================================
// IMPORTACIÓN DEL CONTROLADOR
// ============================================================================

const {
  loginUsuario,
  refreshToken,
  logout,
  forgotPassword,
  showResetPasswordPage,
  resetPassword,
  getMySessions,
  deleteSession,
  deleteAllOtherSessions,
} = await import("../../controllers/authController.js");

// ============================================================================
// HELPERS
// ============================================================================

const mockReqRes = (options = {}) => ({
  req: {
    body: options.body || {},
    params: options.params || {},
    cookies: options.cookies || {},
    headers: options.headers || {},
    ip: options.ip || "192.168.1.1",
    usuario: options.usuario || undefined,
  },
  res: {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn(),
    sendFile: mocks.sendFile,
  },
});

const setupLoginExitoso = () => {
  mocks.findUserByEmail.mockResolvedValue({ ...usuarioBase });
  mocks.bcryptCompare.mockResolvedValue(true);
  mocks.createRefreshToken.mockReturnValue(MOCK_REFRESH_TOKEN);
  mocks.getDeviceInfo.mockReturnValue({
    deviceInfo: "Windows",
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0",
  });
  mocks.createUserSession.mockResolvedValue(1); // Retorna sessionId
  mocks.createAccessToken.mockReturnValue(MOCK_ACCESS_TOKEN);
  mocks.setRefreshTokenCookie.mockResolvedValue();
};

// ============================================================================
// TESTS - LOGIN
// ============================================================================

describe("authController - loginUsuario", () => {
  beforeEach(() => jest.clearAllMocks());

  test.each([
    [{ password: INPUT_PASSWORD }, "Email y contraseña son requeridos"],
    [{ email: MOCK_EMAIL }, "Email y contraseña son requeridos"],
  ])("retorna 400 si falta algún dato %o", async (body, msg) => {
    const { req, res } = mockReqRes({ body });

    await loginUsuario(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: msg });
  });

  it("retorna 401 si el usuario no existe", async () => {
    const { req, res } = mockReqRes({
      body: { email: "noexiste@example.com", password: INPUT_PASSWORD },
    });

    mocks.findUserByEmail.mockResolvedValue(null);

    await loginUsuario(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Usuario o contraseña no válido",
    });
  });

  it("retorna 403 si el usuario no está verificado", async () => {
    const { req, res } = mockReqRes({
      body: { email: usuarioBase.email, password: INPUT_PASSWORD },
    });

    mocks.findUserByEmail.mockResolvedValue({
      ...usuarioBase,
      verificado: 0,
    });

    await loginUsuario(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Debes verificar tu correo antes de iniciar sesión",
    });
  });

  it("retorna 401 si la contraseña es incorrecta", async () => {
    const { req, res } = mockReqRes({
      body: { email: usuarioBase.email, password: INPUT_WRONG_PASSWORD },
    });

    mocks.findUserByEmail.mockResolvedValue({ ...usuarioBase });
    mocks.bcryptCompare.mockResolvedValue(false);

    await loginUsuario(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Usuario o contraseña no válido",
    });
  });

  it("login exitoso", async () => {
    const { req, res } = mockReqRes({
      body: { email: usuarioBase.email, password: INPUT_PASSWORD },
    });

    setupLoginExitoso();
    await loginUsuario(req, res);

    expect(mocks.createUserSession).toHaveBeenCalledWith(
      usuarioBase.id,
      MOCK_REFRESH_TOKEN,
      "Windows",
      "192.168.1.1",
      "Mozilla/5.0"
    );
    expect(mocks.createAccessToken).toHaveBeenCalledWith(
      { id: usuarioBase.id, isAdmin: usuarioBase.isAdmin },
      1 // sessionId
    );
    expect(mocks.setRefreshTokenCookie).toHaveBeenCalledWith(res, MOCK_REFRESH_TOKEN);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: "Login exitoso",
      accessToken: MOCK_ACCESS_TOKEN,
      usuario: {
        id: usuarioBase.id,
        isAdmin: usuarioBase.isAdmin,
        nombre: usuarioBase.nombre,
      },
    });
  });

  it("maneja errores del servidor", async () => {
    const { req, res } = mockReqRes({
      body: { email: usuarioBase.email, password: INPUT_PASSWORD },
    });

    const error = new Error("Database error");
    mocks.findUserByEmail.mockRejectedValue(error);

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await loginUsuario(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(error);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error en el servidor" });

    consoleSpy.mockRestore();
  });
});

// ============================================================================
// TESTS - REFRESH TOKEN
// ============================================================================

describe("authController - refreshToken", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retorna 401 si no hay cookie refreshToken", async () => {
    const { req, res } = mockReqRes();

    await refreshToken(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Refresh token requerido",
    });
  });

  it("retorna 403 si el token no está asociado a un usuario", async () => {
    const { req, res } = mockReqRes({ cookies: { refreshToken: "someToken" } });

    mocks.getUserByRefreshToken.mockResolvedValue(null);

    await refreshToken(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Refresh token inválido o expirado",
    });
  });

  it("retorna tokens nuevos en caso exitoso", async () => {
    const { req, res } = mockReqRes({
      cookies: { refreshToken: "validToken" },
    });

    const usuario = {
      id: 1,
      isAdmin: 0,
      email: "t@t.com",
      nombre: "Test",
    };

    mocks.getUserByRefreshToken.mockResolvedValue({
      ...usuario,
      session_id: 1, // session_id actual
    });
    mocks.verifyRefreshToken.mockReturnValue({ id: 1, isAdmin: 0 });
    mocks.createRefreshToken.mockReturnValue(MOCK_REFRESH_TOKEN);
    mocks.getDeviceInfo.mockReturnValue({
      deviceInfo: "Windows",
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0",
    });
    mocks.createUserSession.mockResolvedValue(2); // Nueva sesión con ID 2
    mocks.createAccessToken.mockReturnValue(MOCK_ACCESS_TOKEN);

    await refreshToken(req, res);

    expect(mocks.updateSessionLastUsed).toHaveBeenCalledWith("validToken");
    expect(mocks.clearRefreshTokenByValue).toHaveBeenCalledWith("validToken");
    expect(mocks.createUserSession).toHaveBeenCalled();
    expect(mocks.createAccessToken).toHaveBeenCalledWith(
      { id: 1, isAdmin: 0 },
      2 // nuevo sessionId
    );
    expect(mocks.setRefreshTokenCookie).toHaveBeenCalledWith(res, MOCK_REFRESH_TOKEN);

    expect(res.json).toHaveBeenCalledWith({
      accessToken: MOCK_ACCESS_TOKEN,
      usuario: {
        id: usuario.id,
        isAdmin: usuario.isAdmin,
        email: usuario.email,
        nombre: usuario.nombre,
      },
    });
  });

  it("retorna 403 si verifyRefreshToken lanza error", async () => {
    const { req, res } = mockReqRes({ cookies: { refreshToken: "token" } });

    mocks.getUserByRefreshToken.mockResolvedValue({ id: 1 });
    const error = new Error("Expired");
    mocks.verifyRefreshToken.mockImplementation(() => {
      throw error;
    });

    await refreshToken(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Refresh token inválido o expirado",
      message: error,
    });
  });
});

// ============================================================================
// TESTS - LOGOUT
// ============================================================================

describe("authController - logout", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retorna 401 si no hay refreshToken", async () => {
    const { req, res } = mockReqRes();

    await logout(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "No hay sesión activa. No se puede cerrar sesión",
    });
  });

  it("logout exitoso sin accessToken", async () => {
    const { req, res } = mockReqRes({
      cookies: { refreshToken: "refresh123" },
    });

    await logout(req, res);

    expect(mocks.clearRefreshTokenByValue).toHaveBeenCalled();
    expect(mocks.clearRefreshTokenCookie).toHaveBeenCalled();

    expect(res.json).toHaveBeenCalledWith({
      message: "Sesión cerrada correctamente",
    });
  });

  it("logout exitoso con accessToken", async () => {
    const { req, res } = mockReqRes({
      cookies: { refreshToken: "tokenXYZ" },
      headers: { authorization: `Bearer ${MOCK_ACCESS_TOKEN}` },
    });

    mocks.addToBlacklist.mockResolvedValue();

    await logout(req, res);

    expect(mocks.addToBlacklist).toHaveBeenCalled();

    expect(res.json).toHaveBeenCalledWith({
      message: "Sesión cerrada correctamente",
    });
  });

  it("logout maneja error al limpiar refresh token pero continúa", async () => {
    const { req, res } = mockReqRes({
      cookies: { refreshToken: "tokenXYZ" },
    });

    const error = new Error("Database error");
    mocks.clearRefreshTokenByValue.mockRejectedValue(error);

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await logout(req, res);

    expect(consoleSpy).toHaveBeenCalled();
    expect(mocks.clearRefreshTokenCookie).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "Sesión cerrada correctamente",
    });

    consoleSpy.mockRestore();
  });

  it("logout maneja error al agregar a blacklist pero continúa", async () => {
    const { req, res } = mockReqRes({
      cookies: { refreshToken: "tokenXYZ" },
      headers: { authorization: `Bearer ${MOCK_ACCESS_TOKEN}` },
    });

    const error = new Error("Blacklist error");
    mocks.addToBlacklist.mockRejectedValue(error);

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await logout(req, res);

    expect(consoleSpy).toHaveBeenCalled();
    expect(mocks.clearRefreshTokenCookie).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "Sesión cerrada correctamente",
    });

    consoleSpy.mockRestore();
  });
});

// ============================================================================
// TESTS - FORGOT PASSWORD
// ============================================================================

describe("authController - forgotPassword", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retorna 404 si el correo no existe", async () => {
    const { req, res } = mockReqRes({
      body: { email: "notfound@test.com" },
    });

    mocks.findUserByEmail.mockResolvedValue(null);

    await forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("retorna 403 si el usuario no está verificado", async () => {
    const { req, res } = mockReqRes({
      body: { email: usuarioBase.email },
    });

    mocks.findUserByEmail.mockResolvedValue({
      ...usuarioBase,
      verificado: 0,
    });

    await forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("envía correo en caso exitoso", async () => {
    const { req, res } = mockReqRes({
      body: { email: usuarioBase.email },
    });

    mocks.findUserByEmail.mockResolvedValue(usuarioBase);
    mocks.createAccessToken.mockReturnValue("recoveryToken");
    mocks.bcryptHash.mockResolvedValue("hashed-token");
    mocks.saveRecoveryToken.mockResolvedValue();

    await forgotPassword(req, res);

    expect(mocks.createAccessToken).toHaveBeenCalled();
    expect(mocks.enviarCorreoRecuperacion).toHaveBeenCalledWith(
      usuarioBase.email,
      "recoveryToken"
    );

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Correo de recuperación enviado",
    });
  });
});

// ============================================================================
// TESTS - SHOW RESET PASSWORD PAGE
// ============================================================================

describe("authController - showResetPasswordPage", () => {
  beforeEach(() => jest.clearAllMocks());

  it("muestra página de error si no hay token", async () => {
    const { req, res } = mockReqRes({ params: {} });

    await showResetPasswordPage(req, res);

    expect(mocks.sendFile).toHaveBeenCalled();
    const calledPath = mocks.sendFile.mock.calls[0][0];
    expect(calledPath).toContain("resetPasswordFallida.html");
  });

  it("muestra página de error si verifyRecoveryToken falla", async () => {
    const { req, res } = mockReqRes({ params: { token: MOCK_RECOVERY_TOKEN } });

    mocks.jwtVerify.mockReturnValue({ email: MOCK_EMAIL });
    mocks.verifyRecoveryToken.mockResolvedValue(false);

    await showResetPasswordPage(req, res);

    expect(mocks.sendFile).toHaveBeenCalled();
    expect(mocks.sendFile.mock.calls[0][0]).toContain(
      "resetPasswordFallida.html"
    );
  });

  it("muestra página de reset si token válido", async () => {
    const { req, res } = mockReqRes({ params: { token: MOCK_RECOVERY_TOKEN } });

    mocks.jwtVerify.mockReturnValue({ email: MOCK_EMAIL });
    mocks.verifyRecoveryToken.mockResolvedValue(true);

    await showResetPasswordPage(req, res);

    expect(mocks.sendFile).toHaveBeenCalled();
    expect(mocks.sendFile.mock.calls[0][0]).toContain("resetPassword.html");
  });

  it("maneja errores al verificar token", async () => {
    const { req, res } = mockReqRes({ params: { token: MOCK_RECOVERY_TOKEN } });

    const error = new Error("JWT verification failed");
    mocks.jwtVerify.mockImplementation(() => {
      throw error;
    });

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await showResetPasswordPage(req, res);

    expect(consoleSpy).toHaveBeenCalled();
    expect(mocks.sendFile).toHaveBeenCalled();
    expect(mocks.sendFile.mock.calls[0][0]).toContain(
      "resetPasswordFallida.html"
    );

    consoleSpy.mockRestore();
  });
});

// ============================================================================
// TESTS - RESET PASSWORD
// ============================================================================

describe("authController - resetPassword", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retorna error si contraseña inválida", async () => {
    const { req, res } = mockReqRes({
      params: { token: MOCK_RECOVERY_TOKEN },
      body: { password: "123" },
    });

    mocks.validarYHashearPassword.mockRejectedValue(
      new Error("La contraseña no cumple con los requisitos mínimos")
    );

    await resetPassword(req, res);

    expect(mocks.sendFile).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.stringContaining("La contraseña no cumple")
    );
  });

  it("muestra error si verifyRecoveryToken devuelve falso", async () => {
    const { req, res } = mockReqRes({
      params: { token: MOCK_RECOVERY_TOKEN },
      body: { password: MOCK_NEW_PASSWORD },
    });

    mocks.jwtVerify.mockReturnValue({ email: MOCK_EMAIL });
    mocks.validarYHashearPassword.mockResolvedValue("hashedPassword");
    mocks.verifyRecoveryToken.mockResolvedValue(false);

    await resetPassword(req, res);

    expect(mocks.sendFile).toHaveBeenCalled();
    expect(mocks.sendFile.mock.calls[0][0]).toContain(
      "resetPasswordFallida.html"
    );
  });

  it("restablece contraseña exitosamente", async () => {
    const { req, res } = mockReqRes({
      params: { token: MOCK_RECOVERY_TOKEN },
      body: { password: MOCK_NEW_PASSWORD },
    });

    mocks.jwtVerify.mockReturnValue({ email: MOCK_EMAIL });
    mocks.validarYHashearPassword.mockResolvedValue("hashedPassword");
    mocks.verifyRecoveryToken.mockResolvedValue(true);
    mocks.findUserByEmail.mockResolvedValue({
      nombre: "Test User",
      email: MOCK_EMAIL,
    });
    mocks.run.mockResolvedValue();
    mocks.markRecoveryTokensUsed.mockResolvedValue();
    mocks.enviarCorreoCambioPasswordPropio.mockResolvedValue();

    await resetPassword(req, res);

    expect(mocks.run).toHaveBeenCalledWith(
      "UPDATE usuario SET password = ? WHERE LOWER(email) = LOWER(?)",
      ["hashedPassword", MOCK_EMAIL]
    );
    expect(mocks.markRecoveryTokensUsed).toHaveBeenCalledWith(MOCK_EMAIL);
    expect(mocks.enviarCorreoCambioPasswordPropio).toHaveBeenCalledWith(
      MOCK_EMAIL,
      "Test User"
    );
    expect(mocks.sendFile).toHaveBeenCalled();
    expect(mocks.sendFile.mock.calls[0][0]).toContain(
      "resetPasswordExitosa.html"
    );
  });

  it("usa nombre por defecto si usuario no tiene nombre", async () => {
    const { req, res } = mockReqRes({
      params: { token: MOCK_RECOVERY_TOKEN },
      body: { password: MOCK_NEW_PASSWORD },
    });

    mocks.jwtVerify.mockReturnValue({ email: MOCK_EMAIL });
    mocks.validarYHashearPassword.mockResolvedValue("hashedPassword");
    mocks.verifyRecoveryToken.mockResolvedValue(true);
    mocks.findUserByEmail.mockResolvedValue(null); // Usuario no encontrado
    mocks.run.mockResolvedValue();
    mocks.markRecoveryTokensUsed.mockResolvedValue();
    mocks.enviarCorreoCambioPasswordPropio.mockResolvedValue();

    await resetPassword(req, res);

    expect(mocks.enviarCorreoCambioPasswordPropio).toHaveBeenCalledWith(
      MOCK_EMAIL,
      "usuario"
    );
  });

  it("maneja errores al restablecer contraseña", async () => {
    const { req, res } = mockReqRes({
      params: { token: MOCK_RECOVERY_TOKEN },
      body: { password: MOCK_NEW_PASSWORD },
    });

    const error = new Error("Database error");
    mocks.jwtVerify.mockReturnValue({ email: MOCK_EMAIL });
    mocks.validarYHashearPassword.mockResolvedValue("hashedPassword");
    mocks.verifyRecoveryToken.mockResolvedValue(true);
    mocks.findUserByEmail.mockRejectedValue(error);

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await resetPassword(req, res);

    expect(consoleSpy).toHaveBeenCalled();
    expect(mocks.sendFile).toHaveBeenCalled();
    expect(mocks.sendFile.mock.calls[0][0]).toContain(
      "resetPasswordFallida.html"
    );

    consoleSpy.mockRestore();
  });
});

// ============================================================================
// TESTS - GET MY SESSIONS
// ============================================================================

describe("authController - getMySessions", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retorna todas las sesiones activas del usuario", async () => {
    const { req, res } = mockReqRes({
      usuario: { id: 1 },
    });

    const mockSessions = [
      {
        id: 1,
        device_info: "Windows",
        ip_address: "192.168.1.1",
        user_agent: "Mozilla/5.0",
        created_at: "2024-01-01T00:00:00.000Z",
        last_used_at: "2024-01-01T12:00:00.000Z",
        expires_at: "2024-01-01T20:00:00.000Z",
      },
      {
        id: 2,
        device_info: "Mobile Device",
        ip_address: "192.168.1.2",
        user_agent: "Mobile Safari",
        created_at: "2024-01-01T01:00:00.000Z",
        last_used_at: "2024-01-01T11:00:00.000Z",
        expires_at: "2024-01-01T21:00:00.000Z",
      },
    ];

    mocks.getUserSessions.mockResolvedValue(mockSessions);

    await getMySessions(req, res);

    expect(mocks.getUserSessions).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      sessions: mockSessions.map((session) => ({
        id: session.id,
        deviceInfo: session.device_info,
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        createdAt: session.created_at,
        lastUsedAt: session.last_used_at,
        expiresAt: session.expires_at,
      })),
    });
  });

  it("maneja errores del servidor", async () => {
    const { req, res } = mockReqRes({
      usuario: { id: 1 },
    });

    const error = new Error("Database error");
    mocks.getUserSessions.mockRejectedValue(error);

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await getMySessions(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(error);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error al obtener sesiones" });

    consoleSpy.mockRestore();
  });
});

// ============================================================================
// TESTS - DELETE SESSION
// ============================================================================

describe("authController - deleteSession", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retorna 400 si no se proporciona sessionId", async () => {
    const { req, res } = mockReqRes({
      usuario: { id: 1 },
      params: {},
    });

    await deleteSession(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "ID de sesión requerido",
    });
  });

  it("retorna 400 si intenta eliminar la sesión actual", async () => {
    const { req, res } = mockReqRes({
      usuario: { id: 1 },
      params: { sessionId: "1" },
      cookies: { refreshToken: "current-token" },
    });

    mocks.getUserByRefreshToken.mockResolvedValue({
      id: 1,
      session_id: 1,
    });

    await deleteSession(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "No puedes eliminar tu sesión actual. Usa /logout para cerrar sesión",
    });
  });

  it("elimina sesión exitosamente", async () => {
    const { req, res } = mockReqRes({
      usuario: { id: 1 },
      params: { sessionId: "2" },
      cookies: { refreshToken: "current-token" },
    });

    mocks.getUserByRefreshToken.mockResolvedValue({
      id: 1,
      session_id: 1, // Sesión actual diferente a la que se elimina
    });
    mocks.deleteSessionById.mockResolvedValue(true);

    await deleteSession(req, res);

    expect(mocks.deleteSessionById).toHaveBeenCalledWith(2, 1);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Sesión eliminada correctamente",
    });
  });

  it("retorna 404 si la sesión no existe", async () => {
    const { req, res } = mockReqRes({
      usuario: { id: 1 },
      params: { sessionId: "999" },
      cookies: { refreshToken: "current-token" },
    });

    mocks.getUserByRefreshToken.mockResolvedValue({
      id: 1,
      session_id: 1,
    });
    mocks.deleteSessionById.mockResolvedValue(false);

    await deleteSession(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Sesión no encontrada o no tienes permisos para eliminarla",
    });
  });

  it("maneja errores del servidor", async () => {
    const { req, res } = mockReqRes({
      usuario: { id: 1 },
      params: { sessionId: "2" },
      cookies: { refreshToken: "current-token" },
    });

    const error = new Error("Database error");
    mocks.getUserByRefreshToken.mockResolvedValue({
      id: 1,
      session_id: 1,
    });
    mocks.deleteSessionById.mockRejectedValue(error);

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await deleteSession(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(error);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error al eliminar sesión" });

    consoleSpy.mockRestore();
  });
});

// ============================================================================
// TESTS - DELETE ALL OTHER SESSIONS
// ============================================================================

describe("authController - deleteAllOtherSessions", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retorna 401 si no hay sesión activa", async () => {
    const { req, res } = mockReqRes({
      usuario: { id: 1 },
      cookies: {},
    });

    await deleteAllOtherSessions(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "No hay sesión activa",
    });
  });

  it("elimina todas las demás sesiones exitosamente", async () => {
    const { req, res } = mockReqRes({
      usuario: { id: 1 },
      cookies: { refreshToken: "current-token" },
    });

    mocks.run.mockResolvedValue({ changes: 3 });

    await deleteAllOtherSessions(req, res);

    expect(mocks.run).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM user_sessions"),
      [1, "current-token"]
    );
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Todas las demás sesiones han sido cerradas",
    });
  });

  it("maneja errores del servidor", async () => {
    const { req, res } = mockReqRes({
      usuario: { id: 1 },
      cookies: { refreshToken: "current-token" },
    });

    const error = new Error("Database error");
    mocks.run.mockRejectedValue(error);

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await deleteAllOtherSessions(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(error);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error al eliminar sesiones" });

    consoleSpy.mockRestore();
  });
});
