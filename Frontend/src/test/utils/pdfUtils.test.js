import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportarPDF } from "../../utils/pdfUtils.js";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";

// Mock de pdf-lib
vi.mock("pdf-lib", () => ({
  PDFDocument: {
    load: vi.fn(),
  },
  StandardFonts: {
    Helvetica: "Helvetica",
    HelveticaBold: "HelveticaBold",
  },
  rgb: vi.fn((r, g, b) => ({ r, g, b })),
}));

// Mock de file-saver
vi.mock("file-saver", () => ({
  saveAs: vi.fn(),
}));

// Mock de fetch para la plantilla PDF
globalThis.fetch = vi.fn();

describe("pdfUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe exportar PDF correctamente con datos válidos", async () => {
    // Mock de la plantilla PDF
    const mockPdfBytes = new ArrayBuffer(100);
    globalThis.fetch.mockResolvedValue({
      arrayBuffer: vi.fn().mockResolvedValue(mockPdfBytes),
    });

    // Mock de PDFDocument
    const mockPage = {
      getWidth: vi.fn().mockReturnValue(800),
      getHeight: vi.fn().mockReturnValue(600),
      drawText: vi.fn(),
      drawRectangle: vi.fn(),
    };

    const mockFont = {
      widthOfTextAtSize: vi.fn().mockReturnValue(100),
    };

    const mockPdfDoc = {
      getPage: vi.fn().mockReturnValue(mockPage),
      embedFont: vi.fn().mockResolvedValue(mockFont),
      addPage: vi.fn(),
      copyPages: vi.fn().mockResolvedValue([[mockPage]]),
      save: vi.fn().mockResolvedValue(new ArrayBuffer(200)),
    };

    PDFDocument.load = vi.fn().mockResolvedValue(mockPdfDoc);

    const whichInfo = [
      {
        info_id: 1,
        usuario_id: 1,
        datos: [{ Modelo: "Dell XPS", Serial: "ABC123" }],
      },
    ];

    const opcionesClientes = [{ value: 1, label: "Cliente Test" }];

    await exportarPDF(whichInfo, opcionesClientes);

    expect(globalThis.fetch).toHaveBeenCalled();
    expect(PDFDocument.load).toHaveBeenCalled();
    expect(mockPdfDoc.save).toHaveBeenCalled();
    expect(saveAs).toHaveBeenCalled();
  });

  it("debe manejar errores correctamente", async () => {
    globalThis.fetch.mockRejectedValue(new Error("Error al cargar plantilla"));

    const whichInfo = [];
    const opcionesClientes = [];

    await expect(
      exportarPDF(whichInfo, opcionesClientes)
    ).resolves.not.toThrow();
  });

  it("debe manejar múltiples clientes", async () => {
    const mockPdfBytes = new ArrayBuffer(100);
    globalThis.fetch.mockResolvedValue({
      arrayBuffer: vi.fn().mockResolvedValue(mockPdfBytes),
    });

    const mockPage = {
      getWidth: vi.fn().mockReturnValue(800),
      getHeight: vi.fn().mockReturnValue(600),
      drawText: vi.fn(),
      drawRectangle: vi.fn(),
    };

    const mockFont = {
      widthOfTextAtSize: vi.fn().mockReturnValue(100),
    };

    const mockPdfDoc = {
      getPage: vi.fn().mockReturnValue(mockPage),
      embedFont: vi.fn().mockResolvedValue(mockFont),
      addPage: vi.fn(),
      copyPages: vi.fn().mockResolvedValue([[mockPage]]),
      save: vi.fn().mockResolvedValue(new ArrayBuffer(200)),
    };

    PDFDocument.load = vi.fn().mockResolvedValue(mockPdfDoc);

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

    await exportarPDF(whichInfo, opcionesClientes);

    expect(mockPdfDoc.save).toHaveBeenCalled();
  });

  it("debe manejar datos vacíos", async () => {
    const mockPdfBytes = new ArrayBuffer(100);
    globalThis.fetch.mockResolvedValue({
      arrayBuffer: vi.fn().mockResolvedValue(mockPdfBytes),
    });

    const mockPage = {
      getWidth: vi.fn().mockReturnValue(800),
      getHeight: vi.fn().mockReturnValue(600),
      drawText: vi.fn(),
      drawRectangle: vi.fn(),
    };

    const mockFont = {
      widthOfTextAtSize: vi.fn().mockReturnValue(100),
    };

    const mockPdfDoc = {
      getPage: vi.fn().mockReturnValue(mockPage),
      embedFont: vi.fn().mockResolvedValue(mockFont),
      addPage: vi.fn(),
      copyPages: vi.fn().mockResolvedValue([[mockPage]]),
      save: vi.fn().mockResolvedValue(new ArrayBuffer(200)),
    };

    PDFDocument.load = vi.fn().mockResolvedValue(mockPdfDoc);

    await exportarPDF([], []);

    expect(mockPdfDoc.save).toHaveBeenCalled();
  });
});
