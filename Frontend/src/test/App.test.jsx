import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import PropTypes from "prop-types";
import App from "../App.jsx";

// Mock de AppRouter
vi.mock("../routes/AppRouter", () => ({
  default: () => <div>AppRouter</div>,
}));

// Mock de AuthContext
vi.mock("../context/AuthContext", () => {
  const MockAuthProvider = ({ children }) => <div>{children}</div>;
  MockAuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  return {
    AuthProvider: MockAuthProvider,
  };
});

// Mock de react-hot-toast
vi.mock("react-hot-toast", () => ({
  Toaster: () => <div>Toaster</div>,
}));

describe("App", () => {
  let mockObserve;
  let mockDisconnect;
  let mockObserverCallback;
  let mockRemoveEventListener;
  let listeners;
  let rootElement;

  beforeEach(() => {
    listeners = new Map();
    rootElement = {
      getAttribute: vi.fn(() => null),
      removeAttribute: vi.fn(),
    };

    mockObserve = vi.fn();
    mockDisconnect = vi.fn();

    // Mock de MutationObserver como constructor
    global.MutationObserver = class MutationObserver {
      constructor(callback) {
        this.callback = callback;
        mockObserverCallback = callback;
      }
      observe = mockObserve;
      disconnect = mockDisconnect;
    };

    // Mock de addEventListener y removeEventListener
    document.addEventListener = vi.fn((event, handler) => {
      listeners.set(event, handler);
    });
    mockRemoveEventListener = vi.fn((event) => {
      listeners.delete(event);
    });
    document.removeEventListener = mockRemoveEventListener;

    // Mock de getElementById
    document.getElementById = vi.fn((id) => {
      if (id === "root") {
        return rootElement;
      }
      return null;
    });

    // Mock de activeElement
    Object.defineProperty(document, "activeElement", {
      value: {
        tagName: "INPUT",
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    listeners.clear();
  });

  it("debe renderizar correctamente", () => {
    render(<App />);

    expect(screen.getByText("AppRouter")).toBeInTheDocument();
  });

  it("debe configurar MutationObserver en el root cuando root existe", () => {
    render(<App />);

    expect(document.getElementById).toHaveBeenCalledWith("root");
    expect(mockObserve).toHaveBeenCalledWith(rootElement, {
      attributes: true,
      attributeFilter: ["aria-hidden"],
    });
  });

  it("NO debe configurar MutationObserver cuando root no existe", () => {
    document.getElementById = vi.fn(() => null);

    render(<App />);

    expect(mockObserve).not.toHaveBeenCalled();
    expect(document.addEventListener).not.toHaveBeenCalled();
  });

  it("debe registrar listener de focusin cuando root existe", () => {
    render(<App />);

    expect(document.addEventListener).toHaveBeenCalledWith(
      "focusin",
      expect.any(Function)
    );
  });

  it("debe remover aria-hidden cuando root tiene aria-hidden=true y hay un input con focus", () => {
    rootElement.getAttribute = vi.fn(() => "true");
    Object.defineProperty(document, "activeElement", {
      value: { tagName: "INPUT" },
      writable: true,
      configurable: true,
    });

    render(<App />);

    const focusHandler = listeners.get("focusin");
    expect(focusHandler).toBeDefined();

    focusHandler({});

    expect(rootElement.removeAttribute).toHaveBeenCalledWith("aria-hidden");
  });

  it("NO debe remover aria-hidden cuando root no tiene aria-hidden=true", () => {
    rootElement.getAttribute = vi.fn(() => null);
    Object.defineProperty(document, "activeElement", {
      value: { tagName: "INPUT" },
      writable: true,
      configurable: true,
    });

    render(<App />);

    const focusHandler = listeners.get("focusin");
    focusHandler({});

    expect(rootElement.removeAttribute).not.toHaveBeenCalled();
  });

  it("debe remover aria-hidden cuando MutationObserver detecta cambio y activeElement es INPUT", () => {
    rootElement.getAttribute = vi.fn(() => "true");
    Object.defineProperty(document, "activeElement", {
      value: { tagName: "INPUT" },
      writable: true,
      configurable: true,
    });

    render(<App />);

    // Simular mutación del observer
    const mutations = [
      {
        type: "attributes",
        attributeName: "aria-hidden",
      },
    ];

    mockObserverCallback(mutations);

    expect(rootElement.removeAttribute).toHaveBeenCalledWith("aria-hidden");
  });

  it("debe remover aria-hidden cuando MutationObserver detecta cambio y activeElement es TEXTAREA", () => {
    rootElement.getAttribute = vi.fn(() => "true");
    Object.defineProperty(document, "activeElement", {
      value: { tagName: "TEXTAREA" },
      writable: true,
      configurable: true,
    });

    render(<App />);

    const mutations = [
      {
        type: "attributes",
        attributeName: "aria-hidden",
      },
    ];

    mockObserverCallback(mutations);

    expect(rootElement.removeAttribute).toHaveBeenCalledWith("aria-hidden");
  });

  it("debe remover aria-hidden cuando MutationObserver detecta cambio y activeElement es SELECT", () => {
    rootElement.getAttribute = vi.fn(() => "true");
    Object.defineProperty(document, "activeElement", {
      value: { tagName: "SELECT" },
      writable: true,
      configurable: true,
    });

    render(<App />);

    const mutations = [
      {
        type: "attributes",
        attributeName: "aria-hidden",
      },
    ];

    mockObserverCallback(mutations);

    expect(rootElement.removeAttribute).toHaveBeenCalledWith("aria-hidden");
  });

  it("NO debe remover aria-hidden cuando MutationObserver detecta cambio pero activeElement no es INPUT/TEXTAREA/SELECT", () => {
    rootElement.getAttribute = vi.fn(() => "true");
    Object.defineProperty(document, "activeElement", {
      value: { tagName: "DIV" },
      writable: true,
      configurable: true,
    });

    render(<App />);

    const mutations = [
      {
        type: "attributes",
        attributeName: "aria-hidden",
      },
    ];

    mockObserverCallback(mutations);

    expect(rootElement.removeAttribute).not.toHaveBeenCalled();
  });

  it("NO debe remover aria-hidden cuando MutationObserver detecta cambio pero el tipo no es 'attributes'", () => {
    rootElement.getAttribute = vi.fn(() => "true");
    Object.defineProperty(document, "activeElement", {
      value: { tagName: "INPUT" },
      writable: true,
      configurable: true,
    });

    render(<App />);

    const mutations = [
      {
        type: "childList",
        attributeName: "aria-hidden",
      },
    ];

    mockObserverCallback(mutations);

    expect(rootElement.removeAttribute).not.toHaveBeenCalled();
  });

  it("NO debe remover aria-hidden cuando MutationObserver detecta cambio pero attributeName no es 'aria-hidden'", () => {
    rootElement.getAttribute = vi.fn(() => "true");
    Object.defineProperty(document, "activeElement", {
      value: { tagName: "INPUT" },
      writable: true,
      configurable: true,
    });

    render(<App />);

    const mutations = [
      {
        type: "attributes",
        attributeName: "class",
      },
    ];

    mockObserverCallback(mutations);

    expect(rootElement.removeAttribute).not.toHaveBeenCalled();
  });

  it("NO debe remover aria-hidden cuando root no tiene aria-hidden=true en el observer", () => {
    rootElement.getAttribute = vi.fn(() => null);
    Object.defineProperty(document, "activeElement", {
      value: { tagName: "INPUT" },
      writable: true,
      configurable: true,
    });

    render(<App />);

    const mutations = [
      {
        type: "attributes",
        attributeName: "aria-hidden",
      },
    ];

    mockObserverCallback(mutations);

    expect(rootElement.removeAttribute).not.toHaveBeenCalled();
  });

  it("debe limpiar MutationObserver al desmontar", () => {
    const { unmount } = render(<App />);

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("debe remover listener de focusin al desmontar", () => {
    const { unmount } = render(<App />);

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      "focusin",
      expect.any(Function)
    );
  });

  it("debe manejar múltiples mutaciones en el observer", () => {
    rootElement.getAttribute = vi.fn(() => "true");
    Object.defineProperty(document, "activeElement", {
      value: { tagName: "INPUT" },
      writable: true,
      configurable: true,
    });

    render(<App />);

    const mutations = [
      {
        type: "attributes",
        attributeName: "aria-hidden",
      },
      {
        type: "attributes",
        attributeName: "aria-hidden",
      },
    ];

    mockObserverCallback(mutations);

    // Debe llamar removeAttribute por cada mutación válida
    expect(rootElement.removeAttribute).toHaveBeenCalledTimes(2);
  });

  it("debe manejar el caso cuando activeElement es null", () => {
    rootElement.getAttribute = vi.fn(() => "true");
    Object.defineProperty(document, "activeElement", {
      value: null,
      writable: true,
      configurable: true,
    });

    render(<App />);

    const mutations = [
      {
        type: "attributes",
        attributeName: "aria-hidden",
      },
    ];

    mockObserverCallback(mutations);

    // No debe hacer nada si activeElement es null
    expect(rootElement.removeAttribute).not.toHaveBeenCalled();
  });
});
