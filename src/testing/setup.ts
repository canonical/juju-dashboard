import "@testing-library/jest-dom/vitest";
import type { Connection } from "@canonical/jujulib";
import type { DetachedWindowAPI } from "happy-dom";
import { vi } from "vitest";
import createFetchMock from "vitest-fetch-mock";

import { logger } from "utils/logger";

import { listSecretResultFactory } from "./factories/juju/juju";

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

const connectResponse = {
  conn: {
    facades: {
      secrets: {
        listSecrets: vi.fn().mockImplementation(async () => ({
          results: [listSecretResultFactory.build()],
        })),
      },
    },
  } as unknown as Connection,
  logout: vi.fn(),
};

vi.mock("@canonical/jujulib", () => ({
  connect: vi.fn().mockResolvedValue(connectResponse),
  connectAndLogin: vi.fn().mockReturnValue(connectResponse),
  fetchModelStatus: vi.fn(),
}));

vi.mock("@canonical/jujulib/dist/api/versions", () => ({
  jujuUpdateAvailable: vi.fn(),
}));
