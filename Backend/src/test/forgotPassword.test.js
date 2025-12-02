import { jest } from "@jest/globals";

const MOCK_USER = {
  id: 1,
  email: "demo@test.com",
  verificado: 1,
};

const mocks = {
  findUserByEmail: jest.fn(),
  saveRecoveryToken: jest.fn(),
  createAccessToken: jest.fn(),
  enviarCorreoRecuperacion: jest.fn(),
  bcryptHash: jest.fn(),
};

jest.unstable_mockModule("../utils/authHelper.js", () => ({
  findUserByEmail: mocks.findUserByEmail,
  getUserByRefreshToken: jest.fn(),
  saveRefreshToken: jest.fn(),
  clearRefreshTokenByValue: jest.fn(),
  setRefreshTokenCookie: jest.fn(),
  clearRefreshTokenCookie: jest.fn(),
}));

jest.unstable_mockModule("../utils/recoveryHelper.js", () => ({
  saveRecoveryToken: mocks.saveRecoveryToken,
  markRecoveryTokensUsed: jest.fn(),
  verifyRecoveryToken: jest.fn(),
}));

jest.unstable_mockModule("../utils/tokensHelper.js", () => ({
  createAccessToken: mocks.createAccessToken,
  createRefreshToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
}));

jest.unstable_mockModule("bcrypt", () => ({
  default: { hash: mocks.bcryptHash },
}));

jest.unstable_mockModule("../utils/emailHelper.js", () => ({
  enviarCorreoRecuperacion: mocks.enviarCorreoRecuperacion,
  enviarCorreoCambioPasswordPropio: jest.fn(),
}));

const { forgotPassword } = await import("../controllers/authController.js");

const mockReqRes = () => ({
  req: { body: {} },
  res: {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  },
});

describe("forgotPassword", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retorna 404 si el correo no existe", async () => {
    const { req, res } = mockReqRes();
    req.body.email = "notfound@test.com";

    mocks.findUserByEmail.mockResolvedValue(null);

    await forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("retorna 403 si el usuario no está verificado", async () => {
    const { req, res } = mockReqRes();
    req.body.email = MOCK_USER.email;

    mocks.findUserByEmail.mockResolvedValue({ ...MOCK_USER, verificado: 0 });

    await forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("envía correo en caso exitoso", async () => {
    const { req, res } = mockReqRes();
    req.body.email = MOCK_USER.email;

    mocks.findUserByEmail.mockResolvedValue(MOCK_USER);

    mocks.createAccessToken.mockReturnValue("recoveryToken");
    mocks.bcryptHash.mockResolvedValue("hashed-token");
    mocks.saveRecoveryToken.mockResolvedValue();

    await forgotPassword(req, res);

    expect(mocks.createAccessToken).toHaveBeenCalled();
    expect(mocks.enviarCorreoRecuperacion).toHaveBeenCalledWith(
      MOCK_USER.email,
      "recoveryToken"
    );

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Correo de recuperación enviado",
    });
  });
});
