import "@testing-library/jest-dom/vitest";
import type { DetachedWindowAPI } from "happy-dom";
import { vi } from "vitest";
import createFetchMock from "vitest-fetch-mock";

import { logger } from "utils/logger";

import { listSecretResultFactory } from "./factories/juju/SecretsV2";

vi.mock("react-ga4");

const fetchMocker = createFetchMock(vi);
// sets globalThis.fetch and globalThis.fetchMock to our mocked version
fetchMocker.enableMocks();

declare global {
  interface Window {
    happyDOM: DetachedWindowAPI;
  }
  var jest: object;
}

logger.setDefaultLevel(logger.levels.SILENT);

// Fix for RTL using fake timers:
// https://github.com/testing-library/user-event/issues/1115#issuecomment-1565730917
globalThis.jest = {
  advanceTimersByTime: vi.advanceTimersByTime.bind(vi),
};

// XXX happy-dom does not support the web animations api
const animateMock = (): Animation => {
  return { onfinish: vi.fn() } as unknown as Animation;
};

if (
  // No one told TypeScript that the animate function doesn't exist for happy-dom so it needs a type annotation.
  !(window.HTMLDivElement.prototype.animate as
    | Animatable["animate"]
    | undefined)
) {
  window.HTMLDivElement.prototype.animate = animateMock;
} else {
  console.error(
    "JSDOM appears to support the web animations api",
    "you may now remove the mock",
  );
}

/**
 * Mock the class to preserve a prototype.
 * @see {@link https://v3.vitest.dev/guide/mocking.html#classes}
 */
const Connection = vi.fn(function () {
  // @ts-expect-error - Mocking a class.
  this.facades = {
    secrets: {
      listSecrets: vi.fn().mockImplementation(() => ({
        results: [listSecretResultFactory.build()],
      })),
    },
  };
  // @ts-expect-error - Mocking a class.
  this.transport = {
    _ws: {
      readyState: 0,
    },
  };
});

vi.mock("@canonical/jujulib", () => {
  return {
    connect: vi.fn().mockResolvedValue({
      conn: new Connection(),
      logout: vi.fn(),
    }),
    connectAndLogin: vi.fn().mockResolvedValue({
      conn: new Connection(),
      logout: vi.fn(),
    }),
    fetchModelStatus: vi.fn(),
    Connection,
  };
});

vi.mock("@canonical/jujulib/dist/api/versions", () => ({
  jujuUpdateAvailable: vi.fn(),
}));

// Mock WebSocket associated constants, required for `connection-manager`.
window.WebSocket = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
} as unknown as (typeof window)["WebSocket"];

afterEach(() => {
  localStorage.clear();
});
