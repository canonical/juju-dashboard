import type { ListenerMiddlewareInstance } from "@reduxjs/toolkit";
import { createListenerMiddleware } from "@reduxjs/toolkit";
import { waitFor } from "@testing-library/react";

import { createToast } from "store/app/actions";
import { removeCredential } from "store/middleware/process";
import userCredentialsMiddleware from "store/middleware/source/user-credentials";
import type { AppDispatch, RootState } from "store/store";
import { configFactory, generalStateFactory } from "testing/factories/general";
import {
  jujuStateFactory,
  modelListInfoFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { createStore } from "testing/utils";

import {
  addRemoveCredentialWithModelsListener,
  DESTROY_TIME_LIMIT,
} from "./listeners";
import { actions as jujuActions } from "./slice";

describe("addRemoveCredentialWithModelsListener", () => {
  const WS_CONTROLLER_URL = "wss://example.com/api";
  const TAG = "cloudcred-aws_admin_default";
  const OTHER_TAG = "cloudcred-aws_admin_other";
  let listenerMiddleware: ListenerMiddlewareInstance<
    RootState,
    AppDispatch,
    unknown
  >;
  let state: RootState;

  const start = (
    credentialTag: string,
    modelUUID: string,
  ): ReturnType<typeof jujuActions.removeCredentialWithModelsStart> =>
    jujuActions.removeCredentialWithModelsStart({
      credentialTag,
      credentialName: "default",
      cloudTags: ["cloud-aws"],
      models: [{ modelUUID, modelName: modelUUID }],
      wsControllerURL: WS_CONTROLLER_URL,
    });

  const countActions = (actions: { type: string }[], type: string): number =>
    actions.filter((action) => action.type === type).length;

  beforeEach(() => {
    listenerMiddleware = createListenerMiddleware<RootState, AppDispatch>();
    addRemoveCredentialWithModelsListener(listenerMiddleware.startListening);
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: WS_CONTROLLER_URL,
        }),
      }),
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({ uuid: "abc123" }),
          def456: modelListInfoFactory.build({ uuid: "def456" }),
        },
      }),
    });
  });

  afterEach(() => {
    listenerMiddleware.clearListeners();
    vi.useRealTimers();
  });

  it("removes the credential once its models have gone", async () => {
    const [store, actions] = createStore(state, {
      trackActions: true,
      middleware: [listenerMiddleware.middleware],
    });
    store.dispatch(start(TAG, "abc123"));
    store.dispatch(
      jujuActions.updateModelList({
        models: { "user-models": [] },
        wsControllerURL: WS_CONTROLLER_URL,
      }),
    );
    await waitFor(() => {
      expect(countActions(actions, removeCredential.run.type)).toBe(1);
    });
    expect(store.getState().juju.removeCredentialWithModels[TAG].status).toBe(
      "removing",
    );
    store.dispatch(
      jujuActions.setRemoveCredentialOutcome({
        credentialTag: TAG,
        outcome: { result: undefined },
        wsControllerURL: WS_CONTROLLER_URL,
      }),
    );
    await waitFor(() => {
      expect(
        actions.find((action) => action.type === createToast.type),
      ).toMatchObject(
        createToast({
          message: "Credential default removed",
          severity: "positive",
        }),
      );
    });
    expect(
      actions.find(
        (action) =>
          action.type === userCredentialsMiddleware.actions.invalidate.type,
      ),
    ).toMatchObject(
      userCredentialsMiddleware.actions.invalidate({
        wsControllerURL: WS_CONTROLLER_URL,
        cloudTags: ["cloud-aws"],
      }),
    );
    expect(
      store.getState().juju.removeCredentialWithModels[TAG],
    ).toBeUndefined();
  });

  it("keeps the models that failed to destroy after the toaster clears them", async () => {
    const [store, actions] = createStore(state, {
      trackActions: true,
      middleware: [listenerMiddleware.middleware],
    });
    store.dispatch(start(TAG, "abc123"));
    store.dispatch(
      jujuActions.destroyModelErrors({ errors: [["abc123", "boom"]] }),
    );
    store.dispatch(
      jujuActions.clearDestroyedModels({
        modelUUIDs: ["abc123"],
        wsControllerURL: WS_CONTROLLER_URL,
      }),
    );
    await waitFor(() => {
      expect(
        store.getState().juju.removeCredentialWithModels[TAG],
      ).toMatchObject({ status: "failed", failedModels: { abc123: "boom" } });
    });
    expect(countActions(actions, removeCredential.run.type)).toBe(0);
  });

  it("stops waiting when the time limit is reached", async () => {
    vi.useFakeTimers();
    const store = createStore(state, {
      trackActions: false,
      middleware: [listenerMiddleware.middleware],
    });
    store.dispatch(start(TAG, "abc123"));
    await vi.advanceTimersByTimeAsync(DESTROY_TIME_LIMIT);
    expect(store.getState().juju.removeCredentialWithModels[TAG].status).toBe(
      "timedOut",
    );
  });

  it("stops when the model data is cleared", async () => {
    const [store, actions] = createStore(state, {
      trackActions: true,
      middleware: [listenerMiddleware.middleware],
    });
    // Cleared while waiting for the models to be destroyed.
    store.dispatch(start(TAG, "abc123"));
    store.dispatch(jujuActions.clearModelData());
    await new Promise((resolve) => setTimeout(resolve));
    expect(countActions(actions, removeCredential.run.type)).toBe(0);
    // Cleared while waiting for the removal, which starts at once as the
    // cleared model list no longer has the model.
    store.dispatch(start(TAG, "abc123"));
    await waitFor(() => {
      expect(countActions(actions, removeCredential.run.type)).toBe(1);
    });
    store.dispatch(jujuActions.clearModelData());
    store.dispatch(
      jujuActions.setRemoveCredentialOutcome({
        credentialTag: TAG,
        outcome: { result: undefined },
        wsControllerURL: WS_CONTROLLER_URL,
      }),
    );
    await new Promise((resolve) => setTimeout(resolve));
    expect(countActions(actions, createToast.type)).toBe(0);
  });

  it("handles each credential separately and ends a run when it is retried", async () => {
    const [store, actions] = createStore(state, {
      trackActions: true,
      middleware: [listenerMiddleware.middleware],
    });
    store.dispatch(start(TAG, "abc123"));
    store.dispatch(start(OTHER_TAG, "def456"));
    store.dispatch(start(TAG, "abc123"));
    store.dispatch(
      jujuActions.destroyModelErrors({ errors: [["def456", "boom"]] }),
    );
    await waitFor(() => {
      expect(
        store.getState().juju.removeCredentialWithModels[OTHER_TAG].status,
      ).toBe("failed");
    });
    expect(store.getState().juju.removeCredentialWithModels[TAG].status).toBe(
      "destroying",
    );
    store.dispatch(
      jujuActions.updateModelList({
        models: { "user-models": [] },
        wsControllerURL: WS_CONTROLLER_URL,
      }),
    );
    await waitFor(() => {
      expect(countActions(actions, removeCredential.run.type)).toBe(1);
    });
    expect(
      actions.find((action) => action.type === removeCredential.run.type),
    ).toMatchObject(
      removeCredential.run({
        wsControllerURL: WS_CONTROLLER_URL,
        credentialTag: TAG,
      }),
    );
  });
});
