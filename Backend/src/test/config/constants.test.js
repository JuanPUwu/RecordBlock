import { jest } from "@jest/globals";

describe("constants", () => {
  beforeEach(() => {
    jest.resetModules();
    delete process.env.NODE_ENV;
  });

  describe("IS_PRODUCTION", () => {
    it("retorna true cuando NODE_ENV es 'production'", async () => {
      process.env.NODE_ENV = "production";
      const { IS_PRODUCTION } = await import("../../config/constants.js");
      expect(IS_PRODUCTION).toBe(true);
    });

    it("retorna false cuando NODE_ENV es 'development'", async () => {
      process.env.NODE_ENV = "development";
      const { IS_PRODUCTION } = await import("../../config/constants.js");
      expect(IS_PRODUCTION).toBe(false);
    });

    it("retorna false cuando NODE_ENV es 'test'", async () => {
      process.env.NODE_ENV = "test";
      const { IS_PRODUCTION } = await import("../../config/constants.js");
      expect(IS_PRODUCTION).toBe(false);
    });
  });

  describe("COOKIE_CONFIG", () => {
    it("tiene httpOnly siempre true", async () => {
      process.env.NODE_ENV = "development";
      const { COOKIE_CONFIG } = await import("../../config/constants.js");
      expect(COOKIE_CONFIG.httpOnly).toBe(true);
    });

    it("secure es true cuando NODE_ENV es 'production'", async () => {
      process.env.NODE_ENV = "production";
      const { COOKIE_CONFIG } = await import("../../config/constants.js");
      expect(COOKIE_CONFIG.secure).toBe(true);
    });

    it("secure es false cuando NODE_ENV no es 'production'", async () => {
      process.env.NODE_ENV = "development";
      const { COOKIE_CONFIG } = await import("../../config/constants.js");
      expect(COOKIE_CONFIG.secure).toBe(false);
    });

    it("sameSite es 'none' cuando NODE_ENV es 'production'", async () => {
      process.env.NODE_ENV = "production";
      const { COOKIE_CONFIG } = await import("../../config/constants.js");
      expect(COOKIE_CONFIG.sameSite).toBe("none");
    });

    it("sameSite es 'lax' cuando NODE_ENV no es 'production'", async () => {
      process.env.NODE_ENV = "development";
      const { COOKIE_CONFIG } = await import("../../config/constants.js");
      expect(COOKIE_CONFIG.sameSite).toBe("lax");
    });
  });

  describe("TOKEN_CONFIG", () => {
    it("tiene configuración de ACCESS_TOKEN_EXPIRY", async () => {
      const { TOKEN_CONFIG } = await import("../../config/constants.js");
      expect(TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY).toBe("15m");
    });

    it("tiene configuración de REFRESH_TOKEN_EXPIRY", async () => {
      const { TOKEN_CONFIG } = await import("../../config/constants.js");
      expect(TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY).toBe("8h");
    });

    it("ACCESS_TOKEN_EXPIRY_SECONDS es 15 * 60", async () => {
      const { TOKEN_CONFIG } = await import("../../config/constants.js");
      expect(TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY_SECONDS).toBe(900);
    });

    it("REFRESH_TOKEN_EXPIRY_MS es 8 * 60 * 60 * 1000", async () => {
      const { TOKEN_CONFIG } = await import("../../config/constants.js");
      expect(TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY_MS).toBe(28800000);
    });
  });
});
