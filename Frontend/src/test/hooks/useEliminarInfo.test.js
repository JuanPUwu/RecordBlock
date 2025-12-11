import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useEliminarInfo } from "../../hooks/useEliminarInfo";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

// Mock de sweetalert2
vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn(),
  },
}));

// Mock de react-hot-toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock de swalStyles
vi.mock("../../css/swalStyles.js", () => ({
  default: {},
}));

// Mock del servicio
const mockEliminarInformacion = vi.fn();

vi.mock("../../services/infoUsuarioServices.js", () => ({
  useInfoUsuarioService: () => ({
    eliminarInformacion: mockEliminarInformacion,
  }),
}));

describe("useEliminarInfo", () => {
  const mockCargarInformacion = vi.fn();
  const mockSetIsLoading = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe retornar la función eliminarInformacionCliente", () => {
    const { result } = renderHook(() =>
      useEliminarInfo(mockCargarInformacion, mockSetIsLoading)
    );

    expect(result.current.eliminarInformacionCliente).toBeDefined();
    expect(typeof result.current.eliminarInformacionCliente).toBe("function");
  });

  it("debe mostrar confirmación antes de eliminar", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: false });

    const { result } = renderHook(() =>
      useEliminarInfo(mockCargarInformacion, mockSetIsLoading)
    );

    const info = { info_id: 1, usuario_id: 1 };
    await result.current.eliminarInformacionCliente(info);

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "¿Estás seguro de eliminar el registro °1?",
        text: "Esta acción es irreversible",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, Eliminar",
        cancelButtonText: "Cancelar",
      })
    );
  });

  it("debe llamar a eliminarInformacion cuando se confirma", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    mockEliminarInformacion.mockResolvedValue({ success: true });

    const { result } = renderHook(() =>
      useEliminarInfo(mockCargarInformacion, mockSetIsLoading)
    );

    const info = { info_id: 1, usuario_id: 1 };
    await result.current.eliminarInformacionCliente(info);

    await waitFor(() => {
      expect(mockEliminarInformacion).toHaveBeenCalledWith({
        info_id: 1,
        usuario_id: 1,
      });
    });
  });

  it("no debe eliminar cuando se cancela", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: false });

    const { result } = renderHook(() =>
      useEliminarInfo(mockCargarInformacion, mockSetIsLoading)
    );

    const info = { info_id: 1, usuario_id: 1 };
    await result.current.eliminarInformacionCliente(info);

    expect(mockEliminarInformacion).not.toHaveBeenCalled();
  });

  it("debe mostrar toast de éxito cuando se elimina correctamente", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    mockEliminarInformacion.mockResolvedValue({ success: true });

    const { result } = renderHook(() =>
      useEliminarInfo(mockCargarInformacion, mockSetIsLoading)
    );

    const info = { info_id: 1, usuario_id: 1 };
    await result.current.eliminarInformacionCliente(info);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Registro °1 eliminado");
    });
  });

  it("debe llamar a cargarInformacion después de eliminar exitosamente", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    mockEliminarInformacion.mockResolvedValue({ success: true });

    const { result } = renderHook(() =>
      useEliminarInfo(mockCargarInformacion, mockSetIsLoading)
    );

    const info = { info_id: 1, usuario_id: 1 };
    await result.current.eliminarInformacionCliente(info);

    await waitFor(() => {
      expect(mockCargarInformacion).toHaveBeenCalledTimes(1);
    });
  });

  it("debe mostrar toast de error cuando falla la eliminación", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    mockEliminarInformacion.mockResolvedValue({
      success: false,
      error: "Error al eliminar",
    });

    const { result } = renderHook(() =>
      useEliminarInfo(mockCargarInformacion, mockSetIsLoading)
    );

    const info = { info_id: 1, usuario_id: 1 };
    await result.current.eliminarInformacionCliente(info);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error al eliminar");
    });
  });

  it("debe establecer isLoading correctamente", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    mockEliminarInformacion.mockResolvedValue({ success: true });

    const { result } = renderHook(() =>
      useEliminarInfo(mockCargarInformacion, mockSetIsLoading)
    );

    const info = { info_id: 1, usuario_id: 1 };
    result.current.eliminarInformacionCliente(info);

    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(true);
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });
  });
});
