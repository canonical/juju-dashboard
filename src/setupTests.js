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
  console.error(
    "JSDOM appears to support the web animations api",
    "you may now remove the mock"
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
