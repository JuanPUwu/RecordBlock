import { jest } from "@jest/globals";

const mocks = {
  isValidPassword: jest.fn(),
  bcryptHash: jest.fn(),
};

jest.unstable_mockModule("../../utils/passwordHelper.js", () => ({
  isValidPassword: mocks.isValidPassword,
}));

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    hash: mocks.bcryptHash,
    compare: jest.fn(),
  },
}));

const { validarYHashearPassword } = await import("../../utils/hashHelper.js");

describe("hashHelper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validarYHashearPassword", () => {
    it("lanza error si la contraseña está vacía", async () => {
      await expect(validarYHashearPassword("")).rejects.toThrow(
        "La contraseña es obligatoria"
      );
    });

    it("lanza error si la contraseña es null", async () => {
      await expect(validarYHashearPassword(null)).rejects.toThrow(
        "La contraseña es obligatoria"
      );
    });

    it("lanza error si la contraseña es undefined", async () => {
      await expect(validarYHashearPassword(undefined)).rejects.toThrow(
        "La contraseña es obligatoria"
      );
    });

    it("lanza error si la contraseña no cumple requisitos", async () => {
      mocks.isValidPassword.mockReturnValue(false);

      await expect(validarYHashearPassword("weakpassword")).rejects.toThrow(
        "La contraseña debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos"
      );

      expect(mocks.isValidPassword).toHaveBeenCalledWith("weakpassword");
    });

    it("hashea contraseña válida exitosamente", async () => {
      const password = "ValidP@ssw0rd";
      const hashedPassword = "hashedPassword123";

      mocks.isValidPassword.mockReturnValue(true);
      mocks.bcryptHash.mockResolvedValue(hashedPassword);

      const result = await validarYHashearPassword(password);

      expect(mocks.isValidPassword).toHaveBeenCalledWith(password);
      expect(mocks.bcryptHash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });
  });
});
