import "@testing-library/jest-dom/vitest";
import type { Window as HappyDOMWindow } from "happy-dom";
import { vi } from "vitest";

vi.mock("react-ga");

declare global {
  interface Window extends HappyDOMWindow {}
  // eslint-disable-next-line no-var
  var jest: object;
}

// Fix for RTL using fake timers:
// https://github.com/testing-library/user-event/issues/1115#issuecomment-1565730917
globalThis.jest = {
  advanceTimersByTime: vi.advanceTimersByTime.bind(vi),
};

// XXX happy-dom does not support the web animations api
const animateMock = () => {
  return { onfinish: vi.fn() } as unknown as Animation;
};

if (!window.HTMLDivElement.prototype.animate) {
  window.HTMLDivElement.prototype.animate = animateMock;
} else {
  console.error(
    "JSDOM appears to support the web animations api",
    "you may now remove the mock",
  );
}
