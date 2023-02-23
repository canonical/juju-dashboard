import { rootStateFactory } from "testing/factories";
import {
  credentialFactory,
  generalStateFactory,
} from "testing/factories/general";
import {
  controllerFactory,
  jujuStateFactory,
} from "testing/factories/juju/juju";

import { addControllerCloudRegion } from "./thunks";
import { actions } from "./slice";
import { controllerLocationFactory } from "../../testing/factories/juju/juju";

// Prevent setting up the bakery instance.
jest.mock("juju/bakery");

const modelInfo = {
  results: [
    {
      error: {
        code: "",
        message: "",
      },
      result: {
        "agent-version": {
          Build: 1,
          Major: 1,
          Minor: 1,
          Patch: 1,
          Tag: "",
        },
        "controller-uuid": "uuid123",
        "cloud-region": "west",
        machines: [],
        "owner-tag": "user-eggman@external",
        users: [],
        uuid: "abc123",
        "cloud-tag": "cloud-aws",
        region: "us-east-1",
        type: "iaas",
        version: "2.9.12",
        "model-uuid": "abc123",
        name: "enterprise",
        life: "alive",
        owner: "kirk@external",
        "is-controller": false,
        constraints: {},
        config: {
          "default-series": "bionic",
        },
        sla: {
          level: "unsupported",
          owner: "",
        },
      },
    },
  ],
};

describe("thunks", () => {
  it("addControllerCloudRegion", async () => {
    const action = addControllerCloudRegion({
      wsControllerURL: "wss://example.com",
      modelInfo,
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
      })
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
      })
    );
  });

  it("addControllerCloudRegion is not called if not authenticated", async () => {
    const action = addControllerCloudRegion({
      wsControllerURL: "wss://example.com",
      modelInfo,
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
      })
    );
    await action(dispatch, getState, null);
    expect(dispatch).not.toHaveBeenCalled();
  });
});
