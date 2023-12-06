import { actions as appActions } from "store/app";
import { actions as generalActions } from "store/general";
import { actions as jujuActions } from "store/juju";
import { rootStateFactory } from "testing/factories";
import {
  credentialFactory,
  generalStateFactory,
  configFactory,
} from "testing/factories/general";
import {
  controllerFactory,
  jujuStateFactory,
} from "testing/factories/juju/juju";

import { logOut, connectAndStartPolling, connectAndListModels } from "./thunks";

describe("thunks", () => {
  it("logOut", async () => {
    const action = logOut();
    const dispatch = jest.fn();
    const getState = jest.fn(() =>
      rootStateFactory.build({
        general: generalStateFactory.build({
          config: configFactory.build({
            identityProviderAvailable: true,
          }),
        }),
      })
    );
    await action(dispatch, getState, null);
    expect(dispatch).toHaveBeenCalledWith(jujuActions.clearModelData());
    expect(dispatch).toHaveBeenCalledWith(jujuActions.clearControllerData());
    expect(dispatch).toHaveBeenCalledWith(generalActions.logOut());
    const dispatchedThunk = await dispatch.mock.calls[4][0](
      dispatch,
      getState,
      null
    );
    expect(dispatchedThunk.type).toBe("app/connectAndStartPolling/fulfilled");
  });

  it("connectAndStartPolling", async () => {
    const action = connectAndStartPolling();
    const dispatch = jest.fn();
    const getState = jest.fn(() => rootStateFactory.build());
    await action(dispatch, getState, null);
    const dispatchedThunk = await dispatch.mock.calls[1][0](
      dispatch,
      getState,
      null
    );
    expect(dispatchedThunk.type).toBe("app/connectAndListModels/fulfilled");
  });

  it("connectAndListModels", async () => {
    const dispatch = jest.fn();
    const getState = jest.fn(() =>
      rootStateFactory.build({
        general: generalStateFactory.build({
          config: configFactory.build({
            isJuju: true,
          }),
          controllerConnections: {
            "wss://example.com": {
              user: {
                "display-name": "eggman",
                identity: "user-eggman@external",
                "controller-access": "",
                "model-access": "",
              },
            },
          },
          credentials: {
            "wss://example.com": credentialFactory.build(),
          },
        }),
        juju: jujuStateFactory.build({
          controllers: {
            "wss://example.com": [
              controllerFactory.build({
                path: "/",
                uuid: "uuid123",
                version: "1",
              }),
            ],
          },
        }),
      })
    );
    const action = connectAndListModels();
    await action(dispatch, getState, null);
    expect(dispatch).toHaveBeenCalledWith(
      appActions.connectAndPollControllers({
        controllers: [["wss://controller.example.com", undefined, false]],
        isJuju: true,
      })
    );
  });
});
