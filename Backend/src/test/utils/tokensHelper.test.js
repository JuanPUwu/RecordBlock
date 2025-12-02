import { jest } from "@jest/globals";

const tokenMocks = {
  jwtSign: jest.fn(),
  jwtVerify: jest.fn(),
};

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: tokenMocks.jwtSign,
    verify: tokenMocks.jwtVerify,
  },
}));

const {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = await import("../../utils/tokensHelper.js");

describe("tokensHelper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createAccessToken", () => {
    it("crea access token correctamente", () => {
      const payload = { id: 1, isAdmin: 0 };
      const expectedToken = "access-token-123";

      tokenMocks.jwtSign.mockReturnValue(expectedToken);

      const result = createAccessToken(payload);

      expect(tokenMocks.jwtSign).toHaveBeenCalledWith(
        payload,
        process.env.JWT_ACCESS_SECRET,
        expect.objectContaining({
          expiresIn: expect.any(String),
        })
      );
      expect(result).toBe(expectedToken);
    });
  });

  describe("createRefreshToken", () => {
    it("crea refresh token correctamente", () => {
      const payload = { id: 1, isAdmin: 0 };
      const expectedToken = "refresh-token-123";

      tokenMocks.jwtSign.mockReturnValue(expectedToken);

      const result = createRefreshToken(payload);

      expect(tokenMocks.jwtSign).toHaveBeenCalledWith(
        payload,
        process.env.JWT_REFRESH_SECRET,
        expect.objectContaining({
          expiresIn: expect.any(String),
        })
      );
      expect(result).toBe(expectedToken);
    });
  });

  describe("verifyAccessToken", () => {
    it("verifica access token correctamente", () => {
      const token = "access-token-123";
      const decoded = { id: 1, isAdmin: 0 };

      tokenMocks.jwtVerify.mockReturnValue(decoded);

      const result = verifyAccessToken(token);

      expect(tokenMocks.jwtVerify).toHaveBeenCalledWith(
        token,
        process.env.JWT_ACCESS_SECRET
      );
      expect(result).toEqual(decoded);
    });
  });

  describe("verifyRefreshToken", () => {
    it("verifica refresh token correctamente", () => {
      const token = "refresh-token-123";
      const decoded = { id: 1, isAdmin: 0 };

      tokenMocks.jwtVerify.mockReturnValue(decoded);

      const result = verifyRefreshToken(token);

      expect(tokenMocks.jwtVerify).toHaveBeenCalledWith(
        token,
        process.env.JWT_REFRESH_SECRET
      );
      expect(result).toEqual(decoded);
    });
  });
});

