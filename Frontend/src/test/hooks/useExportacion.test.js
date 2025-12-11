import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useExportacion } from "../../hooks/useExportacion";

// Mock de los módulos de exportación
const mockExportarPDF = vi.fn();
const mockExportarExcel = vi.fn();

vi.mock("../../utils/pdfUtils.js", () => ({
  exportarPDF: mockExportarPDF,
}));

vi.mock("../../utils/excellUtils.js", () => ({
  exportarExcel: mockExportarExcel,
}));

describe("useExportacion", () => {
  const mockSetIsLoading = vi.fn();
  const whichInfo = [];
  const opcionesClientes = [];

  beforeEach(() => {
    vi.clearAllMocks();
    mockExportarPDF.mockResolvedValue(undefined);
    mockExportarExcel.mockResolvedValue(undefined);
  });

  it("debe retornar las funciones de exportación", () => {
    const { result } = renderHook(() =>
      useExportacion(whichInfo, opcionesClientes, mockSetIsLoading)
    );

    expect(result.current.exportarComoPDF).toBeDefined();
    expect(result.current.exportarComoExcell).toBeDefined();
  });

  it("debe llamar a exportarPDF cuando se ejecuta exportarComoPDF", async () => {
    const { result } = renderHook(() =>
      useExportacion(whichInfo, opcionesClientes, mockSetIsLoading)
    );

    await result.current.exportarComoPDF();

    await waitFor(() => {
      expect(mockExportarPDF).toHaveBeenCalledWith(whichInfo, opcionesClientes);
    });
  });

  it("debe establecer isLoading a true antes de exportar PDF", async () => {
    mockExportarPDF.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { result } = renderHook(() =>
      useExportacion(whichInfo, opcionesClientes, mockSetIsLoading)
    );

    result.current.exportarComoPDF();

    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    });
  });

  it("debe establecer isLoading a false después de exportar PDF", async () => {
    const { result } = renderHook(() =>
      useExportacion(whichInfo, opcionesClientes, mockSetIsLoading)
    );

    await result.current.exportarComoPDF();

    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });
  });

  it("debe llamar a exportarExcel cuando se ejecuta exportarComoExcell", async () => {
    const { result } = renderHook(() =>
      useExportacion(whichInfo, opcionesClientes, mockSetIsLoading)
    );

    await result.current.exportarComoExcell();

    await waitFor(() => {
      expect(mockExportarExcel).toHaveBeenCalledWith(whichInfo, opcionesClientes);
    });
  });

  it("debe manejar errores en exportarComoPDF", async () => {
    mockExportarPDF.mockRejectedValue(new Error("Error de exportación"));

    const { result } = renderHook(() =>
      useExportacion(whichInfo, opcionesClientes, mockSetIsLoading)
    );

    await expect(result.current.exportarComoPDF()).rejects.toThrow();

    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });
  });

  it("debe manejar errores en exportarComoExcell", async () => {
    mockExportarExcel.mockRejectedValue(new Error("Error de exportación"));

    const { result } = renderHook(() =>
      useExportacion(whichInfo, opcionesClientes, mockSetIsLoading)
    );

    await expect(result.current.exportarComoExcell()).rejects.toThrow();

    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });
  });
});
