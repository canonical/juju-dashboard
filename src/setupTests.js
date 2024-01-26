import "@testing-library/jest-dom";
import crypto from "crypto";
import util from "util";

jest.mock("react-ga");

// XXX jsdom does not support the web animations api
const animateMock = () => {
  return { onfinish: jest.fn() };
};

if (!window.HTMLDivElement.prototype.animate) {
  window.HTMLDivElement.prototype.animate = animateMock;
} else {
  // Error is related to tests. Not shown in UI. Logged for debugging purposses.
  console.error(
    "JSDOM appears to support the web animations api",
    "you may now remove the mock",
  );
}

class ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

// Provide node modules that are required by bakeryjs.
global.TextDecoder = util.TextDecoder;
global.TextEncoder = util.TextEncoder;
global.crypto = crypto;
global.ResizeObserver = ResizeObserver;
// From: https://jestjs.io/docs/26.x/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
global.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(), // deprecated
  removeListener: jest.fn(), // deprecated
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});
