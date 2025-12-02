const { isValidPassword } = await import("../../utils/passwordHelper.js");

describe("passwordHelper", () => {
  describe("isValidPassword", () => {
    it("retorna true para contraseña válida", () => {
      const validPasswords = [
        "ValidP@ssw0rd",
        "Test123!@#",
        "MyP@ssw0rd123",
        "SecureP@ss1",
        "Complex#Pass99",
      ];

      validPasswords.forEach((password) => {
        expect(isValidPassword(password)).toBe(true);
      });
    });

    it("retorna false para contraseña sin mayúscula", () => {
      const invalidPasswords = [
        "password123!",
        "mypassword@123",
        "testpassword#1",
      ];

      invalidPasswords.forEach((password) => {
        expect(isValidPassword(password)).toBe(false);
      });
    });

    it("retorna false para contraseña sin minúscula", () => {
      const invalidPasswords = [
        "PASSWORD123!",
        "MYPASSWORD@123",
        "TESTPASSWORD#1",
      ];

      invalidPasswords.forEach((password) => {
        expect(isValidPassword(password)).toBe(false);
      });
    });

    it("retorna false para contraseña sin número", () => {
      const invalidPasswords = ["Password!", "MyPassword@", "TestPassword#"];

      invalidPasswords.forEach((password) => {
        expect(isValidPassword(password)).toBe(false);
      });
    });

    it("retorna false para contraseña sin carácter especial", () => {
      const invalidPasswords = [
        "Password123",
        "MyPassword456",
        "TestPassword789",
      ];

      invalidPasswords.forEach((password) => {
        expect(isValidPassword(password)).toBe(false);
      });
    });

    it("retorna false para contraseña con menos de 8 caracteres", () => {
      const invalidPasswords = ["Pass1!", "P@ss1", "Test1@"];

      invalidPasswords.forEach((password) => {
        expect(isValidPassword(password)).toBe(false);
      });
    });

    it("retorna false para contraseña vacía", () => {
      expect(isValidPassword("")).toBe(false);
    });

    it("acepta diferentes caracteres especiales", () => {
      const specialChars = [
        "!",
        "@",
        "#",
        "$",
        "%",
        "^",
        "&",
        "*",
        "(",
        ")",
        ",",
        ".",
        "?",
        '"',
        ":",
        "{",
        "}",
        "|",
        "<",
        ">",
        "_",
        "-",
        "\\",
        "[",
        "]",
        ";",
        "'",
      ];

      specialChars.forEach((char) => {
        const password = `Test123${char}`;
        expect(isValidPassword(password)).toBe(true);
      });
    });
  });
});
