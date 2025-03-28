import type { Mock, MockInstance } from "vitest";

import { thunks as appThunks } from "store/app";
import { AuthMethod } from "store/general/types";

import { Auth } from "../Auth";

import { pollingMixin } from "./polling";

describe("PollingAuth", () => {
  let dispatch: Mock;
  let connectAndStartPollingMock: MockInstance;

  beforeEach(() => {
    dispatch = vi.fn();
    const AuthClass = pollingMixin(Auth);
    new AuthClass(dispatch, AuthMethod.OIDC);
    connectAndStartPollingMock = vi.spyOn(appThunks, "connectAndStartPolling");
  });

  afterEach(() => {
    // @ts-expect-error - Resetting singleton for each test run.
    delete Auth.instance;
  });

  it("polling bootstrap success", async () => {
    dispatch.mockResolvedValue({ payload: {} });
    await Auth.instance.bootstrap();
    expect(dispatch).toHaveBeenCalledOnce();
    expect(connectAndStartPollingMock).toHaveBeenCalledOnce();
  });

  it("polling bootstrap failure", async () => {
    dispatch.mockResolvedValue({
      payload: null,
      error: new Error("some error"),
    });
    await Auth.instance.bootstrap();
    expect(dispatch).toHaveBeenCalledOnce();
    expect(connectAndStartPollingMock).toHaveBeenCalledOnce();
  });
});
