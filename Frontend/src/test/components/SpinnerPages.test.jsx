import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SpinnerPages from "../../components/SpinnerPages";

describe("SpinnerPages", () => {
  it("debe renderizar correctamente", () => {
    render(<SpinnerPages />);
    const loader = screen.getByRole("button", { hidden: true });
    expect(loader).toBeInTheDocument();
  });

  it("debe tener la clase cont-spinner", () => {
    render(<SpinnerPages />);
    const spinnerContainer = document.querySelector(".cont-spinner");
    expect(spinnerContainer).toBeInTheDocument();
  });

  it("debe tener un loader dentro", () => {
    render(<SpinnerPages />);
    const loader = document.querySelector(".loader");
    expect(loader).toBeInTheDocument();
  });

  it("debe tener un botón oculto", () => {
    render(<SpinnerPages />);
    const button = document.querySelector(".btn-hiden");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("type", "button");
  });
});
