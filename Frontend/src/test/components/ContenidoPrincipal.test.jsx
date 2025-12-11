import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContenidoPrincipal from "../../components/ContenidoPrincipal";

describe("ContenidoPrincipal", () => {
  const defaultProps = {
    isInfoCargando: false,
    whichInfo: [],
    terminosBusqueda: { dato: "", detalle: "" },
    onEditarInfo: vi.fn(),
    onEliminarInfo: vi.fn(),
  };

  it("debe mostrar loader cuando isInfoCargando es true", () => {
    const { container } = render(
      <ContenidoPrincipal {...defaultProps} isInfoCargando={true} />
    );

    const loader = container.querySelector(".loader.section");
    expect(loader).toBeInTheDocument();
  });

  it("debe mostrar mensaje cuando no hay resultados", () => {
    render(<ContenidoPrincipal {...defaultProps} whichInfo={[]} />);

    expect(
      screen.getByText("No se encontraron resultados")
    ).toBeInTheDocument();
  });

  it("debe renderizar información cuando hay datos", () => {
    const whichInfo = [
      {
        info_id: 1,
        usuario_nombre: "Juan",
        datos: [{ nombre: "Test", valor: "123" }],
      },
    ];

    render(<ContenidoPrincipal {...defaultProps} whichInfo={whichInfo} />);

    expect(screen.getByText(/Registro °1/)).toBeInTheDocument();
  });

  it("debe mostrar usuario_nombre cuando está disponible", () => {
    const whichInfo = [
      {
        info_id: 1,
        usuario_nombre: "Juan Pérez",
        datos: [{ nombre: "Test", valor: "123" }],
      },
    ];

    render(<ContenidoPrincipal {...defaultProps} whichInfo={whichInfo} />);

    expect(screen.getByText(/Registro °1 - Juan Pérez/)).toBeInTheDocument();
  });

  it("debe llamar onEditarInfo cuando se hace click en editar", async () => {
    const user = userEvent.setup();
    const onEditarInfo = vi.fn();
    const whichInfo = [
      {
        info_id: 1,
        datos: [{ nombre: "Test", valor: "123" }],
      },
    ];

    render(
      <ContenidoPrincipal
        {...defaultProps}
        whichInfo={whichInfo}
        onEditarInfo={onEditarInfo}
      />
    );

    const buttons = screen.getAllByRole("button");
    const editButton = buttons[0];
    await user.click(editButton);

    expect(onEditarInfo).toHaveBeenCalledWith(whichInfo[0]);
  });

  it("debe llamar onEliminarInfo cuando se hace click en eliminar", async () => {
    const user = userEvent.setup();
    const onEliminarInfo = vi.fn();
    const whichInfo = [
      {
        info_id: 1,
        datos: [{ nombre: "Test", valor: "123" }],
      },
    ];

    render(
      <ContenidoPrincipal
        {...defaultProps}
        whichInfo={whichInfo}
        onEliminarInfo={onEliminarInfo}
      />
    );

    const buttons = screen.getAllByRole("button");
    const deleteButton = buttons.at(-1);
    await user.click(deleteButton);

    expect(onEliminarInfo).toHaveBeenCalledWith(whichInfo[0]);
  });

  it("debe renderizar múltiples registros en columnas", () => {
    const whichInfo = [
      {
        info_id: 1,
        datos: [{ nombre: "Test1", valor: "123" }],
      },
      {
        info_id: 2,
        datos: [{ nombre: "Test2", valor: "456" }],
      },
    ];

    render(<ContenidoPrincipal {...defaultProps} whichInfo={whichInfo} />);

    expect(screen.getByText(/Registro °1/)).toBeInTheDocument();
    expect(screen.getByText(/Registro °2/)).toBeInTheDocument();
  });

  it("debe dividir datos en dos columnas", () => {
    const whichInfo = [
      {
        info_id: 1,
        datos: [
          {
            campo1: "valor1",
            campo2: "valor2",
            campo3: "valor3",
            campo4: "valor4",
          },
        ],
      },
    ];

    const { container } = render(
      <ContenidoPrincipal {...defaultProps} whichInfo={whichInfo} />
    );

    const columnas = container.querySelectorAll(".columna");
    expect(columnas.length).toBeGreaterThan(0);
  });
});
