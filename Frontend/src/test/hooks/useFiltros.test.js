import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useFiltros } from "../../hooks/useFiltros";

// Mock de useDebounce
vi.mock("../../hooks/useDebounce.js", () => ({
  useDebounce: (value) => value,
}));

describe("useFiltros", () => {
  const mockRefInformacion = { current: [] };

  beforeEach(() => {
    mockRefInformacion.current = [];
  });

  it("debe retornar todas las funciones y estados necesarios", () => {
    const { result } = renderHook(() => useFiltros(mockRefInformacion));

    expect(result.current.terminosBusqueda).toBeDefined();
    expect(result.current.filtrarPorFecha).toBeDefined();
    expect(result.current.setFiltrarPorFecha).toBeDefined();
    expect(result.current.isDatoValue).toBeDefined();
    expect(result.current.isDetalleValue).toBeDefined();
    expect(result.current.whichInfo).toBeDefined();
    expect(result.current.isInfoCargando).toBeDefined();
    expect(result.current.refDato).toBeDefined();
    expect(result.current.refDetalle).toBeDefined();
    expect(result.current.filtroInformacion).toBeDefined();
    expect(result.current.handleInputDato).toBeDefined();
    expect(result.current.handleInputDetalle).toBeDefined();
  });

  it("debe inicializar con valores por defecto", async () => {
    const { result } = renderHook(() => useFiltros(mockRefInformacion));

    expect(result.current.terminosBusqueda).toEqual({ dato: "", detalle: "" });
    expect(result.current.filtrarPorFecha).toBe(false);
    expect(result.current.isDatoValue).toBe(false);
    expect(result.current.isDetalleValue).toBe(false);
    expect(result.current.whichInfo).toEqual([]);
    
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    
    // Después de que se ejecute el efecto, isInfoCargando debería ser false
    expect(result.current.isInfoCargando).toBe(false);
  });

  it("debe actualizar terminosBusqueda cuando se aplica filtro", async () => {
    const { result } = renderHook(() => useFiltros(mockRefInformacion));

    await act(async () => {
      result.current.filtroInformacion();
    });

    await waitFor(() => {
      expect(result.current.isInfoCargando).toBe(false);
    });
  });

  it("debe filtrar información por dato", async () => {
    mockRefInformacion.current = [
      {
        info_id: 1,
        datos: [{ nombre: "Test", valor: "123" }],
      },
      {
        info_id: 2,
        datos: [{ otro: "Dato", valor: "456" }],
      },
    ];

    const { result } = renderHook(() => useFiltros(mockRefInformacion));

    await act(async () => {
      const evento = { target: { value: "nombre" } };
      result.current.handleInputDato(evento);
      result.current.filtroInformacion();
    });

    await waitFor(() => {
      expect(result.current.isDatoValue).toBe(true);
    });
  });

  it("debe filtrar información por detalle", async () => {
    mockRefInformacion.current = [
      {
        info_id: 1,
        datos: [{ nombre: "Test", valor: "123" }],
      },
    ];

    const { result } = renderHook(() => useFiltros(mockRefInformacion));

    await act(async () => {
      const evento = { target: { value: "123" } };
      result.current.handleInputDetalle(evento);
      result.current.filtroInformacion();
    });

    await waitFor(() => {
      expect(result.current.isDetalleValue).toBe(true);
    });
  });

  it("debe actualizar filtrarPorFecha", async () => {
    const { result } = renderHook(() => useFiltros(mockRefInformacion));

    await act(async () => {
      result.current.setFiltrarPorFecha(true);
    });

    await waitFor(() => {
      expect(result.current.filtrarPorFecha).toBe(true);
    });
  });

  it("debe manejar filtro de fechas cuando está activado", async () => {
    const fechaFutura = new Date();
    fechaFutura.setMonth(fechaFutura.getMonth() + 2);

    mockRefInformacion.current = [
      {
        info_id: 1,
        datos: [
          {
            licenciamiento: `${fechaFutura.getDate()}/${
              fechaFutura.getMonth() + 1
            }/${fechaFutura.getFullYear()}`,
          },
        ],
      },
    ];

    const { result } = renderHook(() => useFiltros(mockRefInformacion));

    await act(async () => {
      result.current.setFiltrarPorFecha(true);
      result.current.filtroInformacion(true);
    });

    await waitFor(() => {
      expect(result.current.whichInfo.length).toBeGreaterThan(0);
    });
  });
});
