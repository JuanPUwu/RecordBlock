import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useInfoUsuarioService } from "../../services/infoUsuarioServices";

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

describe("infoUsuarioServices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe retornar las funciones del servicio", () => {
    const { result } = renderHook(() => useInfoUsuarioService());

    expect(result.current.obtenerInformacion).toBeDefined();
    expect(result.current.crearInformacion).toBeDefined();
    expect(result.current.actualizarInformacion).toBeDefined();
    expect(result.current.eliminarInformacion).toBeDefined();
    expect(result.current.subirCSV).toBeDefined();
  });

  it("debe llamar a obtenerInformacion sin usuario_id", async () => {
    mockApi.get.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useInfoUsuarioService());

    await result.current.obtenerInformacion();

    expect(mockApi.get).toHaveBeenCalledWith("/informacion_usuario", {
      params: {},
    });
  });

  it("debe llamar a obtenerInformacion con usuario_id", async () => {
    const usuario_id = 1;
    mockApi.get.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useInfoUsuarioService());

    await result.current.obtenerInformacion(usuario_id);

    expect(mockApi.get).toHaveBeenCalledWith("/informacion_usuario", {
      params: { usuario_id },
    });
  });

  it("debe llamar a crearInformacion correctamente", async () => {
    const infoCrear = { dato: "test", detalle: "detalle test" };
    mockApi.post.mockResolvedValue({ data: { id: 1, ...infoCrear } });

    const { result } = renderHook(() => useInfoUsuarioService());

    await result.current.crearInformacion(infoCrear);

    expect(mockApi.post).toHaveBeenCalledWith(
      "/informacion_usuario",
      infoCrear
    );
  });

  it("debe llamar a actualizarInformacion correctamente", async () => {
    const infoActualizar = { info_id: 1, dato: "actualizado" };
    mockApi.put.mockResolvedValue({ data: { success: true } });

    const { result } = renderHook(() => useInfoUsuarioService());

    await result.current.actualizarInformacion(infoActualizar);

    expect(mockApi.put).toHaveBeenCalledWith(
      "/informacion_usuario",
      infoActualizar
    );
  });

  it("debe llamar a eliminarInformacion correctamente", async () => {
    const infoEliminar = { info_id: 1, usuario_id: 1 };
    mockApi.delete.mockResolvedValue({ data: { success: true } });

    const { result } = renderHook(() => useInfoUsuarioService());

    await result.current.eliminarInformacion(infoEliminar);

    expect(mockApi.delete).toHaveBeenCalledWith("/informacion_usuario", {
      data: infoEliminar,
    });
  });

  it("debe llamar a subirCSV correctamente", async () => {
    const formData = new FormData();
    formData.append("file", new Blob(["test"], { type: "text/csv" }));

    mockApi.post.mockResolvedValue({ data: { success: true } });

    const { result } = renderHook(() => useInfoUsuarioService());

    await result.current.subirCSV(formData);

    expect(mockApi.post).toHaveBeenCalledWith(
      "/informacion_usuario/upload-csv",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  });
});
