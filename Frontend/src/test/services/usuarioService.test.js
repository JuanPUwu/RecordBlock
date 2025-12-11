import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useUsuarioService } from "../../services/usuarioService";

// Mock del contexto
const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    api: mockApi,
  }),
  AuthProvider: ({ children }) => children,
}));

describe("usuarioService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe retornar las funciones del servicio", () => {
    const { result } = renderHook(() => useUsuarioService());

    expect(result.current.obtenerUsuarios).toBeDefined();
    expect(result.current.crearUsuario).toBeDefined();
    expect(result.current.actualizarUsuario).toBeDefined();
    expect(result.current.eliminarUsuario).toBeDefined();
  });

  it("debe llamar a obtenerUsuarios correctamente", async () => {
    mockApi.get.mockResolvedValue({ data: [{ id: 1, nombre: "Test" }] });

    const { result } = renderHook(() => useUsuarioService());

    await result.current.obtenerUsuarios();

    expect(mockApi.get).toHaveBeenCalledWith("/usuario");
  });

  it("debe llamar a crearUsuario correctamente", async () => {
    const usuario = { nombre: "Test", email: "test@example.com" };
    mockApi.post.mockResolvedValue({ data: { id: 1, ...usuario } });

    const { result } = renderHook(() => useUsuarioService());

    await result.current.crearUsuario(usuario);

    expect(mockApi.post).toHaveBeenCalledWith("/usuario", usuario);
  });

  it("debe llamar a actualizarUsuario correctamente", async () => {
    const id = 1;
    const password = "NewPassword123!";
    mockApi.put.mockResolvedValue({ data: { success: true } });

    const { result } = renderHook(() => useUsuarioService());

    await result.current.actualizarUsuario(id, password);

    expect(mockApi.put).toHaveBeenCalledWith(`/usuario/${id}`, { password });
  });

  it("debe llamar a eliminarUsuario correctamente", async () => {
    const id = 1;
    mockApi.delete.mockResolvedValue({ data: { success: true } });

    const { result } = renderHook(() => useUsuarioService());

    await result.current.eliminarUsuario(id);

    expect(mockApi.delete).toHaveBeenCalledWith(`/usuario/${id}`);
  });
});
