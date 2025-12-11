import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCSV } from "../../hooks/useCSV.js";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

// Mock del servicio
const mockSubirCSV = vi.fn();

vi.mock("../../services/infoUsuarioServices.js", () => ({
  useInfoUsuarioService: () => ({
    subirCSV: mockSubirCSV,
  }),
}));

// Mock de toast
vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
  },
}));

// Mock de Swal
vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn(),
  },
}));

// Mock de csvUtils
vi.mock("../../utils/csvUtils.js", () => {
  const mockParsearCSV = vi.fn((texto) => ({
    headers: ["Modelo", "Serial"],
    filas: [
      { Modelo: "Dell XPS", Serial: "ABC123" },
      { Modelo: "HP Elite", Serial: "XYZ789" },
    ],
  }));

  return {
    parsearCSV: mockParsearCSV,
    generarTablaCSV: vi.fn(() => "<table>...</table>"),
  };
});

// Mock de estilos
vi.mock("../../css/swalStyles.js", () => ({
  default: {},
}));
vi.mock("../../css/swalStylesCSV.js", () => ({
  default: {},
}));
vi.mock("../../css/swalStylesConfirmCSV.js", () => ({
  default: {},
}));

describe("useCSV", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { parsearCSV } = await import("../../utils/csvUtils.js");
    parsearCSV.mockImplementation((texto) => ({
      headers: ["Modelo", "Serial"],
      filas: [
        { Modelo: "Dell XPS", Serial: "ABC123" },
        { Modelo: "HP Elite", Serial: "XYZ789" },
      ],
    }));
  });

  it("debe retornar refInputFile y funciones", () => {
    const clienteSeleccionado = { value: 1 };
    const cargarInformacion = vi.fn();

    const { result } = renderHook(() =>
      useCSV(clienteSeleccionado, cargarInformacion)
    );

    expect(result.current.refInputFile).toBeDefined();
    expect(result.current.manejarSubidaCSV).toBeDefined();
    expect(result.current.onFileSelected).toBeDefined();
  });

  it("debe mostrar error si no hay cliente seleccionado", () => {
    const cargarInformacion = vi.fn();

    const { result } = renderHook(() => useCSV(null, cargarInformacion));

    act(() => {
      result.current.manejarSubidaCSV();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Debes seleccionar un cliente primero"
    );
  });

  it("debe abrir el selector de archivos cuando hay cliente seleccionado", () => {
    const clienteSeleccionado = { value: 1 };
    const cargarInformacion = vi.fn();

    const { result } = renderHook(() =>
      useCSV(clienteSeleccionado, cargarInformacion)
    );

    result.current.refInputFile.current = { click: vi.fn() };

    act(() => {
      result.current.manejarSubidaCSV();
    });

    expect(result.current.refInputFile.current.click).toHaveBeenCalled();
  });

  it("debe rechazar archivos que no sean CSV", async () => {
    const clienteSeleccionado = { value: 1 };
    const cargarInformacion = vi.fn();

    const { result } = renderHook(() =>
      useCSV(clienteSeleccionado, cargarInformacion)
    );

    const mockEvent = {
      target: {
        files: [{ name: "archivo.txt" }],
        value: "",
      },
    };

    await act(async () => {
      await result.current.onFileSelected(mockEvent, vi.fn());
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Por favor selecciona un archivo CSV"
    );
  });

  it("debe procesar archivo CSV válido", async () => {
    const clienteSeleccionado = { value: 1 };
    const cargarInformacion = vi.fn();
    const setIsLoading = vi.fn();

    Swal.fire
      .mockResolvedValueOnce({ isConfirmed: true })
      .mockResolvedValueOnce({ isConfirmed: true })
      .mockResolvedValueOnce({ isConfirmed: true });

    mockSubirCSV.mockResolvedValue({
      success: true,
      data: {
        message: "Archivo procesado",
        data: {
          registros_insertados: 2,
          registros_con_error: 0,
        },
      },
    });

    const { result } = renderHook(() =>
      useCSV(clienteSeleccionado, cargarInformacion)
    );

    const mockFile = {
      name: "test.csv",
      text: vi.fn().mockResolvedValue("Modelo,Serial\nDell,ABC"),
    };

    const mockEvent = {
      target: {
        files: [mockFile],
        value: "",
      },
    };

    await act(async () => {
      await result.current.onFileSelected(mockEvent, setIsLoading);
    });

    await waitFor(() => {
      expect(mockSubirCSV).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it("debe cancelar si el usuario cancela la vista previa", async () => {
    const clienteSeleccionado = { value: 1 };
    const cargarInformacion = vi.fn();

    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });

    const { result } = renderHook(() =>
      useCSV(clienteSeleccionado, cargarInformacion)
    );

    const mockFile = {
      name: "test.csv",
      text: vi.fn().mockResolvedValue("Modelo,Serial\nDell,ABC"),
    };

    const mockEvent = {
      target: {
        files: [mockFile],
        value: "",
      },
    };

    await act(async () => {
      await result.current.onFileSelected(mockEvent, vi.fn());
    });

    expect(mockSubirCSV).not.toHaveBeenCalled();
  });

  it("debe cancelar si el usuario cancela la confirmación", async () => {
    const clienteSeleccionado = { value: 1 };
    const cargarInformacion = vi.fn();

    Swal.fire
      .mockResolvedValueOnce({ isConfirmed: true })
      .mockResolvedValueOnce({ isConfirmed: false });

    const { result } = renderHook(() =>
      useCSV(clienteSeleccionado, cargarInformacion)
    );

    const mockFile = {
      name: "test.csv",
      text: vi.fn().mockResolvedValue("Modelo,Serial\nDell,ABC"),
    };

    const mockEvent = {
      target: {
        files: [mockFile],
        value: "",
      },
    };

    await act(async () => {
      await result.current.onFileSelected(mockEvent, vi.fn());
    });

    expect(mockSubirCSV).not.toHaveBeenCalled();
  });

  it("debe mostrar error si el archivo está vacío", async () => {
    const clienteSeleccionado = { value: 1 };
    const cargarInformacion = vi.fn();

    const { parsearCSV } = await import("../../utils/csvUtils.js");
    parsearCSV.mockReturnValueOnce({
      headers: [],
      filas: [],
    });

    const { result } = renderHook(() =>
      useCSV(clienteSeleccionado, cargarInformacion)
    );

    const mockFile = {
      name: "test.csv",
      text: vi.fn().mockResolvedValue(""),
    };

    const mockEvent = {
      target: {
        files: [mockFile],
        value: "",
      },
    };

    await act(async () => {
      await result.current.onFileSelected(mockEvent, vi.fn());
    });

    expect(toast.error).toHaveBeenCalledWith(
      "El archivo CSV está vacío o no tiene filas de datos"
    );
  });

  it("debe manejar errores al leer el archivo", async () => {
    const clienteSeleccionado = { value: 1 };
    const cargarInformacion = vi.fn();

    const { result } = renderHook(() =>
      useCSV(clienteSeleccionado, cargarInformacion)
    );

    const mockFile = {
      name: "test.csv",
      text: vi.fn().mockRejectedValue(new Error("Error al leer")),
    };

    const mockEvent = {
      target: {
        files: [mockFile],
        value: "",
      },
    };

    await act(async () => {
      await result.current.onFileSelected(mockEvent, vi.fn());
    });

    expect(toast.error).toHaveBeenCalledWith("Error al leer el archivo CSV");
  });

  it("debe manejar errores del backend", async () => {
    const clienteSeleccionado = { value: 1 };
    const cargarInformacion = vi.fn();
    const setIsLoading = vi.fn();

    Swal.fire
      .mockResolvedValueOnce({ isConfirmed: true })
      .mockResolvedValueOnce({ isConfirmed: true })
      .mockResolvedValueOnce({ isConfirmed: true });

    mockSubirCSV.mockResolvedValue({
      success: false,
      error: "Error del backend",
    });

    const { result } = renderHook(() =>
      useCSV(clienteSeleccionado, cargarInformacion)
    );

    const mockFile = {
      name: "test.csv",
      text: vi.fn().mockResolvedValue("Modelo,Serial\nDell,ABC"),
    };

    const mockEvent = {
      target: {
        files: [mockFile],
        value: "",
      },
    };

    await act(async () => {
      await result.current.onFileSelected(mockEvent, setIsLoading);
    });

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledTimes(3);
    }, { timeout: 3000 });
  });
});
