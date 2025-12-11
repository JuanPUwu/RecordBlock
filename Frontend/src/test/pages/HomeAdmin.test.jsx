import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import HomeAdmin from "../../pages/HomeAdmin.jsx";

// Mock de useHomeBase usando vi.hoisted para evitar problemas de hoisting
const { mockUseHomeBase, mockUseHomeBaseFn } = vi.hoisted(() => {
  const mockUseHomeBase = {
    user: { id: 1, nombre: "Admin", isAdmin: true },
    isLoading: false,
    setIsLoading: vi.fn(),
    clienteSeleccionado: null,
    opcionesClientes: [],
    opcionesClientesTabla: [],
    refBusquedaCliente: { current: null },
    resultadosBusquedaClientes: [],
    obtenerClientes: vi.fn(),
    buscarCliente: vi.fn(),
    buscarClienteTabla: vi.fn(),
    seleccionBusqueda: vi.fn(),
    limpiarClienteSeleccionado: vi.fn(),
    whichInfo: [],
    terminosBusqueda: {},
    isInfoCargando: false,
    filtrarPorFecha: false,
    setFiltrarPorFecha: vi.fn(),
    refDato: { current: null },
    refDetalle: { current: null },
    filtroInformacion: vi.fn(),
    isDatoValue: false,
    isDetalleValue: false,
    handleInputDato: vi.fn(),
    handleInputDetalle: vi.fn(),
    exportarComoPDF: vi.fn(),
    exportarComoExcell: vi.fn(),
    clienteSeleccionadoSimulado: { value: 1 },
    datosMinimos: [],
    obtenerDatosMin: vi.fn().mockResolvedValue(undefined),
    cambiarDatoMinimo: vi.fn(),
    eliminarDatoMinimo: vi.fn(),
    agregarDatoMinimo: vi.fn(),
    guardarDatosMinimos: vi.fn(),
    scrollDatosMinimosRef: { current: null },
    inputDatosMinimosRef: { current: null },
    draftDatosMinimos: [],
    setDraftDatosMinimos: vi.fn(),
    setDraftCrear: vi.fn(),
    draftCrear: [],
    scrollCrearRef: { current: null },
    inputCrearRef: { current: null },
    cambiarLlaveCrear: vi.fn(),
    cambiarValorCrear: vi.fn(),
    eliminarDatoCrear: vi.fn(),
    agregarDatoCrear: vi.fn(),
    refInputFile: { current: null },
    handleSubirCSV: vi.fn(),
    handleCrearRegistro: vi.fn(),
    handleEditarInfo: vi.fn(),
    infoAEditar: null,
    setInfoSeleccionada: vi.fn(),
    setInfoAEditar: vi.fn(),
    draftDatos: [],
    scrollRef: { current: null },
    inputRef: { current: null },
    cambiarLlaveDraft: vi.fn(),
    cambiarValorDraft: vi.fn(),
    eliminarDatoDraft: vi.fn(),
    agregarDatoDraft: vi.fn(),
    handleEditarRegistro: vi.fn(),
    popUpUsuarios: false,
    setPopUpUsuarios: vi.fn(),
    popUpEditarContrasena: false,
    setPopUpEditarContrasena: vi.fn(),
    popUpCrearCliente: false,
    setPopUpCrearCliente: vi.fn(),
    popUpCrearInfo: false,
    setPopUpCrearInfo: vi.fn(),
    popUpEditarInfo: false,
    setPopUpEditarInfo: vi.fn(),
    popUpEditarDatosMinimos: false,
    setPopUpEditarDatosMinimos: vi.fn(),
    usuarioSeleccionado: null,
    setUsuarioSeleccionado: vi.fn(),
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
    handleEditarContraseña: vi.fn(),
    crearCliente: vi.fn(),
    eliminarCliente: vi.fn(),
    eliminarInformacionCliente: vi.fn(),
    cerrarSesion: vi.fn(),
  };
  const mockUseHomeBaseFn = vi.fn(() => mockUseHomeBase);
  return { mockUseHomeBase, mockUseHomeBaseFn };
});

vi.mock("../../hooks/useHomeBase.js", () => ({
  useHomeBase: mockUseHomeBaseFn,
}));

// Mock de componentes con props para verificar usando vi.hoisted
const { mockHomeNav, mockContenidoPrincipal, mockHomePopups } = vi.hoisted(
  () => {
    const mockHomeNav = vi.fn(() => <div>HomeNav</div>);
    const mockContenidoPrincipal = vi.fn(() => <div>ContenidoPrincipal</div>);
    const mockHomePopups = vi.fn(() => <div>HomePopups</div>);
    return { mockHomeNav, mockContenidoPrincipal, mockHomePopups };
  }
);

vi.mock("../../components/SepHrz.jsx", () => ({
  default: () => <div>SepHrz</div>,
}));

vi.mock("../../components/Spinner.jsx", () => ({
  default: () => <div>Spinner</div>,
}));

vi.mock("../../components/HomeNav.jsx", () => ({
  default: mockHomeNav,
}));

vi.mock("../../components/HomePopups.jsx", () => ({
  default: mockHomePopups,
}));

vi.mock("../../components/ContenidoPrincipal.jsx", () => ({
  default: mockContenidoPrincipal,
}));

describe("HomeAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseHomeBase.isLoading = false;
  });

  it("debe llamar useHomeBase con isAdmin=true", () => {
    render(<HomeAdmin />);

    expect(mockUseHomeBaseFn).toHaveBeenCalledWith(true);
  });

  it("debe renderizar correctamente todos los componentes", () => {
    render(<HomeAdmin />);

    expect(screen.getByText("HomeNav")).toBeInTheDocument();
    expect(screen.getByText("SepHrz")).toBeInTheDocument();
    expect(screen.getByText("ContenidoPrincipal")).toBeInTheDocument();
    expect(screen.getByText("HomePopups")).toBeInTheDocument();
  });

  it("debe mostrar spinner cuando isLoading es true", () => {
    mockUseHomeBase.isLoading = true;
    render(<HomeAdmin />);

    expect(screen.getByText("Spinner")).toBeInTheDocument();
  });

  it("no debe mostrar spinner cuando isLoading es false", () => {
    mockUseHomeBase.isLoading = false;
    render(<HomeAdmin />);

    expect(screen.queryByText("Spinner")).not.toBeInTheDocument();
  });

  it("debe pasar props correctas a HomeNav", () => {
    render(<HomeAdmin />);

    expect(mockHomeNav).toHaveBeenCalled();
    const props = mockHomeNav.mock.calls[0][0];
    expect(props.isAdmin).toBe(true);
    expect(props.user).toEqual(mockUseHomeBase.user);
    expect(props.clienteSeleccionado).toBe(mockUseHomeBase.clienteSeleccionado);
    expect(props.opcionesClientes).toBe(mockUseHomeBase.opcionesClientes);
    expect(props.obtenerClientes).toBe(mockUseHomeBase.obtenerClientes);
    expect(props.buscarCliente).toBe(mockUseHomeBase.buscarCliente);
    expect(props.exportarComoPDF).toBe(mockUseHomeBase.exportarComoPDF);
    expect(props.exportarComoExcell).toBe(mockUseHomeBase.exportarComoExcell);
    expect(props.cerrarSesion).toBe(mockUseHomeBase.cerrarSesion);
  });

  it("debe pasar onUsuarioClick que llama obtenerClientes y setPopUpUsuarios", () => {
    render(<HomeAdmin />);

    const props = mockHomeNav.mock.calls[0][0];
    expect(typeof props.onUsuarioClick).toBe("function");

    props.onUsuarioClick();

    expect(mockUseHomeBase.obtenerClientes).toHaveBeenCalled();
    expect(mockUseHomeBase.setPopUpUsuarios).toHaveBeenCalledWith(true);
  });

  it("debe pasar onRefrescarClick como función vacía", () => {
    render(<HomeAdmin />);

    const props = mockHomeNav.mock.calls[0][0];
    expect(typeof props.onRefrescarClick).toBe("function");

    // No debe hacer nada
    expect(() => props.onRefrescarClick()).not.toThrow();
  });

  it("debe pasar onCrearRegistroClick que llama obtenerDatosMin y setPopUpCrearInfo", async () => {
    render(<HomeAdmin />);

    const props = mockHomeNav.mock.calls[0][0];
    expect(typeof props.onCrearRegistroClick).toBe("function");

    await props.onCrearRegistroClick();

    expect(mockUseHomeBase.obtenerDatosMin).toHaveBeenCalledWith(
      mockUseHomeBase.setIsLoading,
      mockUseHomeBase.setDraftCrear
    );
    expect(mockUseHomeBase.setPopUpCrearInfo).toHaveBeenCalledWith(true);
  });

  it("debe pasar props correctas a ContenidoPrincipal", () => {
    render(<HomeAdmin />);

    expect(mockContenidoPrincipal).toHaveBeenCalled();
    const props = mockContenidoPrincipal.mock.calls[0][0];
    expect(props.isInfoCargando).toBe(mockUseHomeBase.isInfoCargando);
    expect(props.whichInfo).toBe(mockUseHomeBase.whichInfo);
    expect(props.terminosBusqueda).toBe(mockUseHomeBase.terminosBusqueda);
  });

  it("debe pasar onEditarInfo que llama handleEditarInfo y setPopUpEditarInfo", () => {
    const infoMock = { id: 1, datos: {} };
    render(<HomeAdmin />);

    const props = mockContenidoPrincipal.mock.calls[0][0];
    expect(typeof props.onEditarInfo).toBe("function");

    props.onEditarInfo(infoMock);

    expect(mockUseHomeBase.handleEditarInfo).toHaveBeenCalledWith(infoMock);
    expect(mockUseHomeBase.setPopUpEditarInfo).toHaveBeenCalledWith(true);
  });

  it("debe pasar onEliminarInfo que es eliminarInformacionCliente", () => {
    render(<HomeAdmin />);

    const props = mockContenidoPrincipal.mock.calls[0][0];
    expect(props.onEliminarInfo).toBe(
      mockUseHomeBase.eliminarInformacionCliente
    );
  });

  it("debe pasar todas las props necesarias a HomePopups", () => {
    render(<HomeAdmin />);

    expect(mockHomePopups).toHaveBeenCalled();
    const props = mockHomePopups.mock.calls[0][0];
    expect(props.isAdmin).toBe(true);
    expect(props.user).toEqual(mockUseHomeBase.user);
    expect(props.popUpUsuarios).toBe(mockUseHomeBase.popUpUsuarios);
    expect(props.setPopUpUsuarios).toBe(mockUseHomeBase.setPopUpUsuarios);
    expect(props.popUpEditarContrasena).toBe(
      mockUseHomeBase.popUpEditarContrasena
    );
    expect(props.setPopUpEditarContrasena).toBe(
      mockUseHomeBase.setPopUpEditarContrasena
    );
    expect(props.popUpCrearCliente).toBe(mockUseHomeBase.popUpCrearCliente);
    expect(props.setPopUpCrearCliente).toBe(
      mockUseHomeBase.setPopUpCrearCliente
    );
    expect(props.popUpCrearInfo).toBe(mockUseHomeBase.popUpCrearInfo);
    expect(props.setPopUpCrearInfo).toBe(mockUseHomeBase.setPopUpCrearInfo);
    expect(props.popUpEditarInfo).toBe(mockUseHomeBase.popUpEditarInfo);
    expect(props.setPopUpEditarInfo).toBe(mockUseHomeBase.setPopUpEditarInfo);
    expect(props.popUpEditarDatosMinimos).toBe(
      mockUseHomeBase.popUpEditarDatosMinimos
    );
    expect(props.setPopUpEditarDatosMinimos).toBe(
      mockUseHomeBase.setPopUpEditarDatosMinimos
    );
    expect(props.usuarioSeleccionado).toBe(mockUseHomeBase.usuarioSeleccionado);
    expect(props.setUsuarioSeleccionado).toBe(
      mockUseHomeBase.setUsuarioSeleccionado
    );
    expect(props.registerCambiar).toBe(mockUseHomeBase.registerCambiar);
    expect(props.handleSubmitCambiar).toBe(mockUseHomeBase.handleSubmitCambiar);
    expect(props.resetCambiar).toBe(mockUseHomeBase.resetCambiar);
    expect(props.errorsCambiar).toBe(mockUseHomeBase.errorsCambiar);
    expect(props.isSubmittingCambiar).toBe(mockUseHomeBase.isSubmittingCambiar);
    expect(props.registerCrear).toBe(mockUseHomeBase.registerCrear);
    expect(props.handleSubmitCrear).toBe(mockUseHomeBase.handleSubmitCrear);
    expect(props.resetCrear).toBe(mockUseHomeBase.resetCrear);
    expect(props.errorsCrear).toBe(mockUseHomeBase.errorsCrear);
    expect(props.isSubmittingCrear).toBe(mockUseHomeBase.isSubmittingCrear);
    expect(props.verPassword).toBe(mockUseHomeBase.verPassword);
    expect(props.setVerPassword).toBe(mockUseHomeBase.setVerPassword);
    expect(props.verPassword2).toBe(mockUseHomeBase.verPassword2);
    expect(props.setVerPassword2).toBe(mockUseHomeBase.setVerPassword2);
    expect(props.opcionesClientes).toBe(mockUseHomeBase.opcionesClientes);
    expect(props.opcionesClientesTabla).toBe(
      mockUseHomeBase.opcionesClientesTabla
    );
    expect(props.obtenerClientes).toBe(mockUseHomeBase.obtenerClientes);
    expect(props.buscarClienteTabla).toBe(mockUseHomeBase.buscarClienteTabla);
    expect(props.crearCliente).toBe(mockUseHomeBase.crearCliente);
    expect(props.eliminarCliente).toBe(mockUseHomeBase.eliminarCliente);
    expect(props.clienteSeleccionado).toBe(mockUseHomeBase.clienteSeleccionado);
    expect(props.clienteSeleccionadoSimulado).toBe(
      mockUseHomeBase.clienteSeleccionadoSimulado
    );
    expect(props.datosMinimos).toBe(mockUseHomeBase.datosMinimos);
    expect(props.obtenerDatosMin).toBe(mockUseHomeBase.obtenerDatosMin);
    expect(props.draftCrear).toBe(mockUseHomeBase.draftCrear);
    expect(props.setDraftCrear).toBe(mockUseHomeBase.setDraftCrear);
    expect(props.scrollCrearRef).toBe(mockUseHomeBase.scrollCrearRef);
    expect(props.inputCrearRef).toBe(mockUseHomeBase.inputCrearRef);
    expect(props.cambiarLlaveCrear).toBe(mockUseHomeBase.cambiarLlaveCrear);
    expect(props.cambiarValorCrear).toBe(mockUseHomeBase.cambiarValorCrear);
    expect(props.eliminarDatoCrear).toBe(mockUseHomeBase.eliminarDatoCrear);
    expect(props.agregarDatoCrear).toBe(mockUseHomeBase.agregarDatoCrear);
    expect(props.refInputFile).toBe(mockUseHomeBase.refInputFile);
    expect(props.handleSubirCSV).toBe(mockUseHomeBase.handleSubirCSV);
    expect(props.handleCrearRegistro).toBe(mockUseHomeBase.handleCrearRegistro);
    expect(props.infoAEditar).toBe(mockUseHomeBase.infoAEditar);
    expect(props.setInfoSeleccionada).toBe(mockUseHomeBase.setInfoSeleccionada);
    expect(props.setInfoAEditar).toBe(mockUseHomeBase.setInfoAEditar);
    expect(props.draftDatos).toBe(mockUseHomeBase.draftDatos);
    expect(props.scrollRef).toBe(mockUseHomeBase.scrollRef);
    expect(props.inputRef).toBe(mockUseHomeBase.inputRef);
    expect(props.cambiarLlaveDraft).toBe(mockUseHomeBase.cambiarLlaveDraft);
    expect(props.cambiarValorDraft).toBe(mockUseHomeBase.cambiarValorDraft);
    expect(props.eliminarDatoDraft).toBe(mockUseHomeBase.eliminarDatoDraft);
    expect(props.agregarDatoDraft).toBe(mockUseHomeBase.agregarDatoDraft);
    expect(props.handleEditarRegistro).toBe(
      mockUseHomeBase.handleEditarRegistro
    );
    expect(props.draftDatosMinimos).toBe(mockUseHomeBase.draftDatosMinimos);
    expect(props.setDraftDatosMinimos).toBe(
      mockUseHomeBase.setDraftDatosMinimos
    );
    expect(props.cambiarDatoMinimo).toBe(mockUseHomeBase.cambiarDatoMinimo);
    expect(props.eliminarDatoMinimo).toBe(mockUseHomeBase.eliminarDatoMinimo);
    expect(props.agregarDatoMinimo).toBe(mockUseHomeBase.agregarDatoMinimo);
    expect(props.scrollDatosMinimosRef).toBe(
      mockUseHomeBase.scrollDatosMinimosRef
    );
    expect(props.inputDatosMinimosRef).toBe(
      mockUseHomeBase.inputDatosMinimosRef
    );
    expect(props.guardarDatosMinimos).toBe(mockUseHomeBase.guardarDatosMinimos);
    expect(props.setIsLoading).toBe(mockUseHomeBase.setIsLoading);
    expect(props.handleEditarContraseña).toBe(
      mockUseHomeBase.handleEditarContraseña
    );
  });
});
