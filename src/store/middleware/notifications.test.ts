import { NotificationSeverity } from "@canonical/react-components";
import toast from "react-hot-toast";
import type { UnknownAction, MiddlewareAPI, Dispatch } from "redux";
import type { Mock } from "vitest";
import { vi } from "vitest";

import { createToast } from "store/app/actions";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";

import notificationsMiddleware from "./notifications";
import type { MockMiddlewareResult } from "./types";

vi.mock("react-hot-toast", () => {
  return {
    default: vi.fn(),
  };
});

describe("notifications middleware", () => {
  let fakeStore: MiddlewareAPI<Dispatch<UnknownAction>, RootState>;
  let next: Mock;

  beforeEach(() => {
    next = vi.fn();
    fakeStore = {
      getState: vi.fn(() => rootStateFactory.build()),
      dispatch: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const runMiddleware = async (action: UnknownAction): MockMiddlewareResult => {
    const middleware = notificationsMiddleware(fakeStore);
    await middleware(next)(action);
    return middleware;
  };

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("ignores non-actions", async () => {
    const action = false as unknown as UnknownAction;
    await runMiddleware(action);
    expect(next).toHaveBeenCalledWith(action);
  });

  it("handles unknown actions", async () => {
    const action = { type: "unrelated-action", payload: {} };
    await runMiddleware(action);
    expect(next).toHaveBeenCalledWith(action);
  });

  it("handles toast actions", async () => {
    await runMiddleware(
      createToast({ message: "Boo!", severity: NotificationSeverity.CAUTION }),
    );
    // The action should not be passed on to other middleware.
    expect(next).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith("Boo!", {
      type: NotificationSeverity.CAUTION,
    });
  });
});
