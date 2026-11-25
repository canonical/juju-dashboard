import type { ListenerMiddlewareInstance } from "@reduxjs/toolkit";

import { createToast } from "store/app/actions";
import { removeCredential } from "store/middleware/process";
import userCredentialsMiddleware from "store/middleware/source/user-credentials";
import type { AppDispatch, RootState } from "store/store";

import { getModelList } from "./selectors";
import { actions as jujuActions } from "./slice";

// Stop waiting for models stuck while being destroyed after this long.
export const DESTROY_TIME_LIMIT = 15 * 60 * 1000;

/**
  Removes a credential once the models using it have been destroyed. The models
  are destroyed by the existing destroyModels flow, which the dialog starts
  alongside this listener.
*/
export const addRemoveCredentialWithModelsListener = (
  startListening: ListenerMiddlewareInstance<
    RootState,
    AppDispatch,
    unknown
  >["startListening"],
): void => {
  startListening({
    actionCreator: jujuActions.removeCredentialWithModelsStart,
    effect: async (action, listenerApi) => {
      const {
        credentialTag,
        credentialName,
        cloudTags,
        models,
        wsControllerURL,
      } = action.payload;
      const modelUUIDs = models.map(({ modelUUID }) => modelUUID);
      const failedModels: Record<string, string> = {};
      // An object, as TypeScript doesn't see assignments made inside the condition callback.
      const result: { ended: "failed" | "gone" | "stopped" } = {
        ended: "gone",
      };
      const modelsGone = (state: RootState): boolean =>
        modelUUIDs.every((modelUUID) => !(modelUUID in getModelList(state)));

      const finished =
        modelsGone(listenerApi.getState()) ||
        (await listenerApi.condition((nextAction, state) => {
          if (
            // A retry for this credential starts its own run.
            (jujuActions.removeCredentialWithModelsStart.match(nextAction) &&
              nextAction.payload.credentialTag === credentialTag) ||
            jujuActions.clearModelData.match(nextAction)
          ) {
            result.ended = "stopped";
            return true;
          }
          if (jujuActions.destroyModelErrors.match(nextAction)) {
            nextAction.payload.errors.forEach(([modelUUID, error]) => {
              if (modelUUIDs.includes(modelUUID)) {
                failedModels[modelUUID] = error;
              }
            });
            if (Object.keys(failedModels).length) {
              result.ended = "failed";
              return true;
            }
          }
          return modelsGone(state);
        }, DESTROY_TIME_LIMIT));

      if (result.ended === "stopped") {
        return;
      }
      if (!finished || result.ended === "failed") {
        listenerApi.dispatch(
          jujuActions.setRemoveCredentialWithModelsStatus({
            credentialTag,
            status: finished ? "failed" : "timedOut",
            failedModels,
            wsControllerURL,
          }),
        );
        return;
      }

      listenerApi.dispatch(
        jujuActions.setRemoveCredentialWithModelsStatus({
          credentialTag,
          status: "removing",
          wsControllerURL,
        }),
      );
      listenerApi.dispatch(
        jujuActions.clearRemoveCredential({ credentialTag, wsControllerURL }),
      );
      listenerApi.dispatch(
        removeCredential.run({ wsControllerURL, credentialTag }),
      );
      const [outcomeAction] = await listenerApi.take(
        (nextAction) =>
          (jujuActions.setRemoveCredentialOutcome.match(nextAction) &&
            nextAction.payload.credentialTag === credentialTag) ||
          // Logging out mid-removal must not leave this waiting forever.
          jujuActions.clearModelData.match(nextAction),
      );
      if (
        jujuActions.setRemoveCredentialOutcome.match(outcomeAction) &&
        outcomeAction.payload.outcome &&
        "result" in outcomeAction.payload.outcome
      ) {
        listenerApi.dispatch(
          jujuActions.clearRemoveCredentialWithModels({
            credentialTag,
            wsControllerURL,
          }),
        );
        listenerApi.dispatch(
          createToast({
            message: `Credential ${credentialName} removed`,
            severity: "positive",
          }),
        );
        listenerApi.dispatch(
          userCredentialsMiddleware.actions.invalidate({
            wsControllerURL,
            cloudTags,
          }),
        );
      }
    },
  });
};
