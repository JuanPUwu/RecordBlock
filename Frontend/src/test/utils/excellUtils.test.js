import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportarExcel } from "../../utils/excellUtils.js";
import { saveAs } from "file-saver";

// Mock de exceljs
vi.mock("exceljs", () => {
  const createMockColumn = () => ({
    alignment: {},
    eachCell: vi.fn((options, callback) => {
      // Simular algunas celdas
      callback({ value: "test" });
      callback({ value: "test2" });
    }),
    width: 0,
  });

  const createMockWorksheet = () => {
    const mockWorksheet = {
      columns: [],
      addRow: vi.fn(),
      getRow: vi.fn(() => ({
        font: {},
      })),
      getColumn: vi.fn(() => createMockColumn()),
    };

    // Hacer que columns sea un array con getter/setter para que funcione cuando se asigne
    Object.defineProperty(mockWorksheet, "columns", {
      get: function () {
        return this._columns || [];
      },
      set: function (value) {
        // Cuando se asignan columnas, asegurarse de que cada una tenga eachCell
        this._columns = value.map(() => createMockColumn());
      },
      enumerable: true,
      configurable: true,
    });

    return mockWorksheet;
  };

  const mockWorkbookConstructor = vi.fn(function Workbook() {
    return {
      addWorksheet: vi.fn(() => createMockWorksheet()),
      xlsx: {
        writeBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(100)),
      },
    };
  });

  mockWorkbookConstructor.Workbook = mockWorkbookConstructor;

  return {
    default: {
      Workbook: mockWorkbookConstructor,
    },
    Workbook: mockWorkbookConstructor,
    __mockWorkbookConstructor: mockWorkbookConstructor,
  };
});

// Mock de file-saver
vi.mock("file-saver", () => ({
  saveAs: vi.fn(),
}));

describe("excellUtils", () => {
  let mockWorkbookConstructor;

  beforeEach(async () => {
    vi.clearAllMocks();
    const exceljsModule = await import("exceljs");
    mockWorkbookConstructor =
      exceljsModule.__mockWorkbookConstructor || exceljsModule.default.Workbook;
  });

  it("debe exportar Excel correctamente con datos válidos", async () => {
    const whichInfo = [
      {
        info_id: 1,
        usuario_id: 1,
        datos: [{ Modelo: "Dell XPS", Serial: "ABC123" }],
      },
    ];

    const opcionesClientes = [{ value: 1, label: "Cliente Test" }];

    await exportarExcel(whichInfo, opcionesClientes);

    expect(mockWorkbookConstructor).toHaveBeenCalled();
    expect(saveAs).toHaveBeenCalled();
  }, 10000);

  it("debe manejar múltiples clientes", async () => {
    const whichInfo = [
      {
        info_id: 1,
        usuario_id: 1,
        datos: [{ Modelo: "Dell XPS" }],
      },
      {
        info_id: 2,
        usuario_id: 2,
        datos: [{ Modelo: "HP Elite" }],
      },
    ];

    const opcionesClientes = [
      { value: 1, label: "Cliente 1" },
      { value: 2, label: "Cliente 2" },
    ];

    await exportarExcel(whichInfo, opcionesClientes);

    expect(saveAs).toHaveBeenCalled();
  }, 10000);

  it("debe manejar datos vacíos", async () => {
    await exportarExcel([], []);

    expect(mockWorkbookConstructor).toHaveBeenCalled();
    expect(saveAs).toHaveBeenCalled();
  }, 10000);

  it("debe manejar errores correctamente", async () => {
    mockWorkbookConstructor.mockImplementationOnce(() => {
      throw new Error("Error al crear Excel");
    });

    await expect(exportarExcel([], [])).resolves.not.toThrow();
  });

  it("debe manejar opcionesClientes como objeto único", async () => {
    const whichInfo = [
      {
        info_id: 1,
        usuario_id: 1,
        datos: [{ Modelo: "Dell XPS" }],
      },
    ];

    const opcionesClientes = { value: 1, label: "Cliente Test" };

    await exportarExcel(whichInfo, opcionesClientes);

    expect(saveAs).toHaveBeenCalled();
  }, 10000);
});
