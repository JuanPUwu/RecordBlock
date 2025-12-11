import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import SepHrz from "../../components/SepHrz";

describe("SepHrz", () => {
  it("debe renderizar correctamente", () => {
    const { container } = render(<SepHrz />);
    const separator = container.querySelector(".sep-hrz");
    expect(separator).toBeInTheDocument();
  });

  it("debe tener la clase CSS correcta", () => {
    const { container } = render(<SepHrz />);
    const separator = container.querySelector(".sep-hrz");
    expect(separator).toHaveClass("sep-hrz");
  });

  it("debe ser un elemento div", () => {
    const { container } = render(<SepHrz />);
    const separator = container.querySelector(".sep-hrz");
    expect(separator?.tagName).toBe("DIV");
  });
});
