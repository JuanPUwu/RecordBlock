import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useHomeBase } from "../../hooks/useHomeBase.js";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

// Mock de AuthContext
const mockUser = { id: 1, nombre: "Test User", isAdmin: false };
const mockLogout = vi.fn();

vi.mock("../../context/AuthContext.jsx", () => {
  const mockUseAuth = vi.fn(() => ({
    user: mockUser,
    logout: mockLogout,
  }));
  return {
    useAuth: () => mockUseAuth(),
    __mockUseAuth: mockUseAuth,
  };
});

// Mock de todos los hooks
vi.mock("../../hooks/useClientes.js", () => ({
  useClientes: vi.fn(() => ({
    clienteSeleccionado: null,
    setClienteSeleccionado: vi.fn(),
    opcionesClientes: [],
    opcionesClientesTabla: [],
    refBusquedaCliente: { current: null },
    resultadosBusquedaClientes: [],
    obtenerClientes: vi.fn(),
    buscarCliente: vi.fn(),
    buscarClienteTabla: vi.fn(),
    seleccionBusqueda: vi.fn(),
    limpiarClienteSeleccionado: vi.fn(),
  })),
}));

vi.mock("../../hooks/useHomeInfo.js", () => ({
  useHomeInfo: vi.fn(() => ({
    cargarInformacion: vi.fn(),
    terminosBusqueda: {},
    filtrarPorFecha: false,
    setFiltrarPorFecha: vi.fn(),
    isDatoValue: false,
    isDetalleValue: false,
    whichInfo: [],
    isInfoCargando: false,
    refDato: { current: null },
    refDetalle: { current: null },
    filtroInformacion: vi.fn(),
    handleInputDato: vi.fn(),
    handleInputDetalle: vi.fn(),
    exportarComoPDF: vi.fn(),
    exportarComoExcell: vi.fn(),
  })),
}));

vi.mock("../../hooks/useHomeForms.js", () => ({
  useHomeForms: vi.fn(() => ({
    registerCambiar: vi.fn(),
    handleSubmitCambiar: vi.fn(),
    resetCambiar: vi.fn(),
    errorsCambiar: {},
    isSubmittingCambiar: false,
    registerCrear: vi.fn(),
    handleSubmitCrear: vi.fn(),
    resetCrear: vi.fn(),
    errorsCrear: {},
    isSubmittingCrear: false,
    verPassword: "password",
    setVerPassword: vi.fn(),
    verPassword2: "password",
    setVerPassword2: vi.fn(),
  })),
}));

vi.mock("../../hooks/useCrearInfo.js", () => ({
  useCrearInfo: vi.fn(() => ({
    draftCrear: [],
    setDraftCrear: vi.fn(),
    scrollCrearRef: { current: null },
    inputCrearRef: { current: null },
    cambiarLlaveCrear: vi.fn(),
    cambiarValorCrear: vi.fn(),
    eliminarDatoCrear: vi.fn(),
    agregarDatoCrear: vi.fn(),
    crearRegistro: vi.fn().mockResolvedValue(true),
  })),
}));

vi.mock("../../hooks/useCSV.js", () => ({
  useCSV: vi.fn(() => ({
    refInputFile: { current: null },
    onFileSelected: vi.fn(),
  })),
}));

vi.mock("../../hooks/useEditarInfo.js", () => ({
  useEditarInfo: vi.fn(() => ({
    setInfoSeleccionada: vi.fn(),
    infoAEditar: null,
    setInfoAEditar: vi.fn(),
    draftDatos: [],
    scrollRef: { current: null },
    inputRef: { current: null },
    cambiarLlaveDraft: vi.fn(),
    cambiarValorDraft: vi.fn(),
    eliminarDatoDraft: vi.fn(),
    agregarDatoDraft: vi.fn(),
    editarRegistro: vi.fn().mockResolvedValue(true),
    handleEditarInfo: vi.fn(),
  })),
}));

vi.mock("../../hooks/useEliminarInfo.js", () => ({
  useEliminarInfo: vi.fn(() => ({
    eliminarInformacionCliente: vi.fn(),
  })),
}));

vi.mock("../../hooks/useLogout.js", () => ({
  useLogout: vi.fn(() => ({
    cerrarSesion: vi.fn(),
  })),
}));

vi.mock("../../hooks/useEditarContrasena.js", () => ({
  useEditarContrasena: vi.fn(() => ({
    editarContraseña: vi.fn(),
  })),
}));

vi.mock("../../hooks/useDatosMinimosAdmin.js", () => ({
  useDatosMinimosAdmin: vi.fn(() => ({
    datosMinimos: [],
    obtenerDatosMin: vi.fn(),
    inicializarDraft: vi.fn(),
    cambiarDatoMinimo: vi.fn(),
    eliminarDatoMinimo: vi.fn(),
    agregarDatoMinimo: vi.fn(),
    guardarDatosMinimos: vi.fn().mockResolvedValue(true),
    scrollDatosMinimosRef: { current: null },
    inputDatosMinimosRef: { current: null },
    draftDatosMinimos: [],
    setDraftDatosMinimos: vi.fn(),
  })),
}));

vi.mock("../../services/usuarioService.js", () => ({
  useUsuarioService: vi.fn(() => ({
    crearUsuario: vi.fn().mockResolvedValue({ success: true }),
    eliminarUsuario: vi.fn().mockResolvedValue({ success: true }),
  })),
}));

// Mock de toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock de Swal
vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: false }),
  },
}));

// Mock de estilos
vi.mock("../../css/swalStyles.js", () => ({
  default: {},
}));

describe("useHomeBase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe retornar todas las propiedades necesarias", () => {
    const { result } = renderHook(() => useHomeBase(false));

    expect(result.current.user).toBeDefined();
    expect(result.current.isLoading).toBeDefined();
    expect(result.current.clienteSeleccionado).toBeDefined();
    expect(result.current.whichInfo).toBeDefined();
    expect(result.current.popUpUsuarios).toBeDefined();
    expect(result.current.crearCliente).toBeDefined();
    expect(result.current.eliminarCliente).toBeDefined();
  });

  it("debe manejar crear cliente correctamente", async () => {
    const { useUsuarioService } = await import(
      "../../services/usuarioService.js"
    );
    const mockCrearUsuario = vi.fn().mockResolvedValue({
      success: true,
    });

    useUsuarioService.mockReturnValue({
      crearUsuario: mockCrearUsuario,
      eliminarUsuario: vi.fn(),
    });

    const { result } = renderHook(() => useHomeBase(true));

    const data = {
      nombre: "Nuevo Cliente",
      email: "cliente@test.com",
      password: "password123",
      password2: "password123",
    };

    await act(async () => {
      await result.current.crearCliente(data);
    });

    expect(toast.success).toHaveBeenCalled();
  });

  it("debe manejar eliminar cliente correctamente", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });

    const { useUsuarioService } = await import(
      "../../services/usuarioService.js"
    );
    const mockEliminarUsuario = vi.fn().mockResolvedValue({
      success: true,
    });

    useUsuarioService.mockReturnValue({
      crearUsuario: vi.fn(),
      eliminarUsuario: mockEliminarUsuario,
    });

    const { result } = renderHook(() => useHomeBase(true));

    const cliente = {
      id: 1,
      nombre: "Cliente a eliminar",
    };

    await act(async () => {
      await result.current.eliminarCliente(cliente);
    });

    expect(mockEliminarUsuario).toHaveBeenCalled();
  });

  it("debe manejar refrescar información", async () => {
    const { useHomeInfo } = await import("../../hooks/useHomeInfo.js");
    const mockCargarInformacion = vi.fn();

    useHomeInfo.mockReturnValue({
      cargarInformacion: mockCargarInformacion,
      terminosBusqueda: {},
      filtrarPorFecha: false,
      setFiltrarPorFecha: vi.fn(),
      isDatoValue: false,
      isDetalleValue: false,
      whichInfo: [],
      isInfoCargando: false,
      refDato: { current: null },
      refDetalle: { current: null },
      filtroInformacion: vi.fn(),
      handleInputDato: vi.fn(),
      handleInputDetalle: vi.fn(),
      exportarComoPDF: vi.fn(),
      exportarComoExcell: vi.fn(),
    });

    const { result } = renderHook(() => useHomeBase(false));

    await act(async () => {
      result.current.refrescarInfo();
    });

    expect(mockCargarInformacion).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Registros refrescados");
  });

  it("debe manejar crear registro", async () => {
    const { useCrearInfo } = await import("../../hooks/useCrearInfo.js");
    const mockCrearRegistro = vi.fn().mockResolvedValue(true);

    useCrearInfo.mockReturnValue({
      draftCrear: [],
      setDraftCrear: vi.fn(),
      scrollCrearRef: { current: null },
      inputCrearRef: { current: null },
      cambiarLlaveCrear: vi.fn(),
      cambiarValorCrear: vi.fn(),
      eliminarDatoCrear: vi.fn(),
      agregarDatoCrear: vi.fn(),
      crearRegistro: mockCrearRegistro,
    });

    const { result } = renderHook(() => useHomeBase(false));

    await act(async () => {
      await result.current.handleCrearRegistro();
    });

    expect(mockCrearRegistro).toHaveBeenCalled();
  });

  it("debe manejar editar registro", async () => {
    const { useEditarInfo } = await import("../../hooks/useEditarInfo.js");
    const mockEditarRegistro = vi.fn().mockResolvedValue(true);

    useEditarInfo.mockReturnValue({
      setInfoSeleccionada: vi.fn(),
      infoAEditar: null,
      setInfoAEditar: vi.fn(),
      draftDatos: [],
      scrollRef: { current: null },
      inputRef: { current: null },
      cambiarLlaveDraft: vi.fn(),
      cambiarValorDraft: vi.fn(),
      eliminarDatoDraft: vi.fn(),
      agregarDatoDraft: vi.fn(),
      editarRegistro: mockEditarRegistro,
      handleEditarInfo: vi.fn(),
    });

    const { result } = renderHook(() => useHomeBase(false));

    await act(async () => {
      await result.current.handleEditarRegistro();
    });

    expect(mockEditarRegistro).toHaveBeenCalled();
  });

  it("debe inicializar draft de datos mínimos cuando se abre popup", async () => {
    const { useDatosMinimosAdmin } = await import(
      "../../hooks/useDatosMinimosAdmin.js"
    );
    const mockInicializarDraft = vi.fn();

    useDatosMinimosAdmin.mockReturnValue({
      datosMinimos: [],
      obtenerDatosMin: vi.fn(),
      inicializarDraft: mockInicializarDraft,
      cambiarDatoMinimo: vi.fn(),
      eliminarDatoMinimo: vi.fn(),
      agregarDatoMinimo: vi.fn(),
      guardarDatosMinimos: vi.fn(),
      scrollDatosMinimosRef: { current: null },
      inputDatosMinimosRef: { current: null },
      draftDatosMinimos: [],
      setDraftDatosMinimos: vi.fn(),
    });

    const { result } = renderHook(() => useHomeBase(true));

    act(() => {
      result.current.setPopUpEditarDatosMinimos(true);
    });

    waitFor(() => {
      expect(mockInicializarDraft).toHaveBeenCalled();
    });
  });

  it("debe manejar crear cliente cuando falla", async () => {
    const { useUsuarioService } = await import(
      "../../services/usuarioService.js"
    );
    const mockCrearUsuario = vi.fn().mockResolvedValue({
      success: false,
      error: "Error al crear cliente",
    });

    useUsuarioService.mockReturnValue({
      crearUsuario: mockCrearUsuario,
      eliminarUsuario: vi.fn(),
    });

    const { result } = renderHook(() => useHomeBase(true));

    const data = {
      nombre: "Nuevo Cliente",
      email: "cliente@test.com",
      password: "password123",
      password2: "password123",
    };

    await act(async () => {
      await result.current.crearCliente(data);
    });

    expect(toast.error).toHaveBeenCalledWith("Error al crear cliente");
  });

  it("NO debe crear cliente cuando crearUsuario es null (no admin)", async () => {
    const { useUsuarioService } = await import(
      "../../services/usuarioService.js"
    );
    const mockCrearUsuario = vi.fn();

    useUsuarioService.mockReturnValue({
      crearUsuario: null,
      eliminarUsuario: null,
    });

    const { result } = renderHook(() => useHomeBase(false));

    const data = {
      nombre: "Nuevo Cliente",
      email: "cliente@test.com",
      password: "password123",
      password2: "password123",
    };

    await act(async () => {
      await result.current.crearCliente(data);
    });

    expect(mockCrearUsuario).not.toHaveBeenCalled();
  });

  it("debe manejar eliminar cliente cuando no se confirma", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: false });

    const { useUsuarioService } = await import(
      "../../services/usuarioService.js"
    );
    const mockEliminarUsuario = vi.fn();

    useUsuarioService.mockReturnValue({
      crearUsuario: vi.fn(),
      eliminarUsuario: mockEliminarUsuario,
    });

    const { result } = renderHook(() => useHomeBase(true));

    const cliente = {
      id: 1,
      nombre: "Cliente a eliminar",
    };

    await act(async () => {
      await result.current.eliminarCliente(cliente);
    });

    expect(mockEliminarUsuario).not.toHaveBeenCalled();
  });

  it("debe manejar eliminar cliente cuando falla", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });

    const { useUsuarioService } = await import(
      "../../services/usuarioService.js"
    );
    const mockEliminarUsuario = vi.fn().mockResolvedValue({
      success: false,
      error: "Error al eliminar",
    });

    useUsuarioService.mockReturnValue({
      crearUsuario: vi.fn(),
      eliminarUsuario: mockEliminarUsuario,
    });

    const { useClientes } = await import("../../hooks/useClientes.js");
    const mockObtenerClientes = vi.fn();

    useClientes.mockReturnValue({
      clienteSeleccionado: { value: 1 },
      setClienteSeleccionado: vi.fn(),
      opcionesClientes: [],
      opcionesClientesTabla: [],
      refBusquedaCliente: { current: { value: "" } },
      resultadosBusquedaClientes: [],
      obtenerClientes: mockObtenerClientes,
      buscarCliente: vi.fn(),
      buscarClienteTabla: vi.fn(),
      seleccionBusqueda: vi.fn(),
      limpiarClienteSeleccionado: vi.fn(),
    });

    const { result } = renderHook(() => useHomeBase(true));

    const cliente = {
      id: 1,
      nombre: "Cliente a eliminar",
    };

    await act(async () => {
      await result.current.eliminarCliente(cliente);
    });

    expect(toast.error).toHaveBeenCalledWith("Error al eliminar");
  });

  it("debe limpiar selección cuando se elimina el cliente seleccionado", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });

    const { useUsuarioService } = await import(
      "../../services/usuarioService.js"
    );
    const mockEliminarUsuario = vi.fn().mockResolvedValue({
      success: true,
    });

    useUsuarioService.mockReturnValue({
      crearUsuario: vi.fn(),
      eliminarUsuario: mockEliminarUsuario,
    });

    const { useClientes } = await import("../../hooks/useClientes.js");
    const mockSetClienteSeleccionado = vi.fn();
    const mockObtenerClientes = vi.fn();
    const refBusquedaCliente = { current: { value: "test" } };
    const resultadosBusquedaClientes = [];

    useClientes.mockReturnValue({
      clienteSeleccionado: { value: 1 },
      setClienteSeleccionado: mockSetClienteSeleccionado,
      opcionesClientes: [],
      opcionesClientesTabla: [],
      refBusquedaCliente: refBusquedaCliente,
      resultadosBusquedaClientes: resultadosBusquedaClientes,
      obtenerClientes: mockObtenerClientes,
      buscarCliente: vi.fn(),
      buscarClienteTabla: vi.fn(),
      seleccionBusqueda: vi.fn(),
      limpiarClienteSeleccionado: vi.fn(),
    });

    const { result } = renderHook(() => useHomeBase(true));

    const cliente = {
      id: 1,
      nombre: "Cliente a eliminar",
    };

    await act(async () => {
      await result.current.eliminarCliente(cliente);
    });

    expect(mockSetClienteSeleccionado).toHaveBeenCalledWith(null);
    expect(refBusquedaCliente.current.value).toBe("");
    expect(resultadosBusquedaClientes.length).toBe(0);
  });

  it("NO debe limpiar selección cuando el cliente eliminado no es el seleccionado", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });

    const { useUsuarioService } = await import(
      "../../services/usuarioService.js"
    );
    const mockEliminarUsuario = vi.fn().mockResolvedValue({
      success: true,
    });

    useUsuarioService.mockReturnValue({
      crearUsuario: vi.fn(),
      eliminarUsuario: mockEliminarUsuario,
    });

    const { useClientes } = await import("../../hooks/useClientes.js");
    const mockSetClienteSeleccionado = vi.fn();
    const mockObtenerClientes = vi.fn();
    const refBusquedaCliente = { current: { value: "test" } };
    const resultadosBusquedaClientes = [];

    useClientes.mockReturnValue({
      clienteSeleccionado: { value: 2 },
      setClienteSeleccionado: mockSetClienteSeleccionado,
      opcionesClientes: [],
      opcionesClientesTabla: [],
      refBusquedaCliente: refBusquedaCliente,
      resultadosBusquedaClientes: resultadosBusquedaClientes,
      obtenerClientes: mockObtenerClientes,
      buscarCliente: vi.fn(),
      buscarClienteTabla: vi.fn(),
      seleccionBusqueda: vi.fn(),
      limpiarClienteSeleccionado: vi.fn(),
    });

    const { result } = renderHook(() => useHomeBase(true));

    const cliente = {
      id: 1,
      nombre: "Cliente a eliminar",
    };

    await act(async () => {
      await result.current.eliminarCliente(cliente);
    });

    // No debe limpiar porque el cliente eliminado (id: 1) no es el seleccionado (value: 2)
    expect(mockSetClienteSeleccionado).not.toHaveBeenCalled();
  });

  it("debe manejar handleCrearRegistro cuando success es false", async () => {
    const { useCrearInfo } = await import("../../hooks/useCrearInfo.js");
    const mockCrearRegistro = vi.fn().mockResolvedValue(false);

    useCrearInfo.mockReturnValue({
      draftCrear: [],
      setDraftCrear: vi.fn(),
      scrollCrearRef: { current: null },
      inputCrearRef: { current: null },
      cambiarLlaveCrear: vi.fn(),
      cambiarValorCrear: vi.fn(),
      eliminarDatoCrear: vi.fn(),
      agregarDatoCrear: vi.fn(),
      crearRegistro: mockCrearRegistro,
    });

    const { result } = renderHook(() => useHomeBase(false));

    await act(async () => {
      await result.current.handleCrearRegistro();
    });

    expect(mockCrearRegistro).toHaveBeenCalled();
    // No debe cerrar el popup si success es false
    expect(result.current.popUpCrearInfo).toBe(false);
  });

  it("debe manejar handleEditarRegistro cuando success es false", async () => {
    const { useEditarInfo } = await import("../../hooks/useEditarInfo.js");
    const mockEditarRegistro = vi.fn().mockResolvedValue(false);

    useEditarInfo.mockReturnValue({
      setInfoSeleccionada: vi.fn(),
      infoAEditar: null,
      setInfoAEditar: vi.fn(),
      draftDatos: [],
      scrollRef: { current: null },
      inputRef: { current: null },
      cambiarLlaveDraft: vi.fn(),
      cambiarValorDraft: vi.fn(),
      eliminarDatoDraft: vi.fn(),
      agregarDatoDraft: vi.fn(),
      editarRegistro: mockEditarRegistro,
      handleEditarInfo: vi.fn(),
    });

    const { result } = renderHook(() => useHomeBase(false));

    await act(async () => {
      await result.current.handleEditarRegistro();
    });

    expect(mockEditarRegistro).toHaveBeenCalled();
    // No debe cerrar el popup si success es false
    expect(result.current.popUpEditarInfo).toBe(false);
  });

  it("debe manejar clienteSeleccionadoSimulado cuando user tiene id", async () => {
    const authContextModule = await import("../../context/AuthContext.jsx");
    const mockUseAuthForTest = authContextModule.__mockUseAuth;
    mockUseAuthForTest.mockReturnValue({
      user: { id: 5, nombre: "Test" },
      logout: vi.fn(),
    });

    const { result } = renderHook(() => useHomeBase(false));

    expect(result.current.clienteSeleccionadoSimulado).toEqual({ value: 5 });
    // Restaurar el mock
    mockUseAuthForTest.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });
  });

  it("debe manejar clienteSeleccionadoSimulado cuando user tiene value", async () => {
    const authContextModule = await import("../../context/AuthContext.jsx");
    const mockUseAuthForTest = authContextModule.__mockUseAuth;
    mockUseAuthForTest.mockReturnValue({
      user: { value: 10, nombre: "Test" },
      logout: vi.fn(),
    });

    const { result } = renderHook(() => useHomeBase(false));

    expect(result.current.clienteSeleccionadoSimulado).toEqual({ value: 10 });
    // Restaurar el mock
    mockUseAuthForTest.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });
  });

  it("debe manejar clienteSeleccionadoSimulado cuando user no tiene id ni value", async () => {
    const authContextModule = await import("../../context/AuthContext.jsx");
    const mockUseAuthForTest = authContextModule.__mockUseAuth;
    mockUseAuthForTest.mockReturnValue({
      user: { nombre: "Test" },
      logout: vi.fn(),
    });

    const { result } = renderHook(() => useHomeBase(false));

    expect(result.current.clienteSeleccionadoSimulado).toEqual({ value: null });
    // Restaurar el mock
    mockUseAuthForTest.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });
  });

  it("NO debe inicializar draft cuando isAdmin es false", async () => {
    const { useDatosMinimosAdmin } = await import(
      "../../hooks/useDatosMinimosAdmin.js"
    );
    const mockInicializarDraft = vi.fn();

    useDatosMinimosAdmin.mockReturnValue({
      datosMinimos: [],
      obtenerDatosMin: vi.fn(),
      inicializarDraft: mockInicializarDraft,
      cambiarDatoMinimo: vi.fn(),
      eliminarDatoMinimo: vi.fn(),
      agregarDatoMinimo: vi.fn(),
      guardarDatosMinimos: vi.fn(),
      scrollDatosMinimosRef: { current: null },
      inputDatosMinimosRef: { current: null },
      draftDatosMinimos: [],
      setDraftDatosMinimos: vi.fn(),
    });

    const { result } = renderHook(() => useHomeBase(false));

    act(() => {
      result.current.setPopUpEditarDatosMinimos(true);
    });

    // No debe llamar inicializarDraft cuando isAdmin es false
    expect(mockInicializarDraft).not.toHaveBeenCalled();
  });
});
