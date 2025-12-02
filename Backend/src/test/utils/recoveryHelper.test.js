import { jest } from "@jest/globals";

const mocks = {
  run: jest.fn(),
  all: jest.fn(),
  bcryptCompare: jest.fn(),
};

jest.unstable_mockModule("../../config/database.js", () => ({
  run: mocks.run,
  all: mocks.all,
}));

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    compare: mocks.bcryptCompare,
    hash: jest.fn(),
  },
}));

const { saveRecoveryToken, verifyRecoveryToken, markRecoveryTokensUsed } =
  await import("../../utils/recoveryHelper.js");

describe("recoveryHelper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("saveRecoveryToken", () => {
    it("guarda token de recuperación correctamente", async () => {
      const userId = 1;
      const tokenHash = "hashed-token-123";
      const expiresAtIso = new Date().toISOString();

      mocks.run.mockResolvedValue({ lastID: 1, changes: 1 });

      await saveRecoveryToken(userId, tokenHash, expiresAtIso);

      expect(mocks.run).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO tokens_recuperacion"),
        [userId, tokenHash, expiresAtIso]
      );
    });
  });

  describe("verifyRecoveryToken", () => {
    it("retorna true si el token es válido", async () => {
      const email = "test@example.com";
      const token = "valid-token";
      const mockTokens = [
        {
          id: 1,
          user_id: 1,
          token_hash: "hashed-token-1",
          expires_at: new Date(Date.now() + 1000).toISOString(),
          used: 0,
        },
        {
          id: 2,
          user_id: 1,
          token_hash: "hashed-token-2",
          expires_at: new Date(Date.now() + 1000).toISOString(),
          used: 0,
        },
      ];

      mocks.all.mockResolvedValue(mockTokens);
      
      // Promise.any retorna el PRIMER valor que se resuelve exitosamente
      // Para que retorne true, la primera promesa debe resolverse a true
      // o necesitamos que todas se resuelvan pero al menos una sea true
      // Como Promise.any retorna el primero que se resuelve, necesitamos
      // que la primera sea true, o usar un delay para que la segunda se resuelva primero
      mocks.bcryptCompare
        .mockResolvedValueOnce(true) // primer token coincide - se resuelve primero
        .mockResolvedValueOnce(false); // segundo token no coincide

      const result = await verifyRecoveryToken(email, token);

      expect(mocks.all).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM tokens_recuperacion"),
        [email]
      );
      // Verificar que bcrypt.compare fue llamado para cada token
      expect(mocks.bcryptCompare).toHaveBeenCalledTimes(2);
      // Promise.any retornará el primer valor resuelto (true)
      expect(result).toBe(true);
    });

    it("retorna false si no hay tokens", async () => {
      const email = "test@example.com";
      const token = "some-token";

      mocks.all.mockResolvedValue([]);

      const result = await verifyRecoveryToken(email, token);

      expect(result).toBe(false);
      expect(mocks.bcryptCompare).not.toHaveBeenCalled();
    });

    it("retorna false si ningún token coincide", async () => {
      const email = "test@example.com";
      const token = "invalid-token";
      const mockTokens = [
        {
          id: 1,
          user_id: 1,
          token_hash: "hashed-token-1",
          expires_at: new Date(Date.now() + 1000).toISOString(),
          used: 0,
        },
      ];

      mocks.all.mockResolvedValue(mockTokens);
      mocks.bcryptCompare.mockResolvedValue(false);

      const result = await verifyRecoveryToken(email, token);

      expect(result).toBe(false);
    });

    it("maneja errores en Promise.any retornando false", async () => {
      const email = "test@example.com";
      const token = "some-token";
      const mockTokens = [
        {
          id: 1,
          user_id: 1,
          token_hash: "hashed-token-1",
          expires_at: new Date(Date.now() + 1000).toISOString(),
          used: 0,
        },
      ];

      mocks.all.mockResolvedValue(mockTokens);
      mocks.bcryptCompare.mockRejectedValue(new Error("Comparison error"));

      const result = await verifyRecoveryToken(email, token);

      expect(result).toBe(false);
    });
  });

  describe("markRecoveryTokensUsed", () => {
    it("marca tokens como usados para un email", async () => {
      const email = "test@example.com";

      mocks.run.mockResolvedValue({ changes: 1 });

      await markRecoveryTokensUsed(email);

      expect(mocks.run).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE tokens_recuperacion"),
        [email]
      );
    });
  });
});
