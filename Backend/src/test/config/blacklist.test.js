import { jest } from "@jest/globals";

const mocks = {
  run: jest.fn(),
  all: jest.fn(),
};

jest.unstable_mockModule("../../config/database.js", () => ({
  run: mocks.run,
  all: mocks.all,
}));

const { addToBlacklist, cleanBlacklist, isBlacklisted } = await import(
  "../../config/blacklist.js"
);

describe("blacklist", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addToBlacklist", () => {
    it("agrega token a blacklist con tiempo de expiración", async () => {
      const token = "token-to-blacklist";
      const expiresInSeconds = 3600; // 1 hora

      mocks.run.mockResolvedValue();

      await addToBlacklist(token, expiresInSeconds);

      expect(mocks.run).toHaveBeenCalledWith(
        "INSERT INTO token_blacklist (token, expiresAt) VALUES (?, ?)",
        [token, expect.any(Number)]
      );

      const callArgs = mocks.run.mock.calls[0][1];
      const expiresAt = callArgs[1];
      const now = Date.now();
      const expectedExpiresAt = now + expiresInSeconds * 1000;

      // Verificar que el tiempo de expiración es aproximadamente correcto (con margen de 1 segundo)
      expect(expiresAt).toBeGreaterThanOrEqual(expectedExpiresAt - 1000);
      expect(expiresAt).toBeLessThanOrEqual(expectedExpiresAt + 1000);
    });
  });

  describe("cleanBlacklist", () => {
    it("elimina tokens expirados", async () => {
      mocks.run.mockResolvedValue();

      await cleanBlacklist();

      expect(mocks.run).toHaveBeenCalledWith(
        "DELETE FROM token_blacklist WHERE expiresAt <= ?",
        [expect.any(Number)]
      );

      const callArgs = mocks.run.mock.calls[0][1];
      const now = callArgs[0];
      const currentTime = Date.now();

      // Verificar que usa el tiempo actual (con margen de 1 segundo)
      expect(now).toBeGreaterThanOrEqual(currentTime - 1000);
      expect(now).toBeLessThanOrEqual(currentTime + 1000);
    });
  });

  describe("isBlacklisted", () => {
    it("retorna true si el token está en blacklist", async () => {
      const token = "blacklisted-token";

      mocks.run.mockResolvedValue(); // cleanBlacklist
      mocks.all.mockResolvedValue([{ token, expiresAt: Date.now() + 1000 }]);

      const result = await isBlacklisted(token);

      expect(mocks.run).toHaveBeenCalled(); // cleanBlacklist fue llamado
      expect(mocks.all).toHaveBeenCalledWith(
        "SELECT * FROM token_blacklist WHERE token = ?",
        [token]
      );
      expect(result).toBe(true);
    });

    it("retorna false si el token no está en blacklist", async () => {
      const token = "valid-token";

      mocks.run.mockResolvedValue(); // cleanBlacklist
      mocks.all.mockResolvedValue([]);

      const result = await isBlacklisted(token);

      expect(mocks.run).toHaveBeenCalled(); // cleanBlacklist fue llamado
      expect(mocks.all).toHaveBeenCalledWith(
        "SELECT * FROM token_blacklist WHERE token = ?",
        [token]
      );
      expect(result).toBe(false);
    });

    it("limpia tokens expirados antes de verificar", async () => {
      const token = "some-token";

      mocks.run.mockResolvedValue();
      mocks.all.mockResolvedValue([]);

      await isBlacklisted(token);

      // Verificar que cleanBlacklist fue llamado primero
      expect(mocks.run).toHaveBeenCalledWith(
        "DELETE FROM token_blacklist WHERE expiresAt <= ?",
        [expect.any(Number)]
      );
      expect(mocks.all).toHaveBeenCalled();
    });
  });
});
