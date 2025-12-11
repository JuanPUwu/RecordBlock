import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Login from "../../pages/Login.jsx";

// Mock de AuthContext
const mockLogin = vi.fn();
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

// Mock de forgotPassService
const mockSolicitarRecuperacion = vi.fn();
vi.mock("../../services/forgotPassService.js", () => ({
  useForgotPasswordService: () => ({
    solicitarRecuperacion: mockSolicitarRecuperacion,
  }),
}));

// Mock de react-hot-toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock de reactjs-popup
vi.mock("reactjs-popup", () => ({
  default: ({ open, onClose, children }) => {
    if (!open) return null;
    return (
      <div data-testid="popup">
        {children}
        <button onClick={onClose}>Cerrar</button>
      </div>
    );
  },
}));

// Mock de Spinner
vi.mock("../../components/Spinner.jsx", () => ({
  default: () => <div>Spinner</div>,
}));

// Helper para crear una promesa con delay
const createDelayedPromise = (result, delay = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(result), delay);
  });
};

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockResolvedValue({ success: true });
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  it("debe renderizar correctamente", () => {
    renderLogin();

    expect(screen.getByText("Iniciar sesión")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("ejemplo@gmail.com")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("∗∗∗∗∗∗∗∗∗∗")).toBeInTheDocument();
    expect(screen.getByText("Ingresar")).toBeInTheDocument();
  });

  it("debe mostrar errores de validación cuando el formulario está vacío", async () => {
    const user = userEvent.setup();
    renderLogin();

    const submitButton = screen.getByText("Ingresar");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("El correo es obligatorio")).toBeInTheDocument();
      expect(
        screen.getByText("La contraseña es obligatoria")
      ).toBeInTheDocument();
    });
  });

  it("debe mostrar error cuando el email no es válido", async () => {
    const user = userEvent.setup();
    const { container } = renderLogin();

    const emailInput = screen.getByPlaceholderText("ejemplo@gmail.com");
    await user.clear(emailInput);
    // Usar un email claramente inválido sin @ ni dominio
    await user.type(emailInput, "notanemail");

    // Agregar una contraseña para que el formulario tenga ambos campos
    const passwordInput = screen.getByPlaceholderText("∗∗∗∗∗∗∗∗∗∗");
    await user.type(passwordInput, "password123");

    // Disparar el submit del formulario directamente para evitar que el input type="email" bloquee el submit
    const form = container.querySelector("form");
    await act(async () => {
      const submitEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      });
      form.dispatchEvent(submitEvent);
    });

    // Esperar a que aparezca el error de validación
    // react-hook-form valida en onSubmit por defecto y previene el submit si hay errores
    // El error se muestra en un span dentro de cont-label-login
    await waitFor(
      () => {
        // Buscar el mensaje de error exacto
        const errorMessage = screen.queryByText("Debe ser un correo válido");
        expect(errorMessage).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verificar que login NO fue llamado porque hay un error de validación
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("debe llamar a login cuando el formulario es válido", async () => {
    const user = userEvent.setup();
    renderLogin();

    const emailInput = screen.getByPlaceholderText("ejemplo@gmail.com");
    const passwordInput = screen.getByPlaceholderText("∗∗∗∗∗∗∗∗∗∗");

    await user.type(emailInput, "test@test.com");
    await user.type(passwordInput, "password123");

    const submitButton = screen.getByText("Ingresar");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@test.com", "password123");
    });
  });

  it("debe mostrar spinner cuando isSubmitting es true", async () => {
    const user = userEvent.setup();
    renderLogin();

    const emailInput = screen.getByPlaceholderText("ejemplo@gmail.com");
    const passwordInput = screen.getByPlaceholderText("∗∗∗∗∗∗∗∗∗∗");

    await user.type(emailInput, "test@test.com");
    await user.type(passwordInput, "password123");

    // Mock para que el submit tarde
    mockLogin.mockImplementation(() => createDelayedPromise({ success: true }));

    const submitButton = screen.getByText("Ingresar");
    await user.click(submitButton);

    // El spinner debería aparecer durante el submit
    await waitFor(() => {
      expect(screen.getByText("Spinner")).toBeInTheDocument();
    });
  });

  it("debe abrir el popup de forgot password cuando se hace clic en el botón", async () => {
    const user = userEvent.setup();
    renderLogin();

    const forgotButton = screen.getByText("¿Olvidaste tu contraseña?");
    await user.click(forgotButton);

    expect(screen.getByTestId("popup")).toBeInTheDocument();
    expect(screen.getByText("Restablecer contraseña")).toBeInTheDocument();
  });

  it("debe cerrar el popup de forgot password", async () => {
    const user = userEvent.setup();
    renderLogin();

    const forgotButton = screen.getByText("¿Olvidaste tu contraseña?");
    await user.click(forgotButton);

    const closeButton = screen.getByText("Cerrar");
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId("popup")).not.toBeInTheDocument();
    });
  });

  it("debe mostrar errores de validación en el formulario de forgot password", async () => {
    const user = userEvent.setup();
    renderLogin();

    const forgotButton = screen.getByText("¿Olvidaste tu contraseña?");
    await user.click(forgotButton);

    const submitButton = screen.getByText("Enviar");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("El correo es obligatorio", { exact: false })
      ).toBeInTheDocument();
    });
  });

  it("debe llamar a solicitarRecuperacion cuando el formulario de forgot password es válido", async () => {
    const user = userEvent.setup();
    mockSolicitarRecuperacion.mockResolvedValue({ success: true });
    renderLogin();

    const forgotButton = screen.getByText("¿Olvidaste tu contraseña?");
    await user.click(forgotButton);

    // Usar getByLabelText para el input dentro del popup
    const emailInput = screen.getByLabelText("Correo asociado:");
    await user.type(emailInput, "test@test.com");

    const submitButton = screen.getByText("Enviar");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSolicitarRecuperacion).toHaveBeenCalledWith("test@test.com");
    });
  });

  it("debe mostrar mensaje de éxito cuando solicitarRecuperacion es exitoso", async () => {
    const user = userEvent.setup();
    const toast = await import("react-hot-toast");
    mockSolicitarRecuperacion.mockResolvedValue({ success: true });
    renderLogin();

    const forgotButton = screen.getByText("¿Olvidaste tu contraseña?");
    await user.click(forgotButton);

    const emailInput = screen.getByLabelText("Correo asociado:");
    await user.type(emailInput, "test@test.com");

    const submitButton = screen.getByText("Enviar");
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.default.success).toHaveBeenCalledWith(
        "Se ha enviado un correo de recuperación"
      );
    });
  });

  it("debe cerrar el popup y resetear el formulario cuando solicitarRecuperacion es exitoso", async () => {
    const user = userEvent.setup();
    mockSolicitarRecuperacion.mockResolvedValue({ success: true });
    renderLogin();

    const forgotButton = screen.getByText("¿Olvidaste tu contraseña?");
    await user.click(forgotButton);

    const emailInput = screen.getByLabelText("Correo asociado:");
    await user.type(emailInput, "test@test.com");

    const submitButton = screen.getByText("Enviar");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByTestId("popup")).not.toBeInTheDocument();
    });
  });

  it("debe mostrar mensaje de error cuando solicitarRecuperacion falla", async () => {
    const user = userEvent.setup();
    const toast = await import("react-hot-toast");
    mockSolicitarRecuperacion.mockResolvedValue({
      success: false,
      error: "Error al enviar correo",
    });
    renderLogin();

    const forgotButton = screen.getByText("¿Olvidaste tu contraseña?");
    await user.click(forgotButton);

    const emailInput = screen.getByLabelText("Correo asociado:");
    await user.type(emailInput, "test@test.com");

    const submitButton = screen.getByText("Enviar");
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.default.error).toHaveBeenCalledWith(
        "Error al enviar correo"
      );
    });
  });

  it("debe mostrar mensaje de error por defecto cuando solicitarRecuperacion falla sin error", async () => {
    const user = userEvent.setup();
    const toast = await import("react-hot-toast");
    mockSolicitarRecuperacion.mockResolvedValue({ success: false });
    renderLogin();

    const forgotButton = screen.getByText("¿Olvidaste tu contraseña?");
    await user.click(forgotButton);

    const emailInput = screen.getByLabelText("Correo asociado:");
    await user.type(emailInput, "test@test.com");

    const submitButton = screen.getByText("Enviar");
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.default.error).toHaveBeenCalledWith(
        "No se pudo enviar el correo de recuperación"
      );
    });
  });

  it("debe mostrar spinner cuando isSubmittingForgot es true", async () => {
    const user = userEvent.setup();
    mockSolicitarRecuperacion.mockImplementation(() =>
      createDelayedPromise({ success: true })
    );
    renderLogin();

    const forgotButton = screen.getByText("¿Olvidaste tu contraseña?");
    await user.click(forgotButton);

    const emailInput = screen.getByLabelText("Correo asociado:");
    await user.type(emailInput, "test@test.com");

    const submitButton = screen.getByText("Enviar");
    await user.click(submitButton);

    // El spinner debería aparecer durante el submit
    await waitFor(() => {
      const spinners = screen.getAllByText("Spinner");
      expect(spinners.length).toBeGreaterThan(0);
    });
  });

  it("debe enfocar automáticamente el campo email al montar", async () => {
    renderLogin();

    const emailInput = screen.getByPlaceholderText("ejemplo@gmail.com");

    await waitFor(() => {
      expect(emailInput).toHaveFocus();
    });
  });

  it("debe resetear el formulario de forgot password al cerrar el popup", async () => {
    const user = userEvent.setup();
    renderLogin();

    const forgotButton = screen.getByText("¿Olvidaste tu contraseña?");
    await user.click(forgotButton);

    const emailInput = screen.getByLabelText("Correo asociado:");
    await user.type(emailInput, "test@test.com");

    const closeButton = screen.getByText("Cerrar");
    await user.click(closeButton);

    // Abrir de nuevo y verificar que está vacío
    await user.click(forgotButton);

    const emailInputAgain = screen.getByLabelText("Correo asociado:");
    expect(emailInputAgain.value).toBe("");
  });

  it("debe llamar a login con los datos correctos cuando se envía el formulario", async () => {
    const user = userEvent.setup();
    renderLogin();

    const emailInput = screen.getByPlaceholderText("ejemplo@gmail.com");
    const passwordInput = screen.getByPlaceholderText("∗∗∗∗∗∗∗∗∗∗");

    await user.type(emailInput, "usuario@test.com");
    await user.type(passwordInput, "mipassword123");

    const submitButton = screen.getByText("Ingresar");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        "usuario@test.com",
        "mipassword123"
      );
    });
  });

  it("debe renderizar el footer vacío", () => {
    const { container } = renderLogin();
    const footer = container.querySelector("footer");
    expect(footer).toBeInTheDocument();
  });

  it("debe renderizar las imágenes correctamente", () => {
    const { container } = renderLogin();
    const images = container.querySelectorAll("img");
    expect(images.length).toBeGreaterThan(0);
  });

  it("debe renderizar el h2 con el texto correcto", () => {
    renderLogin();
    expect(
      screen.getByText(/Accede a tu cuenta para poder gestionar/)
    ).toBeInTheDocument();
  });

  it("debe ejecutar iniciarSesion cuando se envía el formulario", async () => {
    const user = userEvent.setup();
    renderLogin();

    const emailInput = screen.getByPlaceholderText("ejemplo@gmail.com");
    const passwordInput = screen.getByPlaceholderText("∗∗∗∗∗∗∗∗∗∗");

    await user.type(emailInput, "test@test.com");
    await user.type(passwordInput, "password123");

    const submitButton = screen.getByText("Ingresar");
    await user.click(submitButton);

    // Verificar que iniciarSesion fue llamado (a través de login)
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@test.com", "password123");
    });
  });

  it("debe renderizar el div con estilos inline para el logo", () => {
    const { container } = renderLogin();
    const logoDiv = container.querySelector('div[style*="width: 48px"]');
    expect(logoDiv).toBeInTheDocument();
    expect(logoDiv).toHaveStyle({
      width: "48px",
      height: "48px",
      minHeight: "48px",
      margin: "32px 0 16px 0",
    });
  });

  it("debe renderizar la imagen del candado con alt correcto", () => {
    const { container } = renderLogin();
    const images = container.querySelectorAll("img");
    const candadoImg = Array.from(images).find(
      (img) => img.alt === "Logo RecordBlock"
    );
    expect(candadoImg).toBeInTheDocument();
  });

  it("debe renderizar la imagen del correo con alt correcto", () => {
    const { container } = renderLogin();
    const images = container.querySelectorAll("img");
    const correoImg = Array.from(images).find(
      (img) => img.alt === "Correo electrónico"
    );
    expect(correoImg).toBeInTheDocument();
  });

  it("debe renderizar la imagen de la llave con alt correcto", () => {
    const { container } = renderLogin();
    const images = container.querySelectorAll("img");
    const llaveImg = Array.from(images).find((img) => img.alt === "Contraseña");
    expect(llaveImg).toBeInTheDocument();
  });

  it("debe renderizar el h1 con el texto 'Iniciar sesión'", () => {
    renderLogin();
    expect(screen.getByText("Iniciar sesión")).toBeInTheDocument();
  });

  it("debe renderizar el h2 completo con el texto de descripción", () => {
    renderLogin();
    const h2 = screen.getByText(/Accede a tu cuenta para poder gestionar/);
    expect(h2).toBeInTheDocument();
    expect(h2.textContent).toContain("tus registros de manera segura");
  });

  it("debe renderizar el input de email con el id correcto", () => {
    renderLogin();
    const emailInput = screen.getByLabelText("Correo");
    expect(emailInput).toHaveAttribute("id", "email");
    expect(emailInput).toHaveAttribute("type", "email");
  });

  it("debe renderizar el input de password con el id correcto", () => {
    renderLogin();
    const passwordInput = screen.getByLabelText("Contraseña");
    expect(passwordInput).toHaveAttribute("id", "password");
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("debe renderizar el botón de forgot password con la clase correcta", () => {
    renderLogin();
    const forgotButton = screen.getByText("¿Olvidaste tu contraseña?");
    expect(forgotButton).toHaveClass("btn-forgot-pass");
    expect(forgotButton).toHaveAttribute("type", "button");
  });

  it("debe renderizar el botón de login con las clases correctas", () => {
    renderLogin();
    const loginButton = screen.getByText("Ingresar");
    expect(loginButton).toHaveClass("btn-login");
    expect(loginButton).toHaveClass("btn-form-primary");
    expect(loginButton).toHaveAttribute("type", "submit");
    expect(loginButton).toHaveAttribute("title", "Iniciar sesión");
  });

  it("debe deshabilitar el botón de login cuando isSubmitting es true", async () => {
    const user = userEvent.setup();
    mockLogin.mockImplementation(() => createDelayedPromise({ success: true }));
    renderLogin();

    const emailInput = screen.getByPlaceholderText("ejemplo@gmail.com");
    const passwordInput = screen.getByPlaceholderText("∗∗∗∗∗∗∗∗∗∗");

    await user.type(emailInput, "test@test.com");
    await user.type(passwordInput, "password123");

    const submitButton = screen.getByText("Ingresar");
    await user.click(submitButton);

    // El botón debe estar deshabilitado durante el submit
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it("debe renderizar el popup de forgot password con el título correcto", async () => {
    const user = userEvent.setup();
    renderLogin();

    const forgotButton = screen.getByText("¿Olvidaste tu contraseña?");
    await user.click(forgotButton);

    expect(screen.getByText("Restablecer contraseña")).toBeInTheDocument();
  });

  it("debe renderizar el input de forgotEmail con el id y clase correctos", async () => {
    const user = userEvent.setup();
    renderLogin();

    const forgotButton = screen.getByText("¿Olvidaste tu contraseña?");
    await user.click(forgotButton);

    const forgotEmailInput = screen.getByLabelText("Correo asociado:");
    expect(forgotEmailInput).toHaveAttribute("id", "forgotEmail");
    expect(forgotEmailInput).toHaveClass("forgot-pass");
    expect(forgotEmailInput).toHaveAttribute("type", "email");
  });

  it("debe renderizar el separador horizontal en el popup", async () => {
    const user = userEvent.setup();
    const { container } = renderLogin();

    const forgotButton = screen.getByText("¿Olvidaste tu contraseña?");
    await user.click(forgotButton);

    const sepHrz = container.querySelector(".sep-hrz");
    expect(sepHrz).toBeInTheDocument();
  });

  it("debe renderizar el botón de enviar en el popup con las clases correctas", async () => {
    const user = userEvent.setup();
    renderLogin();

    const forgotButton = screen.getByText("¿Olvidaste tu contraseña?");
    await user.click(forgotButton);

    const sendButton = screen.getByText("Enviar");
    expect(sendButton).toHaveClass("btn-forgot-pass");
    expect(sendButton).toHaveClass("btn-form-primary");
    expect(sendButton).toHaveAttribute("type", "submit");
    expect(sendButton).toHaveAttribute(
      "title",
      "Enviar correo de recuperación"
    );
  });

  it("debe deshabilitar el botón de enviar cuando isSubmittingForgot es true", async () => {
    const user = userEvent.setup();
    mockSolicitarRecuperacion.mockImplementation(() =>
      createDelayedPromise({ success: true })
    );
    renderLogin();

    const forgotButton = screen.getByText("¿Olvidaste tu contraseña?");
    await user.click(forgotButton);

    const emailInput = screen.getByLabelText("Correo asociado:");
    await user.type(emailInput, "test@test.com");

    const sendButton = screen.getByText("Enviar");
    await user.click(sendButton);

    // El botón debe estar deshabilitado durante el submit
    await waitFor(() => {
      expect(sendButton).toBeDisabled();
    });
  });

  it("debe renderizar el contenedor con la clase fondo-login", () => {
    const { container } = renderLogin();
    const fondoLogin = container.querySelector(".fondo-login");
    expect(fondoLogin).toBeInTheDocument();
  });

  it("debe renderizar el contenedor con la clase cont-login", () => {
    const { container } = renderLogin();
    const contLogin = container.querySelector(".cont-login");
    expect(contLogin).toBeInTheDocument();
  });

  it("debe renderizar el contenedor con la clase cont-popUp cuando el popup está abierto", async () => {
    const user = userEvent.setup();
    const { container } = renderLogin();

    const forgotButton = screen.getByText("¿Olvidaste tu contraseña?");
    await user.click(forgotButton);

    const contPopUp = container.querySelector(".cont-popUp");
    expect(contPopUp).toBeInTheDocument();
  });
});
