import type { Mock } from "vitest";

import * as jimmListeners from "juju/jimm/listeners";
import * as jimmThunks from "juju/jimm/thunks";
import { actions as generalActions } from "store/general";

import { Auth } from "./Auth";
import { OIDCAuth } from "./OIDCAuth";

describe("OIDCAuth", () => {
  let dispatch: Mock;

  beforeEach(() => {
    dispatch = vi.fn();
    new OIDCAuth(dispatch);
  });

  afterEach(() => {
    // @ts-expect-error - Resetting singleton for each test run.
    delete Auth.instance;
  });

  it("bootstrap", async () => {
    // Since `OIDCAuth` is created with a mixin, fetch the anonymous class's prototype to spy on.
    const pollingAuthBootstrapMock = vi.spyOn(
      Object.getPrototypeOf(OIDCAuth).prototype,
      "bootstrap",
    );
    const addWhoamiListenerMock = vi.spyOn(jimmListeners, "addWhoamiListener");
    await Auth.instance.bootstrap();
    expect(addWhoamiListenerMock).toHaveBeenCalledOnce();
    expect(pollingAuthBootstrapMock).toHaveBeenCalledOnce();
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
