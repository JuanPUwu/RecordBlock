import { describe, it, expect, vi } from "vitest";
import { handleRequest } from "../../utils/apiHelper";

describe("apiHelper", () => {
  describe("handleRequest", () => {
    it("debe retornar success: true y data cuando la petición es exitosa", async () => {
      const mockData = { id: 1, name: "Test" };
      const mockCallback = vi.fn().mockResolvedValue({ data: mockData });

      const result = await handleRequest(mockCallback);

      expect(result).toEqual({ success: true, data: mockData });
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it("debe retornar success: false y error cuando la petición falla con error.response.data.error", async () => {
      const mockError = {
        response: {
          data: {
            error: "Error personalizado",
          },
        },
      };
      const mockCallback = vi.fn().mockRejectedValue(mockError);

      const result = await handleRequest(mockCallback);

      expect(result).toEqual({
        success: false,
        error: "Error personalizado",
      });
    });

    it("debe retornar success: false y error cuando la petición falla con error.response.data.message", async () => {
      const mockError = {
        response: {
          data: {
            message: "Mensaje de error",
          },
        },
      };
      const mockCallback = vi.fn().mockRejectedValue(mockError);

      const result = await handleRequest(mockCallback);

      expect(result).toEqual({
        success: false,
        error: "Mensaje de error",
      });
    });

    it("debe retornar success: false y error.message cuando no hay error.response", async () => {
      const mockError = new Error("Error de red");
      const mockCallback = vi.fn().mockRejectedValue(mockError);

      const result = await handleRequest(mockCallback);

      expect(result).toEqual({
        success: false,
        error: "Error de red",
      });
    });

    it("debe retornar mensaje por defecto cuando no hay ningún mensaje disponible", async () => {
      const mockError = {};
      const mockCallback = vi.fn().mockRejectedValue(mockError);

      const result = await handleRequest(mockCallback);

      expect(result).toEqual({
        success: false,
        error: "Error en la petición",
      });
    });

    it("debe priorizar error sobre message en error.response.data", async () => {
      const mockError = {
        response: {
          data: {
            error: "Error prioritario",
            message: "Mensaje secundario",
          },
        },
      };
      const mockCallback = vi.fn().mockRejectedValue(mockError);

      const result = await handleRequest(mockCallback);

      expect(result).toEqual({
        success: false,
        error: "Error prioritario",
      });
    });

    it("debe manejar errores sin response.data", async () => {
      const mockError = {
        response: {},
      };
      const mockCallback = vi.fn().mockRejectedValue(mockError);

      const result = await handleRequest(mockCallback);

      expect(result).toEqual({
        success: false,
        error: "Error en la petición",
      });
    });
  });
});
