import type { Mock, MockInstance } from "vitest";

import * as jujuApi from "juju/api";
import type { ConnectionWithFacades } from "juju/types";
import { thunks as appThunks } from "store/app";

import { Auth } from "./Auth";
import { CandidAuth } from "./CandidAuth";

describe("CandidAuth", () => {
  let dispatch: Mock;

  beforeEach(() => {
    dispatch = vi.fn();
    new CandidAuth(dispatch);
  });

  afterEach(() => {
    // @ts-expect-error - Resetting singleton for each test run.
    delete Auth.instance;
  });

  describe("logout", () => {
    let connectAndStartPollingMock: MockInstance;

    beforeEach(() => {
      connectAndStartPollingMock = vi.spyOn(
        appThunks,
        "connectAndStartPolling",
      );
    });

    it("polling success", async () => {
      dispatch.mockResolvedValue({ payload: {} });
      await Auth.instance.logout();
      expect(dispatch).toHaveBeenCalledOnce();
      expect(connectAndStartPollingMock).toHaveBeenCalledOnce();
    });

    it("polling error", async () => {
      dispatch.mockResolvedValue({
        payload: null,
        error: new Error("some error"),
      });
      await Auth.instance.logout();
      expect(dispatch).toHaveBeenCalledOnce();
      expect(connectAndStartPollingMock).toHaveBeenCalledOnce();
    });
  });

  describe("afterControllerListFetched", () => {
    let jujuDisableControllerUUIDMaskingMock: MockInstance;

    beforeEach(() => {
      jujuDisableControllerUUIDMaskingMock = vi.spyOn(
        jujuApi,
        "disableControllerUUIDMasking",
      );
    });

    it("mask disable success", async () => {
      jujuDisableControllerUUIDMaskingMock.mockReturnValue(Promise.resolve());
      await Auth.instance.afterControllerListFetched(
        {} as ConnectionWithFacades,
      );
      expect(jujuDisableControllerUUIDMaskingMock).toHaveBeenCalledOnce();
    });

    it("mask disable error", async () => {
      jujuDisableControllerUUIDMaskingMock.mockRejectedValue(
        new Error("some error"),
      );
      await Auth.instance.afterControllerListFetched(
        {} as ConnectionWithFacades,
      );
      expect(jujuDisableControllerUUIDMaskingMock).toHaveBeenCalledOnce();
    });
  });
});
