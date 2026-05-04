import jimmSupportedVersions from "store/middleware/source/jimm-supported-versions";
import migrationTargets from "store/middleware/source/migration-targets";
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

  it("does not poll for data when using Juju", () => {
    if (state.general.config) {
      state.general.config.isJuju = true;
    } else {
      assert.fail("Config not defined");
    }
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
    expect(
      actions.find((dispatch) =>
        jimmSupportedVersions.actions.start.match(dispatch),
      ),
    ).toBeUndefined();
    expect(
      actions.find((dispatch) =>
        migrationTargets.actions.start.match(dispatch),
      ),
    ).toBeUndefined();
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
    const supportedVersionsStart = jimmSupportedVersions.actions.start({
      wsControllerURL: "wss://example.com/api",
    });
    expect(
      actions.find((dispatch) =>
        jimmSupportedVersions.actions.start.match(dispatch),
      ),
    ).toMatchObject(supportedVersionsStart);
    const modelMigrationTargetsStart = migrationTargets.actions.start({
      modelUUID: "abc123",
      wsControllerURL: "wss://example.com/api",
    });
    expect(
      actions.find((dispatch) =>
        migrationTargets.actions.start.match(dispatch),
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
    const supportedVersionsStop = jimmSupportedVersions.actions.stop({
      wsControllerURL: "wss://example.com/api",
    });
    expect(
      actions.find((dispatch) =>
        jimmSupportedVersions.actions.stop.match(dispatch),
      ),
    ).toMatchObject(supportedVersionsStop);
    const modelMigrationTargetsStop = migrationTargets.actions.stop({
      modelUUID: "abc123",
      wsControllerURL: "wss://example.com/api",
    });
    expect(
      actions.find((dispatch) => migrationTargets.actions.stop.match(dispatch)),
    ).toMatchObject(modelMigrationTargetsStop);
  });
});
