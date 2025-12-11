import { describe, it, expect } from "vitest";
import { parsearCSV, generarTablaCSV } from "../../utils/csvUtils";

describe("csvUtils", () => {
  describe("parsearCSV", () => {
    it("debe parsear un CSV simple correctamente", () => {
      const texto = "nombre;edad\nJuan;25\nMaría;30";
      const resultado = parsearCSV(texto);

      expect(resultado.headers).toEqual(["nombre", "edad"]);
      expect(resultado.filas).toEqual([
        ["Juan", "25"],
        ["María", "30"],
      ]);
    });

    it("debe manejar valores con comillas", () => {
      const texto = 'nombre;descripcion\nJuan;"Es un nombre"';
      const resultado = parsearCSV(texto);

      expect(resultado.headers).toEqual(["nombre", "descripcion"]);
      expect(resultado.filas[0][1]).toBe("Es un nombre");
    });

    it("debe manejar punto y coma dentro de comillas", () => {
      const texto = 'nombre;descripcion\nJuan;"Tiene; punto y coma"';
      const resultado = parsearCSV(texto);

      expect(resultado.headers).toEqual(["nombre", "descripcion"]);
      expect(resultado.filas[0][1]).toBe("Tiene; punto y coma");
    });

    it("debe retornar headers y filas vacías para texto vacío", () => {
      const resultado = parsearCSV("");
      expect(resultado.headers).toEqual([]);
      expect(resultado.filas).toEqual([]);
    });

    it("debe filtrar líneas vacías", () => {
      const texto = "nombre;edad\n\nJuan;25\n\n";
      const resultado = parsearCSV(texto);

      expect(resultado.filas.length).toBe(1);
      expect(resultado.filas[0]).toEqual(["Juan", "25"]);
    });

    it("debe eliminar espacios en blanco al inicio y final", () => {
      const texto = "nombre;edad\n  Juan  ;  25  ";
      const resultado = parsearCSV(texto);

      expect(resultado.filas[0][0]).toBe("Juan");
      expect(resultado.filas[0][1]).toBe("25");
    });
  });

  describe("generarTablaCSV", () => {
    it("debe generar tabla HTML con headers y filas", () => {
      const headers = ["nombre", "edad"];
      const filas = [
        ["Juan", "25"],
        ["María", "30"],
      ];

      const tabla = generarTablaCSV(headers, filas);

      expect(tabla).toContain("nombre");
      expect(tabla).toContain("edad");
      expect(tabla).toContain("Juan");
      expect(tabla).toContain("María");
    });

    it("debe limitar a 50 filas", () => {
      const headers = ["nombre"];
      const filas = Array.from({ length: 60 }, (_, i) => [`Fila ${i}`]);

      const tabla = generarTablaCSV(headers, filas);

      expect(tabla).toContain("Mostrando 50 de 60 filas");
    });

    it("no debe mostrar mensaje cuando hay menos de 50 filas", () => {
      const headers = ["nombre"];
      const filas = Array.from({ length: 30 }, (_, i) => [`Fila ${i}`]);

      const tabla = generarTablaCSV(headers, filas);

      expect(tabla).not.toContain("Mostrando");
    });

    it("debe incluir atributo title en las celdas", () => {
      const headers = ["nombre"];
      const filas = [["Juan"]];

      const tabla = generarTablaCSV(headers, filas);

      expect(tabla).toContain('title="Juan"');
    });

    it("debe manejar valores vacíos", () => {
      const headers = ["nombre", "edad"];
      const filas = [["Juan", ""]];

      const tabla = generarTablaCSV(headers, filas);

      expect(tabla).toContain("<td");
    });
  });
});
