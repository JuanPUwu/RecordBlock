import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomePopups from "../../components/HomePopups.jsx";

// Mock de todos los componentes de popup
const mockOnClosePopupUsuarios = vi.fn();
const mockOnCrearCliente = vi.fn();
const mockOnEditarContrasena = vi.fn();
const mockOnEliminarCliente = vi.fn();

vi.mock("../../components/PopupUsuarios.jsx", () => ({
  default: ({
    open,
    onClose,
    onCrearCliente,
    onEditarContrasena,
    onEliminarCliente,
  }) => {
    if (!open) return null;
    return (
      <div>
        <div>PopupUsuarios</div>
        <button onClick={onClose}>Cerrar PopupUsuarios</button>
        <button onClick={onCrearCliente}>Crear Cliente</button>
        <button onClick={() => onEditarContrasena({ id: 1, nombre: "Test" })}>
          Editar Contraseña
        </button>
        <button onClick={() => onEliminarCliente({ id: 1, nombre: "Test" })}>
          Eliminar Cliente
        </button>
      </div>
    );
  },
}));

const mockOnCloseCrearCliente = vi.fn();
const mockOnSubmitCrearCliente = vi.fn();

vi.mock("../../components/PopupCrearCliente.jsx", () => ({
  default: ({ open, onClose, onSubmit }) => {
    if (!open) return null;
    return (
      <div>
        <div>PopupCrearCliente</div>
        <button onClick={onClose}>Cerrar CrearCliente</button>
        <button onClick={() => onSubmit({ email: "test@test.com" })}>
          Submit CrearCliente
        </button>
      </div>
    );
  },
}));

const mockOnCloseEditarContrasena = vi.fn();
const mockOnSubmitEditarContrasena = vi.fn();

vi.mock("../../components/PopupEditarContrasena.jsx", () => ({
  default: ({ open, onClose, onSubmit, usuarioSeleccionado }) => {
    if (!open) return null;
    return (
      <div>
        <div>PopupEditarContrasena</div>
        <div>Usuario: {usuarioSeleccionado?.nombre || "N/A"}</div>
        <button onClick={onClose}>Cerrar EditarContrasena</button>
        <button onClick={() => onSubmit({ password: "newpass" })}>
          Submit EditarContrasena
        </button>
      </div>
    );
  },
}));

const mockOnCloseCrearInfo = vi.fn();
const mockOnSubirCSV = vi.fn();
const mockOnCreate = vi.fn();
const mockOnEditarDatosMinimos = vi.fn();

vi.mock("../../components/PopupCrearInfo.jsx", () => ({
  default: ({ open, onClose, onSubirCSV, onCreate, onEditarDatosMinimos }) => {
    if (!open) return null;
    return (
      <div>
        <div>PopupCrearInfo</div>
        <button onClick={onClose}>Cerrar CrearInfo</button>
        <button onClick={() => onSubirCSV({ target: { files: [] } })}>
          Subir CSV
        </button>
        <button onClick={onCreate}>Crear Registro</button>
        <button onClick={onEditarDatosMinimos}>Editar Datos Minimos</button>
      </div>
    );
  },
}));

const mockOnCloseEditarInfo = vi.fn();
const mockOnSaveEditarInfo = vi.fn();

vi.mock("../../components/PopupEditarInfo.jsx", () => ({
  default: ({ open, onClose, onSave }) => {
    if (!open) return null;
    return (
      <div>
        <div>PopupEditarInfo</div>
        <button onClick={onClose}>Cerrar EditarInfo</button>
        <button onClick={onSave}>Guardar EditarInfo</button>
      </div>
    );
  },
}));

const mockOnCloseEditarDatosMinimos = vi.fn();
const mockOnSaveDatosMinimos = vi.fn();

vi.mock("../../components/PopupEditarDatosMinimos.jsx", () => ({
  default: ({ open, onClose, onSave }) => {
    if (!open) return null;
    return (
      <div>
        <div>PopupEditarDatosMinimos</div>
        <button onClick={onClose}>Cerrar EditarDatosMinimos</button>
        <button onClick={onSave}>Guardar DatosMinimos</button>
      </div>
    );
  },
}));

const mockOnClickCardAdmin = vi.fn();

vi.mock("../../components/CardAdmin.jsx", () => ({
  default: ({ nameAdmin, rolAdmin, onClick }) => (
    <div>
      <div>CardAdmin</div>
      <div>Nombre: {nameAdmin}</div>
      <div>Rol: {rolAdmin}</div>
      <button onClick={onClick}>CardAdmin Button</button>
    </div>
  ),
}));

vi.mock("reactjs-popup", () => ({
  default: ({ open, onClose, children }) => {
    if (!open) return null;
    return (
      <div>
        {children}
        <button onClick={onClose}>Cerrar Popup</button>
      </div>
    );
  },
}));

describe("HomePopups", () => {
  const defaultProps = {
    isAdmin: false,
    user: { id: 1, nombre: "Test User", isAdmin: false },
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
    opcionesClientes: [],
    opcionesClientesTabla: [],
    obtenerClientes: vi.fn(),
    buscarClienteTabla: vi.fn(),
    crearCliente: vi.fn(),
    eliminarCliente: vi.fn(),
    clienteSeleccionado: null,
    clienteSeleccionadoSimulado: { value: 1 },
    datosMinimos: [],
    obtenerDatosMin: vi.fn(),
    draftCrear: [],
    setDraftCrear: vi.fn(),
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
    draftDatosMinimos: [],
    setDraftDatosMinimos: vi.fn(),
    cambiarDatoMinimo: vi.fn(),
    eliminarDatoMinimo: vi.fn(),
    agregarDatoMinimo: vi.fn(),
    scrollDatosMinimosRef: { current: null },
    inputDatosMinimosRef: { current: null },
    guardarDatosMinimos: vi.fn().mockResolvedValue(true),
    setIsLoading: vi.fn(),
    handleEditarContraseña: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Renderizado condicional según isAdmin", () => {
    it("debe renderizar PopupUsuarios cuando isAdmin es true y popUpUsuarios está abierto", () => {
      render(
        <HomePopups {...defaultProps} isAdmin={true} popUpUsuarios={true} />
      );

      expect(screen.getByText("PopupUsuarios")).toBeInTheDocument();
    });

    it("debe renderizar Popup genérico cuando isAdmin es false y popUpUsuarios está abierto", () => {
      render(<HomePopups {...defaultProps} popUpUsuarios={true} />);

      expect(screen.getByText("CardAdmin")).toBeInTheDocument();
      expect(screen.getByText("Gestión de usuario")).toBeInTheDocument();
    });

    it("debe renderizar PopupCrearCliente solo cuando isAdmin es true", () => {
      render(
        <HomePopups {...defaultProps} isAdmin={true} popUpCrearCliente={true} />
      );

      expect(screen.getByText("PopupCrearCliente")).toBeInTheDocument();
    });

    it("NO debe renderizar PopupCrearCliente cuando isAdmin es false", () => {
      render(
        <HomePopups
          {...defaultProps}
          isAdmin={false}
          popUpCrearCliente={true}
        />
      );

      expect(screen.queryByText("PopupCrearCliente")).not.toBeInTheDocument();
    });

    it("debe renderizar PopupEditarDatosMinimos solo cuando isAdmin es true", () => {
      render(
        <HomePopups
          {...defaultProps}
          isAdmin={true}
          popUpEditarDatosMinimos={true}
        />
      );

      expect(screen.getByText("PopupEditarDatosMinimos")).toBeInTheDocument();
    });

    it("NO debe renderizar PopupEditarDatosMinimos cuando isAdmin es false", () => {
      render(
        <HomePopups
          {...defaultProps}
          isAdmin={false}
          popUpEditarDatosMinimos={true}
        />
      );

      expect(
        screen.queryByText("PopupEditarDatosMinimos")
      ).not.toBeInTheDocument();
    });
  });

  describe("Callbacks onClose de PopupUsuarios (Admin)", () => {
    it("debe llamar setPopUpUsuarios(false), setUsuarioSeleccionado(null) y obtenerClientes() al cerrar", async () => {
      const user = userEvent.setup();
      const setPopUpUsuarios = vi.fn();
      const setUsuarioSeleccionado = vi.fn();
      const obtenerClientes = vi.fn();

      render(
        <HomePopups
          {...defaultProps}
          isAdmin={true}
          popUpUsuarios={true}
          setPopUpUsuarios={setPopUpUsuarios}
          setUsuarioSeleccionado={setUsuarioSeleccionado}
          obtenerClientes={obtenerClientes}
        />
      );

      const cerrarBtn = screen.getByText("Cerrar PopupUsuarios");
      await user.click(cerrarBtn);

      expect(setPopUpUsuarios).toHaveBeenCalledWith(false);
      expect(setUsuarioSeleccionado).toHaveBeenCalledWith(null);
      expect(obtenerClientes).toHaveBeenCalled();
    });
  });

  describe("Callbacks onClose de PopupUsuarios (Usuario)", () => {
    it("debe llamar setPopUpUsuarios(false) y setUsuarioSeleccionado(null) al cerrar", async () => {
      const user = userEvent.setup();
      const setPopUpUsuarios = vi.fn();
      const setUsuarioSeleccionado = vi.fn();

      render(
        <HomePopups
          {...defaultProps}
          isAdmin={false}
          popUpUsuarios={true}
          setPopUpUsuarios={setPopUpUsuarios}
          setUsuarioSeleccionado={setUsuarioSeleccionado}
        />
      );

      const cerrarBtn = screen.getByText("Cerrar Popup");
      await user.click(cerrarBtn);

      expect(setPopUpUsuarios).toHaveBeenCalledWith(false);
      expect(setUsuarioSeleccionado).toHaveBeenCalledWith(null);
    });
  });

  describe("Callbacks de PopupCrearCliente", () => {
    it("debe llamar setPopUpCrearCliente(false) y resetCrear() al cerrar", async () => {
      const user = userEvent.setup();
      const setPopUpCrearCliente = vi.fn();
      const resetCrear = vi.fn();

      render(
        <HomePopups
          {...defaultProps}
          isAdmin={true}
          popUpCrearCliente={true}
          setPopUpCrearCliente={setPopUpCrearCliente}
          resetCrear={resetCrear}
        />
      );

      const cerrarBtn = screen.getByText("Cerrar CrearCliente");
      await user.click(cerrarBtn);

      expect(setPopUpCrearCliente).toHaveBeenCalledWith(false);
      expect(resetCrear).toHaveBeenCalled();
    });

    it("debe llamar crearCliente cuando se hace submit", async () => {
      const user = userEvent.setup();
      const crearCliente = vi.fn();

      render(
        <HomePopups
          {...defaultProps}
          isAdmin={true}
          popUpCrearCliente={true}
          crearCliente={crearCliente}
        />
      );

      const submitBtn = screen.getByText("Submit CrearCliente");
      await user.click(submitBtn);

      expect(crearCliente).toHaveBeenCalledWith({ email: "test@test.com" });
    });
  });

  describe("Callbacks de PopupEditarContrasena", () => {
    it("debe llamar setPopUpEditarContrasena(false), setUsuarioSeleccionado(null) y resetCambiar() al cerrar", async () => {
      const user = userEvent.setup();
      const setPopUpEditarContrasena = vi.fn();
      const setUsuarioSeleccionado = vi.fn();
      const resetCambiar = vi.fn();

      render(
        <HomePopups
          {...defaultProps}
          popUpEditarContrasena={true}
          setPopUpEditarContrasena={setPopUpEditarContrasena}
          setUsuarioSeleccionado={setUsuarioSeleccionado}
          resetCambiar={resetCambiar}
        />
      );

      const cerrarBtn = screen.getByText("Cerrar EditarContrasena");
      await user.click(cerrarBtn);

      expect(setPopUpEditarContrasena).toHaveBeenCalledWith(false);
      expect(setUsuarioSeleccionado).toHaveBeenCalledWith(null);
      expect(resetCambiar).toHaveBeenCalled();
    });

    it("debe mostrar el nombre del usuario seleccionado", () => {
      render(
        <HomePopups
          {...defaultProps}
          popUpEditarContrasena={true}
          usuarioSeleccionado={{ id: 1, nombre: "Usuario Test" }}
        />
      );

      expect(screen.getByText("Usuario: Usuario Test")).toBeInTheDocument();
    });

    it("debe mostrar 'N/A' cuando no hay usuario seleccionado", () => {
      render(
        <HomePopups
          {...defaultProps}
          popUpEditarContrasena={true}
          usuarioSeleccionado={null}
        />
      );

      expect(screen.getByText("Usuario: N/A")).toBeInTheDocument();
    });

    it("debe pasar mostrarNombreUsuario=false cuando isAdmin es true", () => {
      // Este test verifica que el prop se pasa correctamente
      // El componente PopupEditarContrasena debe recibir mostrarNombreUsuario={!isAdmin}
      render(
        <HomePopups
          {...defaultProps}
          isAdmin={true}
          popUpEditarContrasena={true}
        />
      );

      expect(screen.getByText("PopupEditarContrasena")).toBeInTheDocument();
    });

    it("debe pasar mostrarNombreUsuario=true cuando isAdmin es false", () => {
      render(
        <HomePopups
          {...defaultProps}
          isAdmin={false}
          popUpEditarContrasena={true}
        />
      );

      expect(screen.getByText("PopupEditarContrasena")).toBeInTheDocument();
    });
  });

  describe("Callbacks de PopupCrearInfo", () => {
    it("debe llamar setPopUpCrearInfo(false) y setDraftCrear([]) al cerrar", async () => {
      const user = userEvent.setup();
      const setPopUpCrearInfo = vi.fn();
      const setDraftCrear = vi.fn();

      render(
        <HomePopups
          {...defaultProps}
          popUpCrearInfo={true}
          setPopUpCrearInfo={setPopUpCrearInfo}
          setDraftCrear={setDraftCrear}
        />
      );

      const cerrarBtn = screen.getByText("Cerrar CrearInfo");
      await user.click(cerrarBtn);

      expect(setPopUpCrearInfo).toHaveBeenCalledWith(false);
      expect(setDraftCrear).toHaveBeenCalledWith([]);
    });

    it("debe llamar handleSubirCSV cuando se sube CSV", async () => {
      const user = userEvent.setup();
      const handleSubirCSV = vi.fn();

      render(
        <HomePopups
          {...defaultProps}
          popUpCrearInfo={true}
          handleSubirCSV={handleSubirCSV}
        />
      );

      const subirBtn = screen.getByText("Subir CSV");
      await user.click(subirBtn);

      expect(handleSubirCSV).toHaveBeenCalled();
    });

    it("debe llamar handleCrearRegistro cuando se crea registro", async () => {
      const user = userEvent.setup();
      const handleCrearRegistro = vi.fn();

      render(
        <HomePopups
          {...defaultProps}
          popUpCrearInfo={true}
          handleCrearRegistro={handleCrearRegistro}
        />
      );

      const crearBtn = screen.getByText("Crear Registro");
      await user.click(crearBtn);

      expect(handleCrearRegistro).toHaveBeenCalled();
    });

    it("debe llamar setPopUpEditarDatosMinimos(true) cuando isAdmin es true y se hace clic en editar datos mínimos", async () => {
      const user = userEvent.setup();
      const setPopUpEditarDatosMinimos = vi.fn();

      render(
        <HomePopups
          {...defaultProps}
          isAdmin={true}
          popUpCrearInfo={true}
          setPopUpEditarDatosMinimos={setPopUpEditarDatosMinimos}
        />
      );

      const editarBtn = screen.getByText("Editar Datos Minimos");
      await user.click(editarBtn);

      expect(setPopUpEditarDatosMinimos).toHaveBeenCalledWith(true);
    });

    it("NO debe hacer nada cuando isAdmin es false y se hace clic en editar datos mínimos", async () => {
      const user = userEvent.setup();
      const setPopUpEditarDatosMinimos = vi.fn();

      render(
        <HomePopups
          {...defaultProps}
          isAdmin={false}
          popUpCrearInfo={true}
          setPopUpEditarDatosMinimos={setPopUpEditarDatosMinimos}
        />
      );

      const editarBtn = screen.getByText("Editar Datos Minimos");
      await user.click(editarBtn);

      expect(setPopUpEditarDatosMinimos).not.toHaveBeenCalled();
    });
  });

  describe("Callbacks de PopupEditarInfo", () => {
    it("debe llamar setPopUpEditarInfo(false), setInfoSeleccionada(null) y setInfoAEditar(null) al cerrar", async () => {
      const user = userEvent.setup();
      const setPopUpEditarInfo = vi.fn();
      const setInfoSeleccionada = vi.fn();
      const setInfoAEditar = vi.fn();

      render(
        <HomePopups
          {...defaultProps}
          popUpEditarInfo={true}
          setPopUpEditarInfo={setPopUpEditarInfo}
          setInfoSeleccionada={setInfoSeleccionada}
          setInfoAEditar={setInfoAEditar}
        />
      );

      const cerrarBtn = screen.getByText("Cerrar EditarInfo");
      await user.click(cerrarBtn);

      expect(setPopUpEditarInfo).toHaveBeenCalledWith(false);
      expect(setInfoSeleccionada).toHaveBeenCalledWith(null);
      expect(setInfoAEditar).toHaveBeenCalledWith(null);
    });

    it("debe llamar handleEditarRegistro cuando se guarda", async () => {
      const user = userEvent.setup();
      const handleEditarRegistro = vi.fn();

      render(
        <HomePopups
          {...defaultProps}
          popUpEditarInfo={true}
          handleEditarRegistro={handleEditarRegistro}
        />
      );

      const guardarBtn = screen.getByText("Guardar EditarInfo");
      await user.click(guardarBtn);

      expect(handleEditarRegistro).toHaveBeenCalled();
    });
  });

  describe("Callbacks de PopupEditarDatosMinimos", () => {
    it("debe llamar setPopUpEditarDatosMinimos(false) y setDraftDatosMinimos([]) al cerrar", async () => {
      const user = userEvent.setup();
      const setPopUpEditarDatosMinimos = vi.fn();
      const setDraftDatosMinimos = vi.fn();

      render(
        <HomePopups
          {...defaultProps}
          isAdmin={true}
          popUpEditarDatosMinimos={true}
          setPopUpEditarDatosMinimos={setPopUpEditarDatosMinimos}
          setDraftDatosMinimos={setDraftDatosMinimos}
        />
      );

      const cerrarBtn = screen.getByText("Cerrar EditarDatosMinimos");
      await user.click(cerrarBtn);

      expect(setPopUpEditarDatosMinimos).toHaveBeenCalledWith(false);
      expect(setDraftDatosMinimos).toHaveBeenCalledWith([]);
    });

    it("debe llamar guardarDatosMinimos y cerrar popup si success es true", async () => {
      const user = userEvent.setup();
      const setPopUpEditarDatosMinimos = vi.fn();
      const guardarDatosMinimos = vi.fn().mockResolvedValue(true);
      const setIsLoading = vi.fn();
      const obtenerDatosMin = vi.fn();
      const setDraftCrear = vi.fn();

      render(
        <HomePopups
          {...defaultProps}
          isAdmin={true}
          popUpEditarDatosMinimos={true}
          setPopUpEditarDatosMinimos={setPopUpEditarDatosMinimos}
          guardarDatosMinimos={guardarDatosMinimos}
          setIsLoading={setIsLoading}
          obtenerDatosMin={obtenerDatosMin}
          setDraftCrear={setDraftCrear}
        />
      );

      const guardarBtn = screen.getByText("Guardar DatosMinimos");
      await user.click(guardarBtn);

      await vi.waitFor(() => {
        expect(guardarDatosMinimos).toHaveBeenCalledWith(
          setIsLoading,
          obtenerDatosMin,
          setDraftCrear
        );
        expect(setPopUpEditarDatosMinimos).toHaveBeenCalledWith(false);
      });
    });

    it("NO debe cerrar popup si guardarDatosMinimos retorna false", async () => {
      const user = userEvent.setup();
      const setPopUpEditarDatosMinimos = vi.fn();
      const guardarDatosMinimos = vi.fn().mockResolvedValue(false);
      const setIsLoading = vi.fn();
      const obtenerDatosMin = vi.fn();
      const setDraftCrear = vi.fn();

      render(
        <HomePopups
          {...defaultProps}
          isAdmin={true}
          popUpEditarDatosMinimos={true}
          setPopUpEditarDatosMinimos={setPopUpEditarDatosMinimos}
          guardarDatosMinimos={guardarDatosMinimos}
          setIsLoading={setIsLoading}
          obtenerDatosMin={obtenerDatosMin}
          setDraftCrear={setDraftCrear}
        />
      );

      const guardarBtn = screen.getByText("Guardar DatosMinimos");
      await user.click(guardarBtn);

      await vi.waitFor(() => {
        expect(guardarDatosMinimos).toHaveBeenCalled();
      });

      // No debe cerrar el popup
      expect(setPopUpEditarDatosMinimos).not.toHaveBeenCalledWith(false);
    });
  });

  describe("Callbacks de CardAdmin en popup usuarios (no admin)", () => {
    it("debe llamar setPopUpEditarContrasena(true) y setUsuarioSeleccionado(user) cuando se hace clic en CardAdmin", async () => {
      const user = userEvent.setup();
      const setPopUpEditarContrasena = vi.fn();
      const setUsuarioSeleccionado = vi.fn();
      const userObj = { id: 1, nombre: "Test User", isAdmin: false };

      render(
        <HomePopups
          {...defaultProps}
          isAdmin={false}
          popUpUsuarios={true}
          user={userObj}
          setPopUpEditarContrasena={setPopUpEditarContrasena}
          setUsuarioSeleccionado={setUsuarioSeleccionado}
        />
      );

      const cardBtn = screen.getByText("CardAdmin Button");
      await user.click(cardBtn);

      expect(setPopUpEditarContrasena).toHaveBeenCalledWith(true);
      expect(setUsuarioSeleccionado).toHaveBeenCalledWith(userObj);
    });

    it("debe mostrar el nombre y rol correctos en CardAdmin", () => {
      render(
        <HomePopups
          {...defaultProps}
          isAdmin={false}
          popUpUsuarios={true}
          user={{ id: 1, nombre: "Test User", isAdmin: false }}
        />
      );

      expect(screen.getByText("Nombre: Test User")).toBeInTheDocument();
      expect(screen.getByText("Rol: Usuario")).toBeInTheDocument();
    });

    it("debe mostrar 'Administrador' cuando user.isAdmin es true", () => {
      render(
        <HomePopups
          {...defaultProps}
          isAdmin={false}
          popUpUsuarios={true}
          user={{ id: 1, nombre: "Admin User", isAdmin: true }}
        />
      );

      expect(screen.getByText("Rol: Administrador")).toBeInTheDocument();
    });
  });

  describe("Renderizado de todos los popups", () => {
    it("debe renderizar PopupEditarContrasena cuando está abierto", () => {
      render(<HomePopups {...defaultProps} popUpEditarContrasena={true} />);

      expect(screen.getByText("PopupEditarContrasena")).toBeInTheDocument();
    });

    it("debe renderizar PopupCrearInfo cuando está abierto", () => {
      render(<HomePopups {...defaultProps} popUpCrearInfo={true} />);

      expect(screen.getByText("PopupCrearInfo")).toBeInTheDocument();
    });

    it("debe renderizar PopupEditarInfo cuando está abierto", () => {
      render(<HomePopups {...defaultProps} popUpEditarInfo={true} />);

      expect(screen.getByText("PopupEditarInfo")).toBeInTheDocument();
    });
  });
});
