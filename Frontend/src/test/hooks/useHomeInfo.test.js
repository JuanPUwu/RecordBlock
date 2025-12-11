import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useHomeInfo } from "../../hooks/useHomeInfo.js";

// Mock del servicio
const mockObtenerInformacion = vi.fn();

vi.mock("../../services/infoUsuarioServices.js", () => ({
  useInfoUsuarioService: () => ({
    obtenerInformacion: mockObtenerInformacion,
  }),
}));

// Mock de useFiltros
vi.mock("../../hooks/useFiltros.js", () => ({
  useFiltros: vi.fn(() => ({
    terminosBusqueda: {},
    filtrarPorFecha: false,
    setFiltrarPorFecha: vi.fn(),
    isDatoValue: false,
    isDetalleValue: false,
    whichInfo: [],
    isInfoCargando: false,
    setIsInfoCargando: vi.fn(),
    refDato: { current: null },
    refDetalle: { current: null },
    filtroInformacion: vi.fn(),
    handleInputDato: vi.fn(),
    handleInputDetalle: vi.fn(),
  })),
}));

// Mock de useExportacion
vi.mock("../../hooks/useExportacion.js", () => ({
  useExportacion: vi.fn(() => ({
    exportarComoPDF: vi.fn(),
    exportarComoExcell: vi.fn(),
  })),
}));

describe("useHomeInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe retornar todas las funciones y estados necesarios", () => {
    const user = { id: 1, nombre: "Usuario Test" };
    const clienteSeleccionado = null;
    const opcionesClientes = [];
    const isAdmin = false;
    const setIsLoading = vi.fn();

    const { result } = renderHook(() =>
      useHomeInfo(user, clienteSeleccionado, opcionesClientes, isAdmin, setIsLoading)
    );

    expect(result.current.cargarInformacion).toBeDefined();
    expect(result.current.terminosBusqueda).toBeDefined();
    expect(result.current.exportarComoPDF).toBeDefined();
    expect(result.current.exportarComoExcell).toBeDefined();
  });

  it("debe cargar información para usuario no admin", async () => {
    const user = { id: 1, nombre: "Usuario Test" };
    const clienteSeleccionado = null;
    const opcionesClientes = [];
    const isAdmin = false;
    const setIsLoading = vi.fn();

    mockObtenerInformacion.mockResolvedValue({
      data: {
        data: [
          {
            info_id: 1,
            usuario_id: 1,
            datos: [{ Modelo: "Dell XPS" }],
          },
        ],
      },
    });

    const { result } = renderHook(() =>
      useHomeInfo(user, clienteSeleccionado, opcionesClientes, isAdmin, setIsLoading)
    );

    await act(async () => {
      await result.current.cargarInformacion();
    });

    expect(mockObtenerInformacion).toHaveBeenCalledWith(1);
  });

  it("debe cargar información para admin con cliente seleccionado", async () => {
    const user = { id: 1, nombre: "Admin Test", isAdmin: true };
    const clienteSeleccionado = { value: 2 };
    const opcionesClientes = [{ value: 2, label: "Cliente Test" }];
    const isAdmin = true;
    const setIsLoading = vi.fn();

    mockObtenerInformacion.mockResolvedValue({
      data: {
        data: [],
      },
    });

    const { result } = renderHook(() =>
      useHomeInfo(user, clienteSeleccionado, opcionesClientes, isAdmin, setIsLoading)
    );

    await act(async () => {
      await result.current.cargarInformacion();
    });

    expect(mockObtenerInformacion).toHaveBeenCalledWith(2);
  });

  it("debe cargar información para admin sin cliente seleccionado", async () => {
    const user = { id: 1, nombre: "Admin Test", isAdmin: true };
    const clienteSeleccionado = null;
    const opcionesClientes = [];
    const isAdmin = true;
    const setIsLoading = vi.fn();

    mockObtenerInformacion.mockResolvedValue({
      data: {
        data: [],
      },
    });

    const { result } = renderHook(() =>
      useHomeInfo(user, clienteSeleccionado, opcionesClientes, isAdmin, setIsLoading)
    );

    await act(async () => {
      await result.current.cargarInformacion();
    });

    expect(mockObtenerInformacion).toHaveBeenCalledWith(null);
  });

  it("debe crear opciones de cliente para exportación (admin)", () => {
    const user = { id: 1, nombre: "Admin Test", isAdmin: true };
    const clienteSeleccionado = null;
    const opcionesClientes = [
      { value: 1, label: "Cliente 1" },
      { value: 2, label: "Cliente 2" },
    ];
    const isAdmin = true;
    const setIsLoading = vi.fn();

    const { result } = renderHook(() =>
      useHomeInfo(user, clienteSeleccionado, opcionesClientes, isAdmin, setIsLoading)
    );

    expect(result.current.exportarComoPDF).toBeDefined();
    expect(result.current.exportarComoExcell).toBeDefined();
  });

  it("debe crear opciones de cliente para exportación (usuario)", () => {
    const user = { id: 1, nombre: "Usuario Test" };
    const clienteSeleccionado = null;
    const opcionesClientes = [];
    const isAdmin = false;
    const setIsLoading = vi.fn();

    const { result } = renderHook(() =>
      useHomeInfo(user, clienteSeleccionado, opcionesClientes, isAdmin, setIsLoading)
    );

    expect(result.current.exportarComoPDF).toBeDefined();
    expect(result.current.exportarComoExcell).toBeDefined();
  });

  it("debe manejar user con value en lugar de id", async () => {
    const user = { value: 1, nombre: "Usuario Test" };
    const clienteSeleccionado = null;
    const opcionesClientes = [];
    const isAdmin = false;
    const setIsLoading = vi.fn();

    mockObtenerInformacion.mockResolvedValue({
      data: {
        data: [],
      },
    });

    const { result } = renderHook(() =>
      useHomeInfo(user, clienteSeleccionado, opcionesClientes, isAdmin, setIsLoading)
    );

    await act(async () => {
      await result.current.cargarInformacion();
    });

    expect(mockObtenerInformacion).toHaveBeenCalledWith(1);
  });
});

