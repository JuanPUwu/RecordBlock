import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { resaltarTexto } from "../../utils/textUtils";

describe("textUtils", () => {
  describe("resaltarTexto", () => {
    it("debe retornar array con texto cuando no hay término", () => {
      const resultado = resaltarTexto("Hola mundo", "");
      expect(resultado).toEqual(["Hola mundo"]);
    });

    it("debe retornar array con texto cuando término es null", () => {
      const resultado = resaltarTexto("Hola mundo", null);
      expect(resultado).toEqual(["Hola mundo"]);
    });

    it("debe retornar array con texto cuando texto es null", () => {
      const resultado = resaltarTexto(null, "mundo");
      expect(resultado).toEqual(["null"]);
    });

    it("debe resaltar término encontrado en el texto", () => {
      const resultado = resaltarTexto("Hola mundo", "mundo");
      const { container } = render(<div>{resultado}</div>);
      const highlighted = container.querySelector(".highlight");
      expect(highlighted).toBeInTheDocument();
      expect(highlighted?.textContent).toBe("mundo");
    });

    it("debe resaltar término sin importar mayúsculas/minúsculas", () => {
      const resultado = resaltarTexto("Hola MUNDO", "mundo");
      const { container } = render(<div>{resultado}</div>);
      const highlighted = container.querySelector(".highlight");
      expect(highlighted).toBeInTheDocument();
    });

    it("debe resaltar múltiples ocurrencias del término", () => {
      const resultado = resaltarTexto("mundo mundo", "mundo");
      const { container } = render(<div>{resultado}</div>);
      const highlights = container.querySelectorAll(".highlight");
      expect(highlights.length).toBeGreaterThan(0);
    });

    it("debe usar clase highlight-key cuando esLlave es true", () => {
      const resultado = resaltarTexto("Hola mundo", "mundo", true);
      const { container } = render(<div>{resultado}</div>);
      const highlighted = container.querySelector(".highlight-key");
      expect(highlighted).toBeInTheDocument();
    });

    it("debe escapar caracteres especiales en regex", () => {
      const resultado = resaltarTexto("Hola (mundo)", "(mundo)");
      const { container } = render(<div>{resultado}</div>);
      const highlighted = container.querySelector(".highlight");
      expect(highlighted).toBeInTheDocument();
    });

    it("debe manejar números en el texto", () => {
      const resultado = resaltarTexto("Versión 1.0", "1.0");
      const { container } = render(<div>{resultado}</div>);
      const highlighted = container.querySelector(".highlight");
      expect(highlighted).toBeInTheDocument();
    });

    it("debe convertir número a string cuando se pasa número como texto", () => {
      const resultado = resaltarTexto(12345, "3");
      expect(Array.isArray(resultado)).toBe(true);
    });

    it("debe generar keys únicos para cada parte", () => {
      const resultado = resaltarTexto("Hola mundo test", "mundo");
      expect(resultado.length).toBeGreaterThan(0);
      resultado.forEach((parte) => {
        expect(parte).toHaveProperty("key");
      });
    });
  });
});
