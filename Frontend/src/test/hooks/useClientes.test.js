import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useClientes } from "../../hooks/useClientes";
import toast from "react-hot-toast";

// Mock del servicio
const mockObtenerUsuarios = vi.fn();

vi.mock("../../services/usuarioService.js", () => ({
  useUsuarioService: () => ({
    obtenerUsuarios: mockObtenerUsuarios,
  }),
}));

// Mock de toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
  },
}));

describe("useClientes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe retornar todas las funciones y estados necesarios", () => {
    const { result } = renderHook(() => useClientes(false));

    expect(result.current.clientes).toBeDefined();
    expect(result.current.opcionesClientes).toBeDefined();
    expect(result.current.opcionesClientesTabla).toBeDefined();
    expect(result.current.resultadosBusquedaClientes).toBeDefined();
    expect(result.current.clienteSeleccionado).toBeDefined();
    expect(result.current.refBusquedaCliente).toBeDefined();
    expect(result.current.obtenerClientes).toBeDefined();
    expect(result.current.buscarCliente).toBeDefined();
    expect(result.current.buscarClienteTabla).toBeDefined();
    expect(result.current.seleccionBusqueda).toBeDefined();
    expect(result.current.limpiarClienteSeleccionado).toBeDefined();
  });

  it("no debe obtener clientes cuando isAdmin es false", async () => {
    const { result } = renderHook(() => useClientes(false));

    await result.current.obtenerClientes();

    expect(mockObtenerUsuarios).not.toHaveBeenCalled();
  });

  it("debe obtener clientes cuando isAdmin es true", async () => {
    mockObtenerUsuarios.mockResolvedValue({
      success: true,
      data: {
        data: [
          { id: 1, nombre: "Cliente 1", verificado: 1 },
          { id: 2, nombre: "Cliente 2", verificado: 0 },
        ],
      },
    });

    const { result } = renderHook(() => useClientes(true));

    await waitFor(() => {
      expect(mockObtenerUsuarios).toHaveBeenCalled();
    });
  });

  it("debe filtrar solo clientes verificados en opcionesClientes", async () => {
    mockObtenerUsuarios.mockResolvedValue({
      success: true,
      data: {
        data: [
          { id: 1, nombre: "Cliente 1", verificado: 1 },
          { id: 2, nombre: "Cliente 2", verificado: 0 },
        ],
      },
    });

    const { result } = renderHook(() => useClientes(true));

    await waitFor(() => {
      expect(result.current.opcionesClientes.length).toBe(1);
      expect(result.current.opcionesClientes[0].label).toBe("Cliente 1");
    });
  });

  it("debe buscar cliente correctamente", async () => {
    mockObtenerUsuarios.mockResolvedValue({
      success: true,
      data: {
        data: [
          { id: 1, nombre: "Juan Pérez", verificado: 1 },
          { id: 2, nombre: "María García", verificado: 1 },
        ],
      },
    });

    const { result } = renderHook(() => useClientes(true));

    await waitFor(() => {
      expect(result.current.opcionesClientes.length).toBe(2);
    });

    await act(async () => {
      const evento = { target: { value: "Juan" } };
      await result.current.buscarCliente(evento);
    });

    expect(result.current.resultadosBusquedaClientes.length).toBe(1);
    expect(result.current.resultadosBusquedaClientes[0].label).toBe(
      "Juan Pérez"
    );
  });

  it("debe limpiar resultados cuando el input está vacío", async () => {
    mockObtenerUsuarios.mockResolvedValue({
      success: true,
      data: {
        data: [{ id: 1, nombre: "Test", verificado: 1 }],
      },
    });

    const { result } = renderHook(() => useClientes(true));

    await waitFor(() => {
      expect(result.current.opcionesClientes.length).toBe(1);
    });

    // Primero buscar algo para tener resultados
    await act(async () => {
      const eventoBusqueda = { target: { value: "Test" } };
      await result.current.buscarCliente(eventoBusqueda);
    });
    expect(result.current.resultadosBusquedaClientes.length).toBe(1);

    // Luego limpiar
    await act(async () => {
      const evento = { target: { value: "" } };
      await result.current.buscarCliente(evento);
    });

    expect(result.current.resultadosBusquedaClientes).toEqual([]);
  });

  it("debe seleccionar cliente correctamente", async () => {
    mockObtenerUsuarios.mockResolvedValue({
      success: true,
      data: {
        data: [{ id: 1, nombre: "Cliente 1", verificado: 1 }],
      },
    });

    const { result } = renderHook(() => useClientes(true));

    await waitFor(() => {
      expect(result.current.opcionesClientes.length).toBe(1);
    });

    const cliente = result.current.opcionesClientes[0];
    result.current.refBusquedaCliente.current = { value: "test" };

    await act(async () => {
      result.current.seleccionBusqueda(cliente);
    });

    await waitFor(() => {
      expect(result.current.clienteSeleccionado).toEqual(cliente);
      expect(result.current.resultadosBusquedaClientes).toEqual([]);
    });
  });

  it("debe limpiar cliente seleccionado", async () => {
    mockObtenerUsuarios.mockResolvedValue({
      success: true,
      data: {
        data: [{ id: 1, nombre: "Cliente 1", verificado: 1 }],
      },
    });

    const { result } = renderHook(() => useClientes(true));

    await waitFor(() => {
      expect(result.current.opcionesClientes.length).toBe(1);
    });

    // Primero seleccionar un cliente
    const cliente = result.current.opcionesClientes[0];
    result.current.refBusquedaCliente.current = { value: "test" };

    await act(async () => {
      result.current.seleccionBusqueda(cliente);
    });

    await waitFor(() => {
      expect(result.current.clienteSeleccionado).not.toBeNull();
    });

    // Luego limpiar
    await act(async () => {
      result.current.limpiarClienteSeleccionado();
    });

    expect(result.current.clienteSeleccionado).toBeNull();
    expect(toast.success).toHaveBeenCalledWith("Cliente restablecido");
  });
});
