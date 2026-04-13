import { vi } from "vitest";

import { rootStateFactory } from "testing/factories";
import {
  credentialFactory,
  generalStateFactory,
} from "testing/factories/general";
import {
  modelInfoFactory,
  modelInfoResultFactory,
  modelInfoResultsFactory,
} from "testing/factories/juju/ModelManagerV10";
import {
  controllerFactory,
  jujuStateFactory,
} from "testing/factories/juju/juju";
import { controllerLocationFactory } from "testing/factories/juju/juju";

import { actions } from "./slice";
import { addControllerCloudRegion, addModel } from "./thunks";

// Prevent setting up the bakery instance.
vi.mock("juju/bakery");
vi.mock("@reduxjs/toolkit", async () => {
  const toolkit = await vi.importActual("@reduxjs/toolkit");
  return {
    ...toolkit,
    // Mock configureStore as an import loop is preventing this from
    // behaving correctly in these tests.
    configureStore: vi.fn(),
  };
});

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
    const dispatch = vi.fn();
    const getState = vi.fn(() =>
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
    const dispatch = vi.fn();
    const getState = vi.fn(() =>
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

  it("addModel", async () => {
    const createdModel = modelInfoFactory.build();
    const createModel = vi.fn().mockResolvedValue(createdModel);
    const mockConnection = {
      info: {
        user: {
          identity: "user-eggman@external",
        },
      },
      facades: {
        modelManager: {
          createModel,
        },
      },
    };
    const dispatch = vi.fn((dispatchedAction) => ({
      ...dispatchedAction,
      meta: {
        ...("meta" in dispatchedAction && dispatchedAction.meta
          ? dispatchedAction.meta
          : {}),
        connection: mockConnection,
      },
    }));

    const action = addModel({
      wsControllerURL: "wss://example.com",
      modelName: "model1",
      credential: "credential1",
      cloudTag: "cloud-west",
      region: "aws",
    });

    const getState = vi.fn(() =>
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
    const result = await action(dispatch, getState, null);

    expect(createModel).toHaveBeenCalledWith({
      qualifier: "user-eggman@external",
      "owner-tag": "user-eggman@external",
      name: "model1",
      "cloud-tag": "cloud-west",
      credential: "credential1",
      region: "aws",
    });
    expect(result.type).toBe("juju/addModel/fulfilled");
    expect(result.payload).toEqual(createdModel);
  });

  it("addModel handles missing middleware connection", async () => {
    const action = addModel({
      wsControllerURL: "wss://example.com",
      modelName: "model1",
      credential: "credential1",
      cloudTag: "cloud-west",
      region: "aws",
    });
    const dispatch = vi.fn(async (dispatchedAction) => dispatchedAction);
    const getState = vi.fn(() =>
      rootStateFactory.build({
        general: generalStateFactory.build(),
        juju: jujuStateFactory.build(),
      }),
    );

    const result = await action(dispatch, getState, null);

    expect(result.type).toBe("juju/addModel/rejected");
    expect(dispatch).toHaveBeenCalledWith(
      actions.updateModelsError({
        wsControllerURL: "wss://example.com",
        modelsError: "connection not provided",
      }),
    );
  });

  it("addModel handles missing authentication", async () => {
    const action = addModel({
      wsControllerURL: "wss://example.com",
      modelName: "model1",
      credential: "credential1",
      cloudTag: "cloud-west",
      region: "aws",
    });
    const mockConnection = {
      info: {
        user: {
          identity: undefined,
        },
      },
    };
    const dispatch = vi.fn((dispatchedAction) => ({
      ...dispatchedAction,
      meta: {
        ...("meta" in dispatchedAction && dispatchedAction.meta
          ? dispatchedAction.meta
          : {}),
        connection: mockConnection,
      },
    }));
    const getState = vi.fn(() =>
      rootStateFactory.build({
        general: generalStateFactory.build(),
        juju: jujuStateFactory.build(),
      }),
    );

    const result = await action(dispatch, getState, null);

    expect(result.type).toBe("juju/addModel/rejected");
    expect(dispatch).toHaveBeenCalledWith(
      actions.updateModelsError({
        wsControllerURL: "wss://example.com",
        modelsError: "not authenticated with controller",
      }),
    );
  });
});
