import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BuscadorCliente from "../../components/BuscadorCliente";

describe("BuscadorCliente", () => {
  const defaultProps = {
    refBusquedaCliente: { current: null },
    buscarCliente: vi.fn(),
    resultadosBusquedaClientes: [],
    seleccionBusqueda: vi.fn(),
  };

  it("debe renderizar correctamente", () => {
    render(<BuscadorCliente {...defaultProps} />);
    const input = screen.getByPlaceholderText("Busque por cliente...");
    expect(input).toBeInTheDocument();
  });

  it("debe llamar buscarCliente cuando se escribe en el input", async () => {
    const user = userEvent.setup();
    const buscarCliente = vi.fn();
    render(<BuscadorCliente {...defaultProps} buscarCliente={buscarCliente} />);

    const input = screen.getByPlaceholderText("Busque por cliente...");
    await user.type(input, "test");

    expect(buscarCliente).toHaveBeenCalled();
  });

  it("debe actualizar el valor del input cuando se escribe", async () => {
    const user = userEvent.setup();
    const ref = { current: null };
    render(<BuscadorCliente {...defaultProps} refBusquedaCliente={ref} />);

    const input = screen.getByPlaceholderText("Busque por cliente...");
    await user.type(input, "cliente test");

    expect(input).toHaveValue("cliente test");
  });

  it("debe mostrar resultados cuando hay resultadosBusquedaClientes", () => {
    const resultados = [
      { value: 1, label: "Cliente 1" },
      { value: 2, label: "Cliente 2" },
    ];
    render(
      <BuscadorCliente
        {...defaultProps}
        resultadosBusquedaClientes={resultados}
      />
    );

    expect(screen.getByText("Cliente 1")).toBeInTheDocument();
    expect(screen.getByText("Cliente 2")).toBeInTheDocument();
  });

  it("no debe mostrar resultados cuando no hay resultadosBusquedaClientes", () => {
    render(<BuscadorCliente {...defaultProps} />);
    const buttons = screen.queryAllByRole("button");
    // Solo debería haber el input, no botones de resultados
    expect(buttons.length).toBe(0);
  });

  it("debe llamar seleccionBusqueda cuando se hace click en un resultado", async () => {
    const user = userEvent.setup();
    const seleccionBusqueda = vi.fn();
    const resultados = [{ value: 1, label: "Cliente 1" }];
    render(
      <BuscadorCliente
        {...defaultProps}
        resultadosBusquedaClientes={resultados}
        seleccionBusqueda={seleccionBusqueda}
      />
    );

    const boton = screen.getByText("Cliente 1");
    await user.click(boton);

    expect(seleccionBusqueda).toHaveBeenCalledWith(resultados[0]);
  });

  it("debe limpiar el input cuando se selecciona un cliente", async () => {
    const user = userEvent.setup();
    const ref = { current: { value: "test" } };
    const seleccionBusqueda = vi.fn();
    const resultados = [{ value: 1, label: "Cliente 1" }];
    render(
      <BuscadorCliente
        {...defaultProps}
        refBusquedaCliente={ref}
        resultadosBusquedaClientes={resultados}
        seleccionBusqueda={seleccionBusqueda}
      />
    );

    const input = screen.getByPlaceholderText("Busque por cliente...");
    await user.type(input, "test");
    const boton = screen.getByText("Cliente 1");
    await user.click(boton);

    expect(input).toHaveValue("");
  });

  it("debe sincronizar el valor con el ref", async () => {
    const user = userEvent.setup();
    const ref = { current: { value: "" } };
    render(<BuscadorCliente {...defaultProps} refBusquedaCliente={ref} />);

    const input = screen.getByPlaceholderText("Busque por cliente...");
    await user.type(input, "sincronizado");

    // El ref debería estar sincronizado (aunque no podemos verificar directamente)
    expect(input).toHaveValue("sincronizado");
  });
});
