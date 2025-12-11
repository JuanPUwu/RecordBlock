import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHomeForms } from "../../hooks/useHomeForms";

describe("useHomeForms", () => {
  it("debe retornar todas las funciones y estados necesarios", () => {
    const { result } = renderHook(() => useHomeForms(false));

    expect(result.current.registerCambiar).toBeDefined();
    expect(result.current.handleSubmitCambiar).toBeDefined();
    expect(result.current.resetCambiar).toBeDefined();
    expect(result.current.errorsCambiar).toBeDefined();
    expect(result.current.isSubmittingCambiar).toBeDefined();
    expect(result.current.verPassword).toBeDefined();
    expect(result.current.setVerPassword).toBeDefined();
    expect(result.current.verPassword2).toBeDefined();
    expect(result.current.setVerPassword2).toBeDefined();
  });

  it("debe retornar funciones de crear usuario cuando isAdmin es true", () => {
    const { result } = renderHook(() => useHomeForms(true));

    expect(result.current.registerCrear).toBeDefined();
    expect(result.current.handleSubmitCrear).toBeDefined();
    expect(result.current.resetCrear).toBeDefined();
    expect(result.current.errorsCrear).toBeDefined();
    expect(result.current.isSubmittingCrear).toBeDefined();
  });

  it("no debe retornar funciones de crear usuario cuando isAdmin es false", () => {
    const { result } = renderHook(() => useHomeForms(false));

    expect(result.current.registerCrear).toBeNull();
    expect(result.current.handleSubmitCrear).toBeNull();
    expect(result.current.resetCrear).toBeNull();
    expect(result.current.errorsCrear).toEqual({});
    expect(result.current.isSubmittingCrear).toBe(false);
  });

  it("debe inicializar verPassword y verPassword2 como 'password'", () => {
    const { result } = renderHook(() => useHomeForms(false));

    expect(result.current.verPassword).toBe("password");
    expect(result.current.verPassword2).toBe("password");
  });

  it("debe permitir cambiar verPassword", () => {
    const { result } = renderHook(() => useHomeForms(false));

    act(() => {
      result.current.setVerPassword("text");
    });
    expect(result.current.verPassword).toBe("text");
  });

  it("debe permitir cambiar verPassword2", () => {
    const { result } = renderHook(() => useHomeForms(false));

    act(() => {
      result.current.setVerPassword2("text");
    });
    expect(result.current.verPassword2).toBe("text");
  });
});
