import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useLogout } from "../../hooks/useLogout";
import Swal from "sweetalert2";

// Mock de sweetalert2
vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn(),
  },
}));

// Mock de swalStyles
vi.mock("../../css/swalStyles.js", () => ({
  default: {},
}));

describe("useLogout", () => {
  const mockLogout = vi.fn();
  const mockSetIsLoading = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe retornar la función cerrarSesion", () => {
    const { result } = renderHook(() =>
      useLogout(mockLogout, mockSetIsLoading)
    );

    expect(result.current.cerrarSesion).toBeDefined();
    expect(typeof result.current.cerrarSesion).toBe("function");
  });

  it("debe mostrar confirmación antes de cerrar sesión", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: false });

    const { result } = renderHook(() =>
      useLogout(mockLogout, mockSetIsLoading)
    );

    await result.current.cerrarSesion();

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "¿Estás seguro de cerrar sesión?",
        text: "Tendrás que iniciar sesión nuevamente",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, Salir",
        cancelButtonText: "No, Volver",
      })
    );
  });

  it("debe llamar a logout cuando se confirma", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    mockLogout.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useLogout(mockLogout, mockSetIsLoading)
    );

    await result.current.cerrarSesion();

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  it("no debe llamar a logout cuando se cancela", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: false });

    const { result } = renderHook(() =>
      useLogout(mockLogout, mockSetIsLoading)
    );

    await result.current.cerrarSesion();

    expect(mockLogout).not.toHaveBeenCalled();
  });

  it("debe establecer isLoading a true antes de logout", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    mockLogout.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { result } = renderHook(() =>
      useLogout(mockLogout, mockSetIsLoading)
    );

    result.current.cerrarSesion();

    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    });
  });

  it("debe establecer isLoading a false después de logout", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    mockLogout.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useLogout(mockLogout, mockSetIsLoading)
    );

    await result.current.cerrarSesion();

    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });
  });

  it("debe manejar errores en logout", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockLogout.mockRejectedValue(new Error("Error de logout"));

    const { result } = renderHook(() =>
      useLogout(mockLogout, mockSetIsLoading)
    );

    await result.current.cerrarSesion();

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });

    consoleErrorSpy.mockRestore();
  });
});
