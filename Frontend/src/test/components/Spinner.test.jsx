import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Spinner from "../../components/Spinner";

describe("Spinner", () => {
  it("debe renderizar correctamente", () => {
    render(<Spinner />);
    const loader = screen.getByRole("button", { hidden: true });
    expect(loader).toBeInTheDocument();
  });

  it("debe tener la clase cont-spinner", () => {
    render(<Spinner />);
    const spinnerContainer = document.querySelector(".cont-spinner");
    expect(spinnerContainer).toBeInTheDocument();
  });

  it("debe tener un loader dentro", () => {
    render(<Spinner />);
    const loader = document.querySelector(".loader");
    expect(loader).toBeInTheDocument();
  });

  it("debe tener un botón oculto", () => {
    render(<Spinner />);
    const button = document.querySelector(".btn-hiden");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("type", "button");
  });
});
