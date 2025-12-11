import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Nav from "../../components/Nav";

describe("Nav", () => {
  it("debe renderizar correctamente con children", () => {
    render(
      <Nav>
        <div>Test content</div>
      </Nav>
    );
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("debe renderizar múltiples children", () => {
    render(
      <Nav>
        <button>Button 1</button>
        <button>Button 2</button>
      </Nav>
    );
    expect(screen.getByText("Button 1")).toBeInTheDocument();
    expect(screen.getByText("Button 2")).toBeInTheDocument();
  });

  it("debe tener el elemento nav", () => {
    const { container } = render(
      <Nav>
        <div>Content</div>
      </Nav>
    );
    const nav = container.querySelector("nav");
    expect(nav).toBeInTheDocument();
  });

  it("debe renderizar sin children (aunque PropTypes lo requiere)", () => {
    const { container } = render(<Nav>{null}</Nav>);
    const nav = container.querySelector("nav");
    expect(nav).toBeInTheDocument();
  });
});
