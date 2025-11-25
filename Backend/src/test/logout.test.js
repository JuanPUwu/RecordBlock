import { jest } from "@jest/globals";

const MOCK_ACCESS = ["mock", "access"].join("");

const mocks = {
  clearRefreshTokenByValue: jest.fn(),
  clearRefreshTokenCookie: jest.fn(),
  addToBlacklist: jest.fn(),
};

jest.unstable_mockModule("../utils/authHelpers.js", () => ({
  clearRefreshTokenByValue: mocks.clearRefreshTokenByValue,
  clearRefreshTokenCookie: mocks.clearRefreshTokenCookie,
  findUserByEmail: jest.fn(),
  saveRefreshToken: jest.fn(),
  setRefreshTokenCookie: jest.fn(),
  getUserByRefreshToken: jest.fn(),
}));

jest.unstable_mockModule("../config/blacklist.js", () => ({
  addToBlacklist: mocks.addToBlacklist,
}));

const { logout } = await import("../controllers/authController.js");

const mockReqRes = () => ({
  req: {
    cookies: {},
    headers: {},
  },
  res: {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  },
});

describe("logout", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retorna 401 si no hay refreshToken", async () => {
    const { req, res } = mockReqRes();
    await logout(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "No hay sesión activa. No se puede cerrar sesión.",
    });
  });

  it("logout exitoso sin accessToken", async () => {
    const { req, res } = mockReqRes();
    req.cookies.refreshToken = "refresh123";

    await logout(req, res);

    expect(mocks.clearRefreshTokenByValue).toHaveBeenCalled();
    expect(mocks.clearRefreshTokenCookie).toHaveBeenCalled();

    expect(res.json).toHaveBeenCalledWith({
      message: "Sesión cerrada correctamente",
    });
  });

  it("logout exitoso con accessToken", async () => {
    const { req, res } = mockReqRes();
    req.cookies.refreshToken = "tokenXYZ";
    req.headers.authorization = `Bearer ${MOCK_ACCESS}`;

    await logout(req, res);

    expect(mocks.addToBlacklist).toHaveBeenCalled();

    expect(res.json).toHaveBeenCalledWith({
      message: "Sesión cerrada correctamente",
    });
  });
});
