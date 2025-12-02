import { jest } from "@jest/globals";

const MOCK_TOKEN = "mockRecoveryToken";
const MOCK_EMAIL = "test@example.com";
const MOCK_PASSWORD = "NewP@ssw0rd!";

// Mocks
const mocks = {
  sendFile: jest.fn(),
  verifyRecoveryToken: jest.fn(),
  markRecoveryTokensUsed: jest.fn(),
  run: jest.fn(),
  validarYHashearPassword: jest.fn(),
  jwtVerify: jest.fn(),
  findUserByEmail: jest.fn(),
  enviarCorreoCambioPasswordPropio: jest.fn(),
};

// Mocks de módulos
jest.unstable_mockModule("jsonwebtoken", () => ({
  __esModule: true,
  default: { verify: mocks.jwtVerify },
}));

jest.unstable_mockModule("../utils/recoveryHelper.js", () => ({
  saveRecoveryToken: jest.fn(),
  verifyRecoveryToken: mocks.verifyRecoveryToken,
  markRecoveryTokensUsed: mocks.markRecoveryTokensUsed,
}));

jest.unstable_mockModule("../config/database.js", () => ({
  run: mocks.run,
  all: jest.fn(),
}));

jest.unstable_mockModule("../utils/hashHelper.js", () => ({
  validarYHashearPassword: mocks.validarYHashearPassword,
}));

jest.unstable_mockModule("../utils/authHelper.js", () => ({
  findUserByEmail: mocks.findUserByEmail,
  getUserByRefreshToken: jest.fn(),
  saveRefreshToken: jest.fn(),
  clearRefreshTokenByValue: jest.fn(),
  setRefreshTokenCookie: jest.fn(),
  clearRefreshTokenCookie: jest.fn(),
}));

jest.unstable_mockModule("../utils/emailHelper.js", () => ({
  enviarCorreoRecuperacion: jest.fn(),
  enviarCorreoCambioPasswordPropio: mocks.enviarCorreoCambioPasswordPropio,
}));

// Import del controller
const { showResetPasswordPage, resetPassword } = await import(
  "../controllers/authController.js"
);

// Helpers
const mockReqRes = () => ({
  req: { params: {}, body: {} },
  res: {
    sendFile: mocks.sendFile,
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  },
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("showResetPasswordPage", () => {
  it("muestra página de error si no hay token", async () => {
    const { req, res } = mockReqRes();
    req.params = {};
    await showResetPasswordPage(req, res);

    expect(mocks.sendFile).toHaveBeenCalled();
    const calledPath = mocks.sendFile.mock.calls[0][0];
    expect(calledPath).toContain("resetPasswordFallida.html");
  });

  it("muestra página de error si verifyRecoveryToken falla", async () => {
    const { req, res } = mockReqRes();
    req.params.token = MOCK_TOKEN;

    mocks.jwtVerify.mockReturnValue({ email: MOCK_EMAIL });
    mocks.verifyRecoveryToken.mockResolvedValue(false);

    await showResetPasswordPage(req, res);

    expect(mocks.sendFile).toHaveBeenCalled();
    expect(mocks.sendFile.mock.calls[0][0]).toContain(
      "resetPasswordFallida.html"
    );
  });

  it("muestra página de reset si token válido", async () => {
    const { req, res } = mockReqRes();
    req.params.token = MOCK_TOKEN;

    mocks.jwtVerify.mockReturnValue({ email: MOCK_EMAIL });
    mocks.verifyRecoveryToken.mockResolvedValue(true);

    await showResetPasswordPage(req, res);

    expect(mocks.sendFile).toHaveBeenCalled();
    expect(mocks.sendFile.mock.calls[0][0]).toContain("resetPassword.html");
  });
});

describe("resetPassword", () => {
  it("retorna error si contraseña inválida", async () => {
    const { req, res } = mockReqRes();
    req.params.token = MOCK_TOKEN;
    req.body.password = "123";

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
    const { req, res } = mockReqRes();
    req.params.token = MOCK_TOKEN;
    req.body.password = MOCK_PASSWORD;

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
    const { req, res } = mockReqRes();
    req.params.token = MOCK_TOKEN;
    req.body.password = MOCK_PASSWORD;

    mocks.jwtVerify.mockReturnValue({ email: MOCK_EMAIL });
    mocks.validarYHashearPassword.mockResolvedValue("hashedPassword");
    mocks.verifyRecoveryToken.mockResolvedValue(true);
    mocks.findUserByEmail.mockResolvedValue({ nombre: "Test User", email: MOCK_EMAIL });
    mocks.run.mockResolvedValue();
    mocks.markRecoveryTokensUsed.mockResolvedValue();
    mocks.enviarCorreoCambioPasswordPropio.mockResolvedValue();

    await resetPassword(req, res);

    expect(mocks.run).toHaveBeenCalledWith(
      "UPDATE usuario SET password = ? WHERE LOWER(email) = LOWER(?)",
      ["hashedPassword", MOCK_EMAIL]
    );
    expect(mocks.markRecoveryTokensUsed).toHaveBeenCalledWith(MOCK_EMAIL);
    expect(mocks.enviarCorreoCambioPasswordPropio).toHaveBeenCalledWith(MOCK_EMAIL, "Test User");
    expect(mocks.sendFile).toHaveBeenCalled();
    expect(mocks.sendFile.mock.calls[0][0]).toContain(
      "resetPasswordExitosa.html"
    );
  });
});
