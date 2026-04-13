import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import cloneDeep from "clone-deep";

import type { ModelInfo, ModelInfoResults } from "juju/types";
import { actions as jujuActions } from "store/juju";
import { checkLoggedIn } from "store/middleware/check-auth";
import type { RootState } from "store/store";
import { actionWithConnection } from "store/util";
import { toErrorString } from "utils";
import { logger } from "utils/logger";

/**
  Updates the correct controller entry with a cloud and region fetched from
  the supplied model info call.
  @param modelInfo The response from a modelInfo call.
  @param wsControllerURL The controller WebSocket URL.
*/

export const addControllerCloudRegion = createAsyncThunk<
  void,
  { wsControllerURL: string; modelInfo: ModelInfoResults },
  {
    state: RootState;
  }
>(
  "juju/addControllerCloudRegion",
  ({ wsControllerURL, modelInfo }, thunkAPI) => {
    // Get a copy of the store data so it can be manipulated before dispatching
    // the update. Without this the modifications were silently failing,
    // possibly because the data was being made immutable by Immer.
    const controllers = cloneDeep(
      thunkAPI.getState()?.juju?.controllers?.[wsControllerURL],
    );
    if (!modelInfo.results?.length) {
      // No model info results returned.
      return;
    }
    const model = modelInfo.results[0].result;
    if (model && controllers) {
      const updatedControllers = controllers.map((controller) => {
        if (
          "uuid" in controller &&
          controller.uuid === model["controller-uuid"]
        ) {
          controller.location = {
            cloud: model["cloud-region"],
            region: model["cloud-tag"].replace("cloud-", ""),
          };
        }
        return controller;
      });
      thunkAPI.dispatch(
        jujuActions.updateControllerList({
          controllers: updatedControllers,
          wsControllerURL,
        }),
      );
    } else {
      logger.log(
        "attempting to update non-existent controller:",
        wsControllerURL,
      );
    }
  },
  {
    condition: ({ wsControllerURL }, thunkAPI) => {
      return checkLoggedIn(thunkAPI.getState(), wsControllerURL);
    },
  },
);

export type CreateModelPayload = {
  modelName: string;
  credential: string;
  cloudTag: string;
  region?: string;
  wsControllerURL: string;
};

const addModelAction = createAction(
  "juju/addModel",
  (
    payload: CreateModelPayload,
  ): {
    payload: CreateModelPayload;
    meta: { withConnection: true };
  } => ({
    payload,
    meta: { withConnection: true },
  }),
);

export const addModel = createAsyncThunk<
  ModelInfo,
  CreateModelPayload,
  { state: RootState }
>("juju/addModel", async (payload, thunkAPI) => {
  const { wsControllerURL } = payload;
  thunkAPI.dispatch(
    jujuActions.updateModelListLoading({
      wsControllerURL,
      loading: true,
    }),
  );

  try {
    const action = await Promise.resolve(
      thunkAPI.dispatch(addModelAction(payload)),
    );

    if (!actionWithConnection(addModelAction, action)) {
      throw thunkAPI.rejectWithValue(new Error("connection not provided"));
    }

    const { connection } = action.meta;
    const ownerTag = connection.info.user?.identity;

    if (!ownerTag) {
      throw thunkAPI.rejectWithValue(
        new Error("not authenticated with controller"),
      );
    }

    const response = await connection.facades.modelManager?.createModel({
      // Newer facades require `qualifier`, while older facades use `owner-tag`.
      qualifier: ownerTag,
      "owner-tag": ownerTag,
      name: payload.modelName,
      "cloud-tag": payload.cloudTag,
      credential: payload.credential,
      region: payload.region,
    });

    if (!response) {
      throw thunkAPI.rejectWithValue(new Error("unable to create model"));
    }
    return response;
  } catch (error) {
    logger.error("Unable to create model.", error);
    throw thunkAPI.rejectWithValue(toErrorString(error));
  } finally {
    thunkAPI.dispatch(
      jujuActions.updateModelListLoading({
        wsControllerURL,
        loading: false,
      }),
    );
  }
});
