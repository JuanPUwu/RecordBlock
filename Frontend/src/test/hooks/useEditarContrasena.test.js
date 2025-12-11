import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEditarContrasena } from "../../hooks/useEditarContrasena.js";
import toast from "react-hot-toast";

// Mock del servicio
const mockActualizarUsuario = vi.fn();

vi.mock("../../services/usuarioService.js", () => ({
  useUsuarioService: () => ({
    actualizarUsuario: mockActualizarUsuario,
  }),
}));

// Mock de toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useEditarContrasena", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe retornar editarContraseña", () => {
    const setIsLoading = vi.fn();

    const { result } = renderHook(() => useEditarContrasena(setIsLoading));

    expect(result.current.editarContraseña).toBeDefined();
  });

  it("debe editar contraseña correctamente", async () => {
    const setIsLoading = vi.fn();
    mockActualizarUsuario.mockResolvedValue({
      success: true,
    });

    const { result } = renderHook(() => useEditarContrasena(setIsLoading));

    const usuarioSeleccionado = { id: 1 };
    const data = { password: "nuevaPassword123" };
    const onSuccess = vi.fn();

    await act(async () => {
      await result.current.editarContraseña(usuarioSeleccionado, data, onSuccess);
    });

    expect(mockActualizarUsuario).toHaveBeenCalledWith(1, "nuevaPassword123");
    expect(setIsLoading).toHaveBeenCalledWith(false);
    expect(toast.success).toHaveBeenCalledWith("Contraseña cambiada con éxito");
    expect(onSuccess).toHaveBeenCalled();
  });

  it("debe manejar errores al editar contraseña", async () => {
    const setIsLoading = vi.fn();
    mockActualizarUsuario.mockResolvedValue({
      success: false,
      error: "Error al cambiar contraseña",
    });

    const { result } = renderHook(() => useEditarContrasena(setIsLoading));

    const usuarioSeleccionado = { id: 1 };
    const data = { password: "nuevaPassword123" };
    const onSuccess = vi.fn();

    await act(async () => {
      await result.current.editarContraseña(usuarioSeleccionado, data, onSuccess);
    });

    expect(setIsLoading).toHaveBeenCalledWith(false);
    expect(toast.error).toHaveBeenCalledWith("Error al cambiar contraseña");
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("debe funcionar sin onSuccess", async () => {
    const setIsLoading = vi.fn();
    mockActualizarUsuario.mockResolvedValue({
      success: true,
    });

    const { result } = renderHook(() => useEditarContrasena(setIsLoading));

    const usuarioSeleccionado = { id: 1 };
    const data = { password: "nuevaPassword123" };

    await act(async () => {
      await result.current.editarContraseña(usuarioSeleccionado, data);
    });

    expect(mockActualizarUsuario).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });
});

