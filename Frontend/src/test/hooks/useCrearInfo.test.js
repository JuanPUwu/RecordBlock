import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCrearInfo } from "../../hooks/useCrearInfo.js";
import toast from "react-hot-toast";

// Mock del servicio
const mockCrearInformacion = vi.fn();

vi.mock("../../services/infoUsuarioServices.js", () => ({
  useInfoUsuarioService: () => ({
    crearInformacion: mockCrearInformacion,
  }),
}));

// Mock de toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useCrearInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe inicializar con estados vacíos", () => {
    const clienteSeleccionado = { value: 1 };
    const cargarInformacion = vi.fn();

    const { result } = renderHook(() =>
      useCrearInfo(clienteSeleccionado, cargarInformacion)
    );

    expect(result.current.draftCrear).toEqual([]);
  });

  it("debe crear registro correctamente", async () => {
    const clienteSeleccionado = { value: 1 };
    const cargarInformacion = vi.fn();
    mockCrearInformacion.mockResolvedValue({
      success: true,
    });

    const { result } = renderHook(() =>
      useCrearInfo(clienteSeleccionado, cargarInformacion)
    );

    act(() => {
      result.current.setDraftCrear([
        { key: "Modelo", value: "Dell XPS" },
        { key: "Serial", value: "ABC123" },
      ]);
    });

    const setIsLoading = vi.fn();
    let success;

    await act(async () => {
      success = await result.current.crearRegistro(setIsLoading);
    });

    expect(mockCrearInformacion).toHaveBeenCalledWith({
      usuario_id: 1,
      datos: {
        Modelo: "Dell XPS",
        Serial: "ABC123",
      },
    });
    expect(success).toBe(true);
    expect(toast.success).toHaveBeenCalledWith("Registro creado con éxito");
    expect(cargarInformacion).toHaveBeenCalled();
  });

  it("debe manejar errores al crear", async () => {
    const clienteSeleccionado = { value: 1 };
    const cargarInformacion = vi.fn();
    mockCrearInformacion.mockResolvedValue({
      success: false,
      error: "Error al crear",
    });

    const { result } = renderHook(() =>
      useCrearInfo(clienteSeleccionado, cargarInformacion)
    );

    act(() => {
      result.current.setDraftCrear([
        { key: "Modelo", value: "Dell XPS" },
      ]);
    });

    const setIsLoading = vi.fn();
    let success;

    await act(async () => {
      success = await result.current.crearRegistro(setIsLoading);
    });

    expect(success).toBe(false);
    expect(toast.error).toHaveBeenCalledWith("Error al crear");
  });

  it("debe validar draft antes de crear", async () => {
    const clienteSeleccionado = { value: 1 };
    const cargarInformacion = vi.fn();

    const { result } = renderHook(() =>
      useCrearInfo(clienteSeleccionado, cargarInformacion)
    );

    // Draft inválido: clave vacía
    act(() => {
      result.current.setDraftCrear([
        { key: "", value: "Valor sin clave" },
      ]);
    });

    const setIsLoading = vi.fn();
    let success;

    await act(async () => {
      success = await result.current.crearRegistro(setIsLoading);
    });

    expect(mockCrearInformacion).not.toHaveBeenCalled();
    expect(success).toBe(false);
  });

  it("debe permitir cambiar claves y valores", () => {
    const clienteSeleccionado = { value: 1 };
    const cargarInformacion = vi.fn();

    const { result } = renderHook(() =>
      useCrearInfo(clienteSeleccionado, cargarInformacion)
    );

    act(() => {
      result.current.setDraftCrear([
        { key: "Modelo", value: "Dell XPS" },
      ]);
    });

    act(() => {
      result.current.cambiarLlaveCrear(0, "Serial");
      result.current.cambiarValorCrear(0, "ABC123");
    });

    expect(result.current.draftCrear[0].key).toBe("Serial");
    expect(result.current.draftCrear[0].value).toBe("ABC123");
  });

  it("debe permitir agregar y eliminar datos", () => {
    const clienteSeleccionado = { value: 1 };
    const cargarInformacion = vi.fn();

    const { result } = renderHook(() =>
      useCrearInfo(clienteSeleccionado, cargarInformacion)
    );

    act(() => {
      result.current.setDraftCrear([
        { key: "Modelo", value: "Dell XPS" },
      ]);
    });

    act(() => {
      result.current.agregarDatoCrear();
    });

    expect(result.current.draftCrear.length).toBe(2);

    act(() => {
      result.current.eliminarDatoCrear(1);
    });

    expect(result.current.draftCrear.length).toBe(1);
  });
});

