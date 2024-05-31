import "./mock-shopify-app-remix";
import "@testing-library/jest-dom";

import { vi } from "vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

//scrollTo isn't implemented in JSDOM
window.HTMLElement.prototype.scrollBy = vi.fn(() => {});

vi.stubGlobal("scrollBy", vi.fn());
