import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useForgotPasswordService } from "../../services/forgotPassService";

// Mock del contexto
const mockApi = {
  post: vi.fn(),
};

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    api: mockApi,
  }),
  AuthProvider: ({ children }) => children,
}));

describe("forgotPassService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe retornar la función solicitarRecuperacion", () => {
    const { result } = renderHook(() => useForgotPasswordService());

    expect(result.current.solicitarRecuperacion).toBeDefined();
  });

  it("debe llamar a solicitarRecuperacion correctamente", async () => {
    const email = "test@example.com";
    mockApi.post.mockResolvedValue({ data: { success: true } });

    const { result } = renderHook(() => useForgotPasswordService());

    await result.current.solicitarRecuperacion(email);

    expect(mockApi.post).toHaveBeenCalledWith("/auth/forgot-password", {
      email,
    });
  });
});
