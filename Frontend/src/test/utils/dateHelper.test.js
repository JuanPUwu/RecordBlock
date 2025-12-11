import { describe, it, expect } from "vitest";
import { parseDateDMY } from "../../utils/dateHelper";

describe("dateHelper", () => {
  describe("parseDateDMY", () => {
    it("debe parsear fecha con separador / correctamente", () => {
      const fecha = parseDateDMY("15/03/2024");
      expect(fecha).toBeInstanceOf(Date);
      expect(fecha.getDate()).toBe(15);
      expect(fecha.getMonth()).toBe(2); // Marzo es mes 2 (0-indexed)
      expect(fecha.getFullYear()).toBe(2024);
    });

    it("debe parsear fecha con separador - correctamente", () => {
      const fecha = parseDateDMY("15-03-2024");
      expect(fecha).toBeInstanceOf(Date);
      expect(fecha.getDate()).toBe(15);
      expect(fecha.getMonth()).toBe(2);
      expect(fecha.getFullYear()).toBe(2024);
    });

    it("debe retornar null para string sin separador válido", () => {
      expect(parseDateDMY("15032024")).toBeNull();
      expect(parseDateDMY("15 03 2024")).toBeNull();
    });

    it("debe retornar null para string vacío", () => {
      expect(parseDateDMY("")).toBeNull();
    });

    it("debe retornar null para fecha inválida (mes fuera de rango)", () => {
      expect(parseDateDMY("15/13/2024")).toBeNull();
      expect(parseDateDMY("15/0/2024")).toBeNull();
    });

    it("debe retornar null para día fuera de rango", () => {
      expect(parseDateDMY("32/03/2024")).toBeNull();
      expect(parseDateDMY("0/03/2024")).toBeNull();
    });

    it("debe retornar null para fecha inválida (día que no existe)", () => {
      expect(parseDateDMY("31/02/2024")).toBeNull(); // Febrero no tiene 31 días
      expect(parseDateDMY("30/02/2024")).toBeNull(); // Febrero no tiene 30 días (excepto en años bisiestos)
    });

    it("debe validar fecha correctamente (29 de febrero en año bisiesto)", () => {
      const fecha = parseDateDMY("29/02/2024");
      expect(fecha).toBeInstanceOf(Date);
      expect(fecha.getDate()).toBe(29);
      expect(fecha.getMonth()).toBe(1); // Febrero es mes 1
      expect(fecha.getFullYear()).toBe(2024);
    });

    it("debe retornar null para 29 de febrero en año no bisiesto", () => {
      expect(parseDateDMY("29/02/2023")).toBeNull();
    });

    it("debe manejar diferentes formatos de año", () => {
      const fecha1 = parseDateDMY("01/01/2000");
      expect(fecha1).toBeInstanceOf(Date);
      expect(fecha1.getFullYear()).toBe(2000);

      const fecha2 = parseDateDMY("01/01/2099");
      expect(fecha2).toBeInstanceOf(Date);
      expect(fecha2.getFullYear()).toBe(2099);
    });

    it("debe retornar null para string con formato incorrecto", () => {
      expect(parseDateDMY("15/03")).toBeNull();
      expect(parseDateDMY("15")).toBeNull();
      expect(parseDateDMY("abc/def/ghi")).toBeNull();
    });

    it("debe manejar días y meses con un solo dígito", () => {
      const fecha = parseDateDMY("5/3/2024");
      expect(fecha).toBeInstanceOf(Date);
      expect(fecha.getDate()).toBe(5);
      expect(fecha.getMonth()).toBe(2);
    });
  });
});
