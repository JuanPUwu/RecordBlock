import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useDatosMinimosAdmin } from "../../hooks/useDatosMinimosAdmin.js";
import toast from "react-hot-toast";

// Mock del servicio
const mockObtenerDatosMinimos = vi.fn();
const mockRemplazarDatosMinimos = vi.fn();

vi.mock("../../services/datosMinimos.js", () => ({
  useDatosMinimosService: () => ({
    obtenerDatosMinimos: mockObtenerDatosMinimos,
    remplazarDatosMinimos: mockRemplazarDatosMinimos,
  }),
}));

// Mock de toast
vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("useDatosMinimosAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe inicializar con estados vacíos", () => {
    const { result } = renderHook(() => useDatosMinimosAdmin());

    expect(result.current.datosMinimos).toEqual([]);
    expect(result.current.draftDatosMinimos).toEqual([]);
  });

  it("debe obtener datos mínimos correctamente", async () => {
    mockObtenerDatosMinimos.mockResolvedValue({
      data: {
        data: ["Modelo", "Serial"],
      },
    });

    const { result } = renderHook(() => useDatosMinimosAdmin());
    const setIsLoading = vi.fn();
    const setDraftCrear = vi.fn();

    await act(async () => {
      await result.current.obtenerDatosMin(setIsLoading, setDraftCrear);
    });

    expect(mockObtenerDatosMinimos).toHaveBeenCalled();
    expect(result.current.datosMinimos).toEqual(["Modelo", "Serial"]);
    expect(setDraftCrear).toHaveBeenCalledWith([
      { key: "Modelo", value: "" },
      { key: "Serial", value: "" },
      { key: "", value: "" },
    ]);
  });

  it("debe inicializar draft cuando se abre el popup", () => {
    const { result } = renderHook(() => useDatosMinimosAdmin());

    act(() => {
      result.current.inicializarDraft(true);
    });

    expect(result.current.draftDatosMinimos).toEqual([""]);
  });

  it("debe inicializar draft con datos mínimos existentes", async () => {
    mockObtenerDatosMinimos.mockResolvedValue({
      data: {
        data: ["Modelo", "Serial"],
      },
    });

    const { result } = renderHook(() => useDatosMinimosAdmin());
    const setIsLoading = vi.fn();
    const setDraftCrear = vi.fn();

    await act(async () => {
      await result.current.obtenerDatosMin(setIsLoading, setDraftCrear);
    });

    act(() => {
      result.current.inicializarDraft(true);
    });

    expect(result.current.draftDatosMinimos).toEqual(["Modelo", "Serial"]);
  });

  it("debe limpiar draft cuando se cierra el popup", () => {
    const { result } = renderHook(() => useDatosMinimosAdmin());

    act(() => {
      result.current.inicializarDraft(true);
    });

    act(() => {
      result.current.inicializarDraft(false);
    });

    expect(result.current.draftDatosMinimos).toEqual([]);
  });

  it("debe cambiar un dato mínimo", () => {
    const { result } = renderHook(() => useDatosMinimosAdmin());

    act(() => {
      result.current.inicializarDraft(true);
    });

    act(() => {
      result.current.cambiarDatoMinimo(0, "Nuevo Modelo");
    });

    expect(result.current.draftDatosMinimos[0]).toBe("Nuevo Modelo");
  });

  it("debe eliminar un dato mínimo cuando hay más de uno", () => {
    const { result } = renderHook(() => useDatosMinimosAdmin());

    act(() => {
      result.current.setDraftDatosMinimos(["Modelo", "Serial"]);
    });

    act(() => {
      result.current.eliminarDatoMinimo(0);
    });

    expect(result.current.draftDatosMinimos).toEqual(["Serial"]);
  });

  it("debe resetear a vacío si solo queda un elemento al eliminar", () => {
    const { result } = renderHook(() => useDatosMinimosAdmin());

    act(() => {
      result.current.setDraftDatosMinimos(["Modelo"]);
    });

    act(() => {
      result.current.eliminarDatoMinimo(0);
    });

    expect(result.current.draftDatosMinimos).toEqual([""]);
  });

  it("debe agregar un nuevo dato mínimo", () => {
    const { result } = renderHook(() => useDatosMinimosAdmin());

    act(() => {
      result.current.setDraftDatosMinimos(["Modelo"]);
    });

    act(() => {
      result.current.agregarDatoMinimo();
    });

    expect(result.current.draftDatosMinimos).toEqual(["Modelo", ""]);
  });

  it("no debe agregar un nuevo dato si hay uno vacío", () => {
    const { result } = renderHook(() => useDatosMinimosAdmin());

    act(() => {
      result.current.setDraftDatosMinimos(["Modelo", ""]);
    });

    act(() => {
      result.current.agregarDatoMinimo();
    });

    expect(result.current.draftDatosMinimos).toEqual(["Modelo", ""]);
    expect(toast.error).toHaveBeenCalledWith(
      "Completa el dato vacío\nantes de agregar uno nuevo"
    );
  });

  it("debe guardar datos mínimos correctamente", async () => {
    mockObtenerDatosMinimos.mockResolvedValue({
      data: {
        data: ["Modelo", "Serial"],
      },
    });

    mockRemplazarDatosMinimos.mockResolvedValue({
      success: true,
    });

    const { result } = renderHook(() => useDatosMinimosAdmin());
    const setIsLoading = vi.fn();
    const setDraftCrear = vi.fn();

    await act(async () => {
      await result.current.obtenerDatosMin(setIsLoading, setDraftCrear);
    });

    act(() => {
      result.current.setDraftDatosMinimos(["Modelo", "Serial", "Nuevo"]);
    });

    let success;
    await act(async () => {
      success = await result.current.guardarDatosMinimos(
        setIsLoading,
        result.current.obtenerDatosMin,
        setDraftCrear
      );
    });

    expect(mockRemplazarDatosMinimos).toHaveBeenCalledWith([
      "Modelo",
      "Serial",
      "Nuevo",
    ]);
    expect(success).toBe(true);
    expect(toast.success).toHaveBeenCalledWith("Datos mínimos guardados");
  });

  it("debe detectar cuando no hay cambios", async () => {
    mockObtenerDatosMinimos.mockResolvedValue({
      data: {
        data: ["Modelo", "Serial"],
      },
    });

    const { result } = renderHook(() => useDatosMinimosAdmin());
    const setIsLoading = vi.fn();
    const setDraftCrear = vi.fn();

    await act(async () => {
      await result.current.obtenerDatosMin(setIsLoading, setDraftCrear);
    });

    act(() => {
      result.current.setDraftDatosMinimos(["Modelo", "Serial"]);
    });

    let success;
    await act(async () => {
      success = await result.current.guardarDatosMinimos(
        setIsLoading,
        result.current.obtenerDatosMin,
        setDraftCrear
      );
    });

    expect(mockRemplazarDatosMinimos).not.toHaveBeenCalled();
    expect(success).toBe(true);
    expect(toast.success).toHaveBeenCalledWith(
      "No se detectaron cambios en los datos mínimos"
    );
  });

  it("debe rechazar datos con emojis", async () => {
    mockObtenerDatosMinimos.mockResolvedValue({
      data: {
        data: ["Modelo"],
      },
    });

    const { result } = renderHook(() => useDatosMinimosAdmin());
    const setIsLoading = vi.fn();
    const setDraftCrear = vi.fn();

    await act(async () => {
      await result.current.obtenerDatosMin(setIsLoading, setDraftCrear);
    });

    act(() => {
      result.current.setDraftDatosMinimos(["Modelo 😀"]);
    });

    await act(async () => {
      await result.current.guardarDatosMinimos(
        setIsLoading,
        result.current.obtenerDatosMin,
        setDraftCrear
      );
    });

    expect(mockRemplazarDatosMinimos).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(
      'El dato "Modelo 😀" contiene emojis, no es válido'
    );
  });

  it("debe rechazar datos duplicados", async () => {
    mockObtenerDatosMinimos.mockResolvedValue({
      data: {
        data: ["Modelo"],
      },
    });

    const { result } = renderHook(() => useDatosMinimosAdmin());
    const setIsLoading = vi.fn();
    const setDraftCrear = vi.fn();

    await act(async () => {
      await result.current.obtenerDatosMin(setIsLoading, setDraftCrear);
    });

    act(() => {
      result.current.setDraftDatosMinimos(["Modelo", "modelo"]);
    });

    await act(async () => {
      await result.current.guardarDatosMinimos(
        setIsLoading,
        result.current.obtenerDatosMin,
        setDraftCrear
      );
    });

    expect(mockRemplazarDatosMinimos).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('El dato "modelo" ya existe');
  });

  it("debe manejar errores al guardar", async () => {
    mockObtenerDatosMinimos.mockResolvedValue({
      data: {
        data: ["Modelo"],
      },
    });

    mockRemplazarDatosMinimos.mockResolvedValue({
      success: false,
      error: "Error al guardar",
    });

    const { result } = renderHook(() => useDatosMinimosAdmin());
    const setIsLoading = vi.fn();
    const setDraftCrear = vi.fn();

    await act(async () => {
      await result.current.obtenerDatosMin(setIsLoading, setDraftCrear);
    });

    act(() => {
      result.current.setDraftDatosMinimos(["Nuevo"]);
    });

    let success;
    await act(async () => {
      success = await result.current.guardarDatosMinimos(
        setIsLoading,
        result.current.obtenerDatosMin,
        setDraftCrear
      );
    });

    expect(success).toBe(false);
  });
});

