import { screen, waitFor } from "@testing-library/react";
import MockAdapter from "axios-mock-adapter";
import { vi } from "vitest";

import { axiosInstance } from "axios-instance";
import { JIMMRelation, JIMMTarget } from "juju/jimm/JIMMV4";
import { endpoints } from "juju/jimm/api";
import { PageNotFoundLabel } from "pages/PageNotFound";
import { thunks as appThunks } from "store/app";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  generalStateFactory,
  configFactory,
  controllerFeaturesStateFactory,
  controllerFeaturesFactory,
  authUserInfoFactory,
} from "testing/factories/general";
import {
  jujuStateFactory,
  rebacAllowedFactory,
  relationshipTupleFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import Permissions from "./Permissions";

const mock = new MockAdapter(axiosInstance);

describe("Permissions", () => {
  let state: RootState;

  beforeEach(() => {
    mock.reset();
    mock.onGet(endpoints().whoami).reply(200, {
      data: {
        "display-name": "jimm-test",
        email: "jimm-test@example.com",
      },
    });
    vi.spyOn(appThunks, "logOut").mockImplementation(
      vi.fn().mockReturnValue({ type: "logOut", catch: vi.fn() }),
    );
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://controller.example.com",
        }),
        controllerFeatures: controllerFeaturesStateFactory.build({
          "wss://controller.example.com": controllerFeaturesFactory.build({
            rebac: true,
          }),
        }),
        controllerConnections: {
          "wss://controller.example.com": {
            user: authUserInfoFactory.build(),
          },
        },
      }),
      juju: jujuStateFactory.build({
        rebac: {
          allowed: [
            rebacAllowedFactory.build({
              tuple: relationshipTupleFactory.build({
                object: "user-eggman@external",
                relation: JIMMRelation.ADMINISTRATOR,
                target_object: JIMMTarget.JIMM_CONTROLLER,
              }),
              allowed: true,
            }),
          ],
        },
      }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("it doesn't display ReBAC Admin if the feature is disabled", () => {
    state.general.controllerFeatures = controllerFeaturesStateFactory.build({
      "wss://controller.example.com": controllerFeaturesFactory.build({
        rebac: false,
      }),
    });
    renderComponent(<Permissions />, { state });
    expect(screen.queryByText("Canonical ReBAC Admin")).not.toBeInTheDocument();
    expect(screen.getByText(PageNotFoundLabel.NOT_FOUND)).toBeInTheDocument();
  });

  it("it doesn't display ReBAC Admin if the user does not have permission", () => {
    state.juju.rebac.allowed = [
      rebacAllowedFactory.build({
        tuple: relationshipTupleFactory.build({
          object: "user-eggman@external",
          relation: JIMMRelation.ADMINISTRATOR,
          target_object: JIMMTarget.JIMM_CONTROLLER,
        }),
        allowed: false,
      }),
    ];
    renderComponent(<Permissions />, { state });
    expect(screen.queryByText("Canonical ReBAC Admin")).not.toBeInTheDocument();
    expect(screen.getByText(PageNotFoundLabel.NOT_FOUND)).toBeInTheDocument();
  });

  it("displays ReBAC Admin", () => {
    renderComponent(<Permissions />, { state });
    expect(screen.getByText("Canonical ReBAC Admin")).toBeInTheDocument();
  });

  it("does not display login for successful responses", async () => {
    mock.onGet("/test").reply(200, {});
    renderComponent(<Permissions />, { state });
    await axiosInstance.get("/test");
    await waitFor(() => {
      expect(appThunks.logOut).not.toHaveBeenCalled();
    });
  });

  it("does not display login for non-authentication errors", async () => {
    mock.onGet("/test").reply(500, {});
    renderComponent(<Permissions />, { state });
    axiosInstance.get("/test").catch(() => {
      // Don't do anything with this 500 error.
    });
    await waitFor(() => {
      expect(appThunks.logOut).not.toHaveBeenCalled();
    });
  });

  it("displays login for authentication errors", async () => {
    mock.onGet("/test").reply(401, {});
    renderComponent(<Permissions />, { state });
    axiosInstance.get("/test").catch(() => {
      // Don't do anything with this 401 error.
    });
    await waitFor(() => {
      expect(appThunks.logOut).toHaveBeenCalledTimes(1);
    });
  });

  it("does not display login on authentication errors from /auth/whoami", async () => {
    mock.onGet(endpoints().whoami).reply(401, {});
    renderComponent(<Permissions />, { state });
    await axiosInstance.get(endpoints().whoami).catch(() => {
      // Don't do anything with this 401 error.
    });
    await waitFor(() => {
      expect(appThunks.logOut).not.toHaveBeenCalled();
    });
  });
});
