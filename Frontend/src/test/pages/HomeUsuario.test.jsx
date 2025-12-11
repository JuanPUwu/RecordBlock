import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomeUsuario from "../../pages/HomeUsuario.jsx";

// Mock de useHomeBase usando vi.hoisted para evitar problemas de hoisting
const { mockUseHomeBase, mockUseHomeBaseFn } = vi.hoisted(() => {
  const mockUseHomeBase = {
  user: { id: 1, nombre: "Usuario", isAdmin: false },
  isLoading: false,
  setIsLoading: vi.fn(),
  isRefrescarInfo: false,
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
  obtenerDatosMin: vi.fn().mockResolvedValue(undefined),
  setDraftCrear: vi.fn(),
  handleEditarInfo: vi.fn(),
  popUpUsuarios: false,
  setPopUpUsuarios: vi.fn(),
  popUpEditarContrasena: false,
  setPopUpEditarContrasena: vi.fn(),
  popUpCrearInfo: false,
  setPopUpCrearInfo: vi.fn(),
  popUpEditarInfo: false,
  setPopUpEditarInfo: vi.fn(),
  usuarioSeleccionado: null,
  setUsuarioSeleccionado: vi.fn(),
  registerCambiar: vi.fn(),
  handleSubmitCambiar: vi.fn(),
  resetCambiar: vi.fn(),
  errorsCambiar: {},
  isSubmittingCambiar: false,
  verPassword: "password",
  setVerPassword: vi.fn(),
  verPassword2: "password",
  setVerPassword2: vi.fn(),
  clienteSeleccionadoSimulado: { value: 1 },
  datosMinimos: [],
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
  handleEditarContraseña: vi.fn(),
  refrescarInfo: vi.fn(),
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
const { mockHomeNav, mockContenidoPrincipal, mockHomePopups } = vi.hoisted(() => {
  const mockHomeNav = vi.fn(() => <div>HomeNav</div>);
  const mockContenidoPrincipal = vi.fn(() => <div>ContenidoPrincipal</div>);
  const mockHomePopups = vi.fn(() => <div>HomePopups</div>);
  return { mockHomeNav, mockContenidoPrincipal, mockHomePopups };
});

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

describe("HomeUsuario", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseHomeBase.isLoading = false;
  });

  it("debe llamar useHomeBase con isAdmin=false", () => {
    render(<HomeUsuario />);

    expect(mockUseHomeBaseFn).toHaveBeenCalledWith(false);
  });

  it("debe renderizar correctamente todos los componentes", () => {
    render(<HomeUsuario />);

    expect(screen.getByText("HomeNav")).toBeInTheDocument();
    expect(screen.getByText("SepHrz")).toBeInTheDocument();
    expect(screen.getByText("ContenidoPrincipal")).toBeInTheDocument();
    expect(screen.getByText("HomePopups")).toBeInTheDocument();
  });

  it("debe mostrar spinner cuando isLoading es true", () => {
    mockUseHomeBase.isLoading = true;
    render(<HomeUsuario />);

    expect(screen.getByText("Spinner")).toBeInTheDocument();
  });

  it("no debe mostrar spinner cuando isLoading es false", () => {
    mockUseHomeBase.isLoading = false;
    render(<HomeUsuario />);

    expect(screen.queryByText("Spinner")).not.toBeInTheDocument();
  });

  it("debe pasar props correctas a HomeNav", () => {
    render(<HomeUsuario />);

    expect(mockHomeNav).toHaveBeenCalled();
    const props = mockHomeNav.mock.calls[0][0];
    expect(props.isAdmin).toBe(false);
    expect(props.user).toEqual(mockUseHomeBase.user);
    expect(props.whichInfo).toBe(mockUseHomeBase.whichInfo);
    expect(props.filtrarPorFecha).toBe(mockUseHomeBase.filtrarPorFecha);
    expect(props.setFiltrarPorFecha).toBe(mockUseHomeBase.setFiltrarPorFecha);
    expect(props.refDato).toBe(mockUseHomeBase.refDato);
    expect(props.refDetalle).toBe(mockUseHomeBase.refDetalle);
    expect(props.filtroInformacion).toBe(mockUseHomeBase.filtroInformacion);
    expect(props.isDatoValue).toBe(mockUseHomeBase.isDatoValue);
    expect(props.isDetalleValue).toBe(mockUseHomeBase.isDetalleValue);
    expect(props.handleInputDato).toBe(mockUseHomeBase.handleInputDato);
    expect(props.handleInputDetalle).toBe(mockUseHomeBase.handleInputDetalle);
    expect(props.isRefrescarInfo).toBe(mockUseHomeBase.isRefrescarInfo);
    expect(props.exportarComoPDF).toBe(mockUseHomeBase.exportarComoPDF);
    expect(props.exportarComoExcell).toBe(mockUseHomeBase.exportarComoExcell);
    expect(props.cerrarSesion).toBe(mockUseHomeBase.cerrarSesion);
  });

  it("debe pasar onUsuarioClick que llama setPopUpUsuarios", () => {
    render(<HomeUsuario />);

    const props = mockHomeNav.mock.calls[0][0];
    expect(typeof props.onUsuarioClick).toBe("function");

    props.onUsuarioClick();

    expect(mockUseHomeBase.setPopUpUsuarios).toHaveBeenCalledWith(true);
  });

  it("debe pasar onRefrescarClick que llama refrescarInfo", () => {
    render(<HomeUsuario />);

    const props = mockHomeNav.mock.calls[0][0];
    expect(typeof props.onRefrescarClick).toBe("function");

    props.onRefrescarClick();

    expect(mockUseHomeBase.refrescarInfo).toHaveBeenCalled();
  });

  it("debe pasar onCrearRegistroClick que llama obtenerDatosMin y setPopUpCrearInfo", async () => {
    render(<HomeUsuario />);

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
    render(<HomeUsuario />);

    expect(mockContenidoPrincipal).toHaveBeenCalled();
    const props = mockContenidoPrincipal.mock.calls[0][0];
    expect(props.isInfoCargando).toBe(mockUseHomeBase.isInfoCargando);
    expect(props.whichInfo).toBe(mockUseHomeBase.whichInfo);
    expect(props.terminosBusqueda).toBe(mockUseHomeBase.terminosBusqueda);
  });

  it("debe pasar onEditarInfo que llama handleEditarInfo y setPopUpEditarInfo", () => {
    const infoMock = { id: 1, datos: {} };
    render(<HomeUsuario />);

    const props = mockContenidoPrincipal.mock.calls[0][0];
    expect(typeof props.onEditarInfo).toBe("function");

    props.onEditarInfo(infoMock);

    expect(mockUseHomeBase.handleEditarInfo).toHaveBeenCalledWith(infoMock);
    expect(mockUseHomeBase.setPopUpEditarInfo).toHaveBeenCalledWith(true);
  });

  it("debe pasar onEliminarInfo que es eliminarInformacionCliente", () => {
    render(<HomeUsuario />);

    const props = mockContenidoPrincipal.mock.calls[0][0];
    expect(props.onEliminarInfo).toBe(mockUseHomeBase.eliminarInformacionCliente);
  });

  it("debe pasar isAdmin=false a HomePopups", () => {
    render(<HomeUsuario />);

    expect(mockHomePopups).toHaveBeenCalled();
    const props = mockHomePopups.mock.calls[0][0];
    expect(props.isAdmin).toBe(false);
  });

  it("debe pasar valores por defecto para props de admin en HomePopups", () => {
    render(<HomeUsuario />);

    const props = mockHomePopups.mock.calls[0][0];
    expect(props.popUpCrearCliente).toBe(false);
    expect(props.setPopUpCrearCliente).toBeDefined();
    expect(typeof props.setPopUpCrearCliente).toBe("function");
    expect(props.popUpEditarDatosMinimos).toBe(false);
    expect(props.setPopUpEditarDatosMinimos).toBeDefined();
    expect(typeof props.setPopUpEditarDatosMinimos).toBe("function");
    expect(props.registerCrear).toBe(null);
    expect(props.handleSubmitCrear).toBe(null);
    expect(typeof props.resetCrear).toBe("function");
    expect(props.errorsCrear).toEqual({});
    expect(props.isSubmittingCrear).toBe(false);
    expect(props.opcionesClientes).toEqual([]);
    expect(props.opcionesClientesTabla).toEqual([]);
    expect(typeof props.obtenerClientes).toBe("function");
    expect(typeof props.buscarClienteTabla).toBe("function");
    expect(typeof props.crearCliente).toBe("function");
    expect(typeof props.eliminarCliente).toBe("function");
    expect(props.clienteSeleccionado).toBe(null);
    expect(props.draftDatosMinimos).toEqual([]);
    expect(typeof props.setDraftDatosMinimos).toBe("function");
    expect(typeof props.cambiarDatoMinimo).toBe("function");
    expect(typeof props.eliminarDatoMinimo).toBe("function");
    expect(typeof props.agregarDatoMinimo).toBe("function");
    expect(props.scrollDatosMinimosRef).toEqual({ current: null });
    expect(props.inputDatosMinimosRef).toEqual({ current: null });
    expect(typeof props.guardarDatosMinimos).toBe("function");
  });

  it("debe pasar todas las props necesarias a HomePopups", () => {
    render(<HomeUsuario />);

    expect(mockHomePopups).toHaveBeenCalled();
    const props = mockHomePopups.mock.calls[0][0];
    expect(props.user).toEqual(mockUseHomeBase.user);
    expect(props.popUpUsuarios).toBe(mockUseHomeBase.popUpUsuarios);
    expect(props.setPopUpUsuarios).toBe(mockUseHomeBase.setPopUpUsuarios);
    expect(props.popUpEditarContrasena).toBe(
      mockUseHomeBase.popUpEditarContrasena
    );
    expect(props.setPopUpEditarContrasena).toBe(
      mockUseHomeBase.setPopUpEditarContrasena
    );
    expect(props.popUpCrearInfo).toBe(mockUseHomeBase.popUpCrearInfo);
    expect(props.setPopUpCrearInfo).toBe(mockUseHomeBase.setPopUpCrearInfo);
    expect(props.popUpEditarInfo).toBe(mockUseHomeBase.popUpEditarInfo);
    expect(props.setPopUpEditarInfo).toBe(mockUseHomeBase.setPopUpEditarInfo);
    expect(props.usuarioSeleccionado).toBe(mockUseHomeBase.usuarioSeleccionado);
    expect(props.setUsuarioSeleccionado).toBe(
      mockUseHomeBase.setUsuarioSeleccionado
    );
    expect(props.registerCambiar).toBe(mockUseHomeBase.registerCambiar);
    expect(props.handleSubmitCambiar).toBe(mockUseHomeBase.handleSubmitCambiar);
    expect(props.resetCambiar).toBe(mockUseHomeBase.resetCambiar);
    expect(props.errorsCambiar).toBe(mockUseHomeBase.errorsCambiar);
    expect(props.isSubmittingCambiar).toBe(mockUseHomeBase.isSubmittingCambiar);
    expect(props.verPassword).toBe(mockUseHomeBase.verPassword);
    expect(props.setVerPassword).toBe(mockUseHomeBase.setVerPassword);
    expect(props.verPassword2).toBe(mockUseHomeBase.verPassword2);
    expect(props.setVerPassword2).toBe(mockUseHomeBase.setVerPassword2);
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
    expect(props.handleEditarRegistro).toBe(mockUseHomeBase.handleEditarRegistro);
    expect(props.setIsLoading).toBe(mockUseHomeBase.setIsLoading);
    expect(props.handleEditarContraseña).toBe(
      mockUseHomeBase.handleEditarContraseña
    );
  });
});

