import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInfoForm } from "../../hooks/useInfoForm.js";
import toast from "react-hot-toast";

// Mock de toast
vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
  },
}));

describe("useInfoForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe inicializar con draft vacío si no se proporciona initialDraft", () => {
    const { result } = renderHook(() => useInfoForm());

    expect(result.current.draft).toEqual([]);
  });

  it("debe inicializar con initialDraft proporcionado", () => {
    const initialDraft = [
      { key: "Modelo", value: "Dell XPS" },
      { key: "Serial", value: "ABC123" },
    ];

    const { result } = renderHook(() => useInfoForm(initialDraft));

    expect(result.current.draft).toEqual(initialDraft);
  });

  it("debe cambiar la clave de un elemento", () => {
    const initialDraft = [{ key: "Modelo", value: "Dell XPS" }];
    const { result } = renderHook(() => useInfoForm(initialDraft));

    act(() => {
      result.current.cambiarLlave(0, "Serial");
    });

    expect(result.current.draft[0].key).toBe("Serial");
    expect(result.current.draft[0].value).toBe("Dell XPS");
  });

  it("debe cambiar el valor de un elemento", () => {
    const initialDraft = [{ key: "Modelo", value: "Dell XPS" }];
    const { result } = renderHook(() => useInfoForm(initialDraft));

    act(() => {
      result.current.cambiarValor(0, "HP Elite");
    });

    expect(result.current.draft[0].key).toBe("Modelo");
    expect(result.current.draft[0].value).toBe("HP Elite");
  });

  it("debe eliminar un elemento cuando hay más de uno", () => {
    const initialDraft = [
      { key: "Modelo", value: "Dell XPS" },
      { key: "Serial", value: "ABC123" },
    ];
    const { result } = renderHook(() => useInfoForm(initialDraft));

    act(() => {
      result.current.eliminarDato(0);
    });

    expect(result.current.draft.length).toBe(1);
    expect(result.current.draft[0].key).toBe("Serial");
  });

  it("no debe eliminar el último elemento", () => {
    const initialDraft = [{ key: "Modelo", value: "Dell XPS" }];
    const { result } = renderHook(() => useInfoForm(initialDraft));

    act(() => {
      result.current.eliminarDato(0);
    });

    expect(result.current.draft.length).toBe(1);
    expect(toast.error).toHaveBeenCalledWith("Debe haber al menos un campo");
  });

  it("debe agregar un nuevo par clave-valor", () => {
    const initialDraft = [{ key: "Modelo", value: "Dell XPS" }];
    const { result } = renderHook(() => useInfoForm(initialDraft));

    act(() => {
      result.current.agregarDato();
    });

    expect(result.current.draft.length).toBe(2);
    expect(result.current.draft[1]).toEqual({ key: "", value: "" });
  });

  it("no debe agregar un nuevo par si hay uno vacío", () => {
    const initialDraft = [
      { key: "Modelo", value: "Dell XPS" },
      { key: "", value: "" },
    ];
    const { result } = renderHook(() => useInfoForm(initialDraft));

    act(() => {
      result.current.agregarDato();
    });

    expect(result.current.draft.length).toBe(2);
    expect(toast.error).toHaveBeenCalledWith(
      "Completa el campo vacío\nantes de agregar uno nuevo"
    );
  });

  it("debe validar draft correctamente con datos válidos", () => {
    const initialDraft = [
      { key: "Modelo", value: "Dell XPS" },
      { key: "Serial", value: "ABC123" },
    ];
    const { result } = renderHook(() => useInfoForm(initialDraft));

    let paresValidos;
    act(() => {
      paresValidos = result.current.validarDraft();
    });

    expect(paresValidos).toHaveLength(2);
    expect(paresValidos[0].key).toBe("Modelo");
  });

  it("debe rechazar draft con clave vacía", () => {
    const initialDraft = [
      { key: "", value: "Dell XPS" },
    ];
    const { result } = renderHook(() => useInfoForm(initialDraft));

    let paresValidos;
    act(() => {
      paresValidos = result.current.validarDraft();
    });

    expect(paresValidos).toBeNull();
    expect(toast.error).toHaveBeenCalledWith(
      'El detalle "Dell XPS" no tiene dato'
    );
  });

  it("debe rechazar draft con valor vacío", () => {
    const initialDraft = [
      { key: "Modelo", value: "" },
    ];
    const { result } = renderHook(() => useInfoForm(initialDraft));

    let paresValidos;
    act(() => {
      paresValidos = result.current.validarDraft();
    });

    expect(paresValidos).toBeNull();
    expect(toast.error).toHaveBeenCalledWith('El dato "Modelo" no tiene detalle');
  });

  it("debe rechazar draft sin pares válidos", () => {
    const initialDraft = [
      { key: "", value: "" },
    ];
    const { result } = renderHook(() => useInfoForm(initialDraft));

    let paresValidos;
    act(() => {
      paresValidos = result.current.validarDraft();
    });

    expect(paresValidos).toBeNull();
    expect(toast.error).toHaveBeenCalledWith(
      "Debe haber por lo menos un dato válido"
    );
  });

  it("debe rechazar draft con emojis en la clave", () => {
    const initialDraft = [
      { key: "Modelo 😀", value: "Dell XPS" },
    ];
    const { result } = renderHook(() => useInfoForm(initialDraft));

    let paresValidos;
    act(() => {
      paresValidos = result.current.validarDraft();
    });

    expect(paresValidos).toBeNull();
    expect(toast.error).toHaveBeenCalledWith(
      'El dato "Modelo 😀" contiene emojis, no es valido'
    );
  });

  it("debe rechazar draft con emojis en el valor", () => {
    const initialDraft = [
      { key: "Modelo", value: "Dell XPS 😀" },
    ];
    const { result } = renderHook(() => useInfoForm(initialDraft));

    let paresValidos;
    act(() => {
      paresValidos = result.current.validarDraft();
    });

    expect(paresValidos).toBeNull();
    expect(toast.error).toHaveBeenCalledWith(
      'El detalle "Dell XPS 😀" contiene emojis, no es valido'
    );
  });

  it("debe rechazar draft con claves duplicadas", () => {
    const initialDraft = [
      { key: "Modelo", value: "Dell XPS" },
      { key: "modelo", value: "HP Elite" },
    ];
    const { result } = renderHook(() => useInfoForm(initialDraft));

    let paresValidos;
    act(() => {
      paresValidos = result.current.validarDraft();
    });

    expect(paresValidos).toBeNull();
    expect(toast.error).toHaveBeenCalledWith('El dato "modelo" ya existe');
  });

  it("debe convertir pares válidos a objeto", () => {
    const paresValidos = [
      { key: "Modelo", value: "Dell XPS" },
      { key: "Serial", value: "ABC123" },
    ];
    const { result } = renderHook(() => useInfoForm());

    let objeto;
    act(() => {
      objeto = result.current.convertirAObjeto(paresValidos);
    });

    expect(objeto).toEqual({
      Modelo: "Dell XPS",
      Serial: "ABC123",
    });
  });

  it("debe limpiar espacios en blanco al convertir a objeto", () => {
    const paresValidos = [
      { key: "  Modelo  ", value: "  Dell XPS  " },
    ];
    const { result } = renderHook(() => useInfoForm());

    let objeto;
    act(() => {
      objeto = result.current.convertirAObjeto(paresValidos);
    });

    expect(objeto).toEqual({
      Modelo: "Dell XPS",
    });
  });
});

