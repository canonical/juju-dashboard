import type { Mock, MockInstance } from "vitest";

import * as jimmListeners from "juju/jimm/listeners";
import * as jimmThunks from "juju/jimm/thunks";
import { thunks as appThunks } from "store/app";
import { actions as generalActions } from "store/general";

import { Auth } from "./Auth";
import { OIDCAuth } from "./OIDCAuth";

describe("OIDCAuth", () => {
  let dispatch: Mock;

  beforeEach(() => {
    // @ts-expect-error - Resetting singleton for each test run.
    delete Auth.instance;

    dispatch = vi.fn();
    new OIDCAuth(dispatch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("boostrap", () => {
    let addWhoamiListenerMock: MockInstance;
    let connectAndStartPollingMock: MockInstance;

    beforeEach(() => {
      addWhoamiListenerMock = vi.spyOn(jimmListeners, "addWhoamiListener");
      connectAndStartPollingMock = vi.spyOn(
        appThunks,
        "connectAndStartPolling",
      );
    });

    it("connection success", async () => {
      dispatch.mockResolvedValue({ payload: {} });

      await Auth.instance.bootstrap();

      expect(addWhoamiListenerMock).toHaveBeenCalledOnce();
      expect(dispatch).toHaveBeenCalledOnce();
      expect(connectAndStartPollingMock).toHaveBeenCalledOnce();
    });

    it("connection failure", async () => {
      dispatch.mockResolvedValue({
        payload: null,
        error: new Error("some error"),
      });

      await Auth.instance.bootstrap();

      expect(addWhoamiListenerMock).toHaveBeenCalledOnce();
      expect(dispatch).toHaveBeenCalledOnce();
      expect(connectAndStartPollingMock).toHaveBeenCalledOnce();
    });
  });

  it("logout", async () => {
    const logoutMock = vi.spyOn(jimmThunks, "logout");

    await Auth.instance.logout();

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).nthCalledWith(1, jimmListeners.pollWhoamiStop());
    expect(logoutMock).toHaveBeenCalledOnce();
  });

  describe("beforeControllerConnect", () => {
    it("with user", async () => {
      const whoamiThunkMock = vi.spyOn(jimmThunks, "whoami");
      const pollWhoamiStartMock = vi.spyOn(jimmListeners, "pollWhoamiStart");
      const storeLoginErrorMock = vi.spyOn(generalActions, "storeLoginError");
      dispatch
        // Loading start
        .mockResolvedValueOnce({})
        // whoami
        .mockResolvedValueOnce({ payload: {} });

      const connectionContinue = await Auth.instance.beforeControllerConnect({
        wsControllerURL: "wss://1.2.3.4/api",
      });

      expect(dispatch).toBeCalledTimes(3);
      expect(whoamiThunkMock).toHaveBeenCalledOnce();
      expect(pollWhoamiStartMock).toHaveBeenCalledOnce();
      expect(connectionContinue).to.equal(true);
      expect(storeLoginErrorMock).not.toHaveBeenCalledOnce();
    });

    it("without user", async () => {
      const whoamiThunkMock = vi.spyOn(jimmThunks, "whoami");
      const pollWhoamiStartMock = vi.spyOn(jimmListeners, "pollWhoamiStart");
      const storeLoginErrorMock = vi.spyOn(generalActions, "storeLoginError");
      dispatch
        // Loading start
        .mockResolvedValueOnce({})
        // whoami
        .mockResolvedValueOnce({ payload: null });

      const connectionContinue = await Auth.instance.beforeControllerConnect({
        wsControllerURL: "wss://1.2.3.4/api",
      });

      expect(dispatch).toBeCalledTimes(3);
      expect(whoamiThunkMock).toHaveBeenCalledOnce();
      expect(pollWhoamiStartMock).not.toHaveBeenCalled();
      expect(connectionContinue).to.equal(false);
      expect(storeLoginErrorMock).not.toHaveBeenCalledOnce();
    });

    it("with user error", async () => {
      const whoamiThunkMock = vi.spyOn(jimmThunks, "whoami");
      const pollWhoamiStartMock = vi.spyOn(jimmListeners, "pollWhoamiStart");
      const storeLoginErrorMock = vi.spyOn(generalActions, "storeLoginError");
      dispatch
        // Loading start
        .mockResolvedValueOnce({})
        // whoami
        .mockResolvedValueOnce({
          payload: undefined,
          error: new Error("some error"),
        });

      const connectionContinue = await Auth.instance.beforeControllerConnect({
        wsControllerURL: "wss://1.2.3.4/api",
      });

      expect(dispatch).toBeCalledTimes(3);
      expect(whoamiThunkMock).toHaveBeenCalledOnce();
      expect(pollWhoamiStartMock).not.toHaveBeenCalled();
      expect(connectionContinue).to.equal(false);
      expect(storeLoginErrorMock).toHaveBeenCalledOnce();
    });
  });

  it("jujulibConnectOptions", () => {
    expect(Auth.instance.jujulibConnectOptions()).to.deep.equal({
      oidcEnabled: true,
    });
  });
});
