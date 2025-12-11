import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useEditarInfo } from "../../hooks/useEditarInfo.js";
import toast from "react-hot-toast";

// Mock del servicio
const mockActualizarInformacion = vi.fn();

vi.mock("../../services/infoUsuarioServices.js", () => ({
  useInfoUsuarioService: () => ({
    actualizarInformacion: mockActualizarInformacion,
  }),
}));

// Mock de toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useEditarInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe inicializar con estados vacíos", () => {
    const cargarInformacion = vi.fn();

    const { result } = renderHook(() => useEditarInfo(cargarInformacion));

    expect(result.current.infoSeleccionada).toBeNull();
    expect(result.current.infoAEditar).toBeNull();
    expect(result.current.draftDatos).toEqual([]);
  });

  it("debe actualizar draft cuando se establece infoAEditar", () => {
    const cargarInformacion = vi.fn();
    const { result } = renderHook(() => useEditarInfo(cargarInformacion));

    const info = {
      info_id: 1,
      usuario_id: 1,
      datos: [{ Modelo: "Dell XPS", Serial: "ABC123" }],
    };

    act(() => {
      result.current.setInfoAEditar(info);
    });

    waitFor(() => {
      expect(result.current.draftDatos.length).toBeGreaterThan(0);
    });
  });

  it("debe agregar un campo vacío adicional al draft", () => {
    const cargarInformacion = vi.fn();
    const { result } = renderHook(() => useEditarInfo(cargarInformacion));

    const info = {
      info_id: 1,
      usuario_id: 1,
      datos: [{ Modelo: "Dell XPS" }],
    };

    act(() => {
      result.current.setInfoAEditar(info);
    });

    waitFor(() => {
      const draft = result.current.draftDatos;
      expect(draft.length).toBe(2);
      expect(draft[draft.length - 1]).toEqual({ key: "", value: "" });
    });
  });

  it("debe editar registro correctamente", async () => {
    const cargarInformacion = vi.fn();
    mockActualizarInformacion.mockResolvedValue({
      success: true,
    });

    const { result } = renderHook(() => useEditarInfo(cargarInformacion));

    const info = {
      info_id: 1,
      usuario_id: 1,
      datos: [{ Modelo: "Dell XPS", Serial: "ABC123" }],
    };

    act(() => {
      result.current.setInfoSeleccionada(info);
      result.current.setInfoAEditar(info);
    });

    await waitFor(() => {
      expect(result.current.draftDatos.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.cambiarLlaveDraft(0, "Modelo");
      result.current.cambiarValorDraft(0, "HP Elite");
    });

    const setIsLoading = vi.fn();
    let success;

    await act(async () => {
      success = await result.current.editarRegistro(setIsLoading);
    });

    expect(mockActualizarInformacion).toHaveBeenCalled();
    expect(success).toBe(true);
    expect(toast.success).toHaveBeenCalledWith("Registro °1 actualizado");
    expect(cargarInformacion).toHaveBeenCalled();
  });

  it("debe retornar true si no hay cambios", async () => {
    const cargarInformacion = vi.fn();

    const { result } = renderHook(() => useEditarInfo(cargarInformacion));

    const info = {
      info_id: 1,
      usuario_id: 1,
      datos: [{ Modelo: "Dell XPS", Serial: "ABC123" }],
    };

    act(() => {
      result.current.setInfoSeleccionada(info);
      result.current.setInfoAEditar(info);
    });

    await waitFor(() => {
      expect(result.current.draftDatos.length).toBeGreaterThan(0);
    });

    const setIsLoading = vi.fn();
    let success;

    await act(async () => {
      success = await result.current.editarRegistro(setIsLoading);
    });

    expect(mockActualizarInformacion).not.toHaveBeenCalled();
    expect(success).toBe(true);
  });

  it("debe manejar errores al editar", async () => {
    const cargarInformacion = vi.fn();
    mockActualizarInformacion.mockResolvedValue({
      success: false,
      error: "Error al actualizar",
    });

    const { result } = renderHook(() => useEditarInfo(cargarInformacion));

    const info = {
      info_id: 1,
      usuario_id: 1,
      datos: [{ Modelo: "Dell XPS" }],
    };

    act(() => {
      result.current.setInfoSeleccionada(info);
      result.current.setInfoAEditar(info);
    });

    await waitFor(() => {
      expect(result.current.draftDatos.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.cambiarValorDraft(0, "HP Elite");
    });

    const setIsLoading = vi.fn();
    let success;

    await act(async () => {
      success = await result.current.editarRegistro(setIsLoading);
    });

    expect(success).toBe(false);
    expect(toast.error).toHaveBeenCalledWith("Error al actualizar");
  });

  it("debe manejar handleEditarInfo correctamente", async () => {
    const cargarInformacion = vi.fn();
    const { result } = renderHook(() => useEditarInfo(cargarInformacion));

    const info = {
      info_id: 1,
      usuario_id: 1,
      datos: [{ Modelo: "Dell XPS", Serial: "ABC123" }],
    };

    act(() => {
      result.current.handleEditarInfo(info);
    });

    await waitFor(() => {
      expect(result.current.infoSeleccionada).toEqual(info);
      expect(result.current.infoAEditar).toBeDefined();
      expect(result.current.draftDatos.length).toBeGreaterThan(0);
    });
  });

  it("debe validar draft antes de editar", async () => {
    const cargarInformacion = vi.fn();

    const { result } = renderHook(() => useEditarInfo(cargarInformacion));

    const info = {
      info_id: 1,
      usuario_id: 1,
      datos: [{ Modelo: "Dell XPS" }],
    };

    act(() => {
      result.current.setInfoSeleccionada(info);
      result.current.setInfoAEditar(info);
    });

    await waitFor(() => {
      expect(result.current.draftDatos.length).toBeGreaterThan(0);
    });

    // Hacer que el draft sea inválido (clave vacía)
    act(() => {
      result.current.cambiarLlaveDraft(0, "");
      result.current.cambiarValorDraft(0, "Valor sin clave");
    });

    const setIsLoading = vi.fn();
    let success;

    await act(async () => {
      success = await result.current.editarRegistro(setIsLoading);
    });

    expect(mockActualizarInformacion).not.toHaveBeenCalled();
    expect(success).toBe(false);
  });
});
