import { rootStateFactory } from "testing/factories";
import {
  credentialFactory,
  generalStateFactory,
} from "testing/factories/general";

import { addControllerCloudRegion } from "./thunks";
import { actions } from "./slice";

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
        juju: {
          controllers: {
            "wss://example.com": [
              {
                path: "/",
                uuid: "uuid123",
                version: "1",
              },
            ],
          },
        },
      })
    );
    await action(dispatch, getState, null);
    expect(dispatch).toHaveBeenCalledWith(
      actions.updateControllerList({
        controllers: [
          {
            path: "/",
            uuid: "uuid123",
            version: "1",
            location: {
              cloud: "west",
              region: "aws",
            },
          },
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
        juju: {
          controllers: {
            "wss://example.com": [
              {
                path: "/",
                uuid: "uuid123",
                version: "1",
              },
            ],
          },
        },
      })
    );
    await action(dispatch, getState, null);
    expect(dispatch).not.toHaveBeenCalled();
  });
});
