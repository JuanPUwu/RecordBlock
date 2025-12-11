import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDatosMinimosService } from "../../services/datosMinimos";

// Mock del contexto
const mockApi = {
  get: vi.fn(),
  put: vi.fn(),
};

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    api: mockApi,
  }),
  AuthProvider: ({ children }) => children,
}));

describe("datosMinimos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe retornar las funciones del servicio", () => {
    const { result } = renderHook(() => useDatosMinimosService());

    expect(result.current.obtenerDatosMinimos).toBeDefined();
    expect(result.current.remplazarDatosMinimos).toBeDefined();
  });

  it("debe llamar a obtenerDatosMinimos correctamente", async () => {
    mockApi.get.mockResolvedValue({ data: { datos: [] } });

    const { result } = renderHook(() => useDatosMinimosService());

    await result.current.obtenerDatosMinimos();

    expect(mockApi.get).toHaveBeenCalledWith("/datos_minimos");
  });

  it("debe llamar a remplazarDatosMinimos correctamente", async () => {
    const datos = [{ clave: "valor" }];
    mockApi.put.mockResolvedValue({ data: { success: true } });

    const { result } = renderHook(() => useDatosMinimosService());

    await result.current.remplazarDatosMinimos(datos);

    expect(mockApi.put).toHaveBeenCalledWith("/datos_minimos", { datos });
  });
});
