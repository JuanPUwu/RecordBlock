import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Limpia después de cada test
afterEach(() => {
  cleanup();
});

