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
  isValidPassword: jest.fn(),
  jwtVerify: jest.fn(),
};

// Mocks de módulos
jest.unstable_mockModule("jsonwebtoken", () => ({
  __esModule: true,
  default: { verify: mocks.jwtVerify },
}));

jest.unstable_mockModule("../utils/recovery.js", () => ({
  saveRecoveryToken: jest.fn(),
  verifyRecoveryToken: mocks.verifyRecoveryToken,
  markRecoveryTokensUsed: mocks.markRecoveryTokensUsed,
}));

jest.unstable_mockModule("../config/database.js", () => ({
  run: mocks.run,
  all: jest.fn(), // mock para evitar error de import
}));

jest.unstable_mockModule("../utils/password.js", () => ({
  isValidPassword: mocks.isValidPassword,
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

    mocks.isValidPassword.mockReturnValue(false);

    await resetPassword(req, res);

    expect(mocks.sendFile).not.toHaveBeenCalled();
  });

  it("muestra error si verifyRecoveryToken devuelve falso", async () => {
    const { req, res } = mockReqRes();
    req.params.token = MOCK_TOKEN;
    req.body.password = MOCK_PASSWORD;

    mocks.jwtVerify.mockReturnValue({ email: MOCK_EMAIL });
    mocks.isValidPassword.mockReturnValue(true);
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
    mocks.isValidPassword.mockReturnValue(true);
    mocks.verifyRecoveryToken.mockResolvedValue(true);
    mocks.run.mockResolvedValue();
    mocks.markRecoveryTokensUsed.mockResolvedValue();

    await resetPassword(req, res);

    expect(mocks.run).toHaveBeenCalledWith(
      "UPDATE usuario SET password = ? WHERE email = ?",
      expect.any(Array)
    );
    expect(mocks.markRecoveryTokensUsed).toHaveBeenCalledWith(MOCK_EMAIL);
    expect(mocks.sendFile).toHaveBeenCalled();
    expect(mocks.sendFile.mock.calls[0][0]).toContain(
      "resetPasswordExitosa.html"
    );
  });
});
