import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "../../hooks/useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("debe retornar el valor inicial inmediatamente", () => {
    const { result } = renderHook(() => useDebounce("test", 300));
    expect(result.current).toBe("test");
  });

  it("debe actualizar el valor después del delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 300 },
      }
    );

    expect(result.current).toBe("initial");

    act(() => {
      rerender({ value: "updated", delay: 300 });
    });
    expect(result.current).toBe("initial"); // Aún no ha pasado el delay

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("updated");
  });

  it("debe usar el delay por defecto de 300ms", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: "initial" },
    });

    act(() => {
      rerender({ value: "updated" });
    });
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("updated");
  });

  it("debe cancelar el timeout anterior cuando el valor cambia rápidamente", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      {
        initialProps: { value: "value1" },
      }
    );

    expect(result.current).toBe("value1");

    act(() => {
      rerender({ value: "value2" });
    });
    expect(result.current).toBe("value1");

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe("value1");

    act(() => {
      rerender({ value: "value3" });
    });
    expect(result.current).toBe("value1");

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe("value1");

    act(() => {
      rerender({ value: "value4" });
    });
    expect(result.current).toBe("value1");

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("value4");
  });

  it("debe manejar cambios de delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      }
    );

    act(() => {
      rerender({ value: "updated", delay: 200 });
    });
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe("updated");
  });

  it("debe limpiar el timeout al desmontar", () => {
    const { unmount } = renderHook(() => useDebounce("test", 300));
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
