import { rootStateFactory } from "testing/factories";
import {
  credentialFactory,
  generalStateFactory,
} from "testing/factories/general";
import {
  modelInfoFactory,
  modelInfoResultFactory,
  modelInfoResultsFactory,
} from "testing/factories/juju/ModelManagerV9";
import {
  controllerFactory,
  jujuStateFactory,
} from "testing/factories/juju/juju";
import { controllerLocationFactory } from "testing/factories/juju/juju";

import { actions } from "./slice";
import { addControllerCloudRegion } from "./thunks";

// Prevent setting up the bakery instance.
jest.mock("juju/bakery");

describe("thunks", () => {
  it("addControllerCloudRegion", async () => {
    const action = addControllerCloudRegion({
      wsControllerURL: "wss://example.com",
      modelInfo: modelInfoResultsFactory.build({
        results: [
          modelInfoResultFactory.build({
            result: modelInfoFactory.build({
              "cloud-region": "west",
              "controller-uuid": "uuid123",
            }),
          }),
        ],
      }),
    });
    const dispatch = jest.fn();
    const getState = jest.fn(() =>
      rootStateFactory.build({
        general: generalStateFactory.build({
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
                uuid: "uuid123",
              }),
            ],
          },
        }),
      }),
    );
    await action(dispatch, getState, null);
    expect(dispatch).toHaveBeenCalledWith(
      actions.updateControllerList({
        controllers: [
          controllerFactory.build({
            uuid: "uuid123",
            location: controllerLocationFactory.build({
              cloud: "west",
              region: "aws",
            }),
          }),
        ],
        wsControllerURL: "wss://example.com",
      }),
    );
  });

  it("addControllerCloudRegion is not called if not authenticated", async () => {
    const action = addControllerCloudRegion({
      wsControllerURL: "wss://example.com",
      modelInfo: modelInfoResultsFactory.build(),
    });
    const dispatch = jest.fn();
    const getState = jest.fn(() =>
      rootStateFactory.build({
        general: {},
        juju: jujuStateFactory.build({
          controllers: {
            "wss://example.com": [controllerFactory.build()],
          },
        }),
      }),
    );
    await action(dispatch, getState, null);
    expect(dispatch).not.toHaveBeenCalled();
  });
});
