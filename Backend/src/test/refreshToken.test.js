import { jest } from "@jest/globals";

const MOCK_ACCESS_TOKEN = ["mock", "new-access", "token"].join("");
const MOCK_REFRESH_TOKEN = ["mock", "new-refresh", "token"].join("");

const mocks = {
  getUserByRefreshToken: jest.fn(),
  saveRefreshToken: jest.fn(),
  setRefreshTokenCookie: jest.fn(),
  verifyRefreshToken: jest.fn(),
  createAccessToken: jest.fn(),
  createRefreshToken: jest.fn(),
};

jest.unstable_mockModule("../utils/authHelper.js", () => ({
  getUserByRefreshToken: mocks.getUserByRefreshToken,
  saveRefreshToken: mocks.saveRefreshToken,
  setRefreshTokenCookie: mocks.setRefreshTokenCookie,
  findUserByEmail: jest.fn(),
  clearRefreshTokenByValue: jest.fn(),
  clearRefreshTokenCookie: jest.fn(),
}));

jest.unstable_mockModule("../utils/tokensHelper.js", () => ({
  verifyRefreshToken: mocks.verifyRefreshToken,
  createAccessToken: mocks.createAccessToken,
  createRefreshToken: mocks.createRefreshToken,
}));

const { refreshToken } = await import("../controllers/authController.js");

const mockReqRes = () => ({
  req: { cookies: {} },
  res: {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  },
});

describe("refreshToken", () => {
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
    const { req, res } = mockReqRes();
    req.cookies.refreshToken = "someToken";

    mocks.getUserByRefreshToken.mockResolvedValue(null);

    await refreshToken(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Refresh token inválido o expirado",
    });
  });

  it("retorna tokens nuevos en caso exitoso", async () => {
    const { req, res } = mockReqRes();
    req.cookies.refreshToken = "validToken";

    const usuario = {
      id: 1,
      isAdmin: 0,
      email: "t@t.com",
      nombre: "Test",
    };

    mocks.getUserByRefreshToken.mockResolvedValue(usuario);
    mocks.verifyRefreshToken.mockReturnValue({ id: 1, isAdmin: 0 });
    mocks.createAccessToken.mockReturnValue(MOCK_ACCESS_TOKEN);
    mocks.createRefreshToken.mockReturnValue(MOCK_REFRESH_TOKEN);

    await refreshToken(req, res);

    expect(mocks.saveRefreshToken).toHaveBeenCalled();
    expect(mocks.setRefreshTokenCookie).toHaveBeenCalled();

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
    const { req, res } = mockReqRes();
    req.cookies.refreshToken = "token";

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
