import type { RootState } from "store/store";
import { generalStateFactory, configFactory } from "testing/factories/general";
import {
  jujuStateFactory,
  modelListInfoFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { createStore, renderWrappedHook } from "testing/utils";

import useModelMigrationData from "./useModelMigrationData";

describe("useModelMigrationData", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com/api",
        }),
      }),
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            name: "test1",
          }),
        },
      }),
    });
  });

  it("starts polling for data when the hook is mounted", () => {
    const [store, actions] = createStore(state, {
      trackActions: true,
    });
    renderWrappedHook(
      () => {
        useModelMigrationData("test1", "eggman@external");
      },
      {
        store,
      },
    );
    const supportedVersionsStart = {
      type: "source/jimm-supported-versions/start",
      payload: { wsControllerURL: "wss://example.com/api" },
      meta: { withConnection: true },
    };
    expect(
      actions.find((dispatch) => dispatch.type === supportedVersionsStart.type),
    ).toMatchObject(supportedVersionsStart);
    const modelMigrationTargetsStart = {
      type: "source/migration-targets/start",
      payload: {
        modelUUID: "abc123",
        wsControllerURL: "wss://example.com/api",
      },
      meta: { withConnection: true },
    };
    expect(
      actions.find(
        (dispatch) => dispatch.type === modelMigrationTargetsStart.type,
      ),
    ).toMatchObject(modelMigrationTargetsStart);
  });

  it("stops polling for data when the hook is mounted", () => {
    const [store, actions] = createStore(state, {
      trackActions: true,
    });
    const { unmount } = renderWrappedHook(
      () => {
        useModelMigrationData("test1", "eggman@external");
      },
      {
        store,
      },
    );
    unmount();
    const supportedVersionsStop = {
      type: "source/jimm-supported-versions/stop",
      payload: { wsControllerURL: "wss://example.com/api" },
    };
    expect(
      actions.find((dispatch) => dispatch.type === supportedVersionsStop.type),
    ).toMatchObject(supportedVersionsStop);
    const modelMigrationTargetsStop = {
      type: "source/migration-targets/stop",
      payload: {
        modelUUID: "abc123",
        wsControllerURL: "wss://example.com/api",
      },
    };
    expect(
      actions.find(
        (dispatch) => dispatch.type === modelMigrationTargetsStop.type,
      ),
    ).toMatchObject(modelMigrationTargetsStop);
  });
});
