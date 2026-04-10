import type { PayloadAction } from "@reduxjs/toolkit";
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
  "models/add-model",
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

export const createModel = async (
  dispatch: (
    action: PayloadAction<CreateModelPayload>,
  ) => Promise<unknown> | unknown,
  payload: CreateModelPayload,
): Promise<ModelInfo> => {
  const action = await dispatch(addModelAction(payload));

  if (!actionWithConnection(addModelAction, action)) {
    throw new Error("connection not provided");
  }

  const { connection } = action.meta;
  const ownerTag = connection.info.user?.identity;

  if (!ownerTag) {
    throw new Error("not authenticated with controller");
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
    throw new Error("unable to create model");
  }

  return response;
};

export const addModel =
  (payload: CreateModelPayload) =>
  async (
    dispatch: (action: unknown) => unknown,
    _getState: () => RootState,
  ): Promise<ModelInfo> => {
    dispatch(
      jujuActions.updateModelListLoading({
        wsControllerURL: payload.wsControllerURL,
        loading: true,
      }),
    );
    dispatch(
      jujuActions.updateModelsError({
        wsControllerURL: payload.wsControllerURL,
        modelsError: null,
      }),
    );

    try {
      return await createModel(
        dispatch as (
          action: PayloadAction<CreateModelPayload>,
        ) => Promise<unknown> | unknown,
        payload,
      );
    } catch (error) {
      const modelsError = toErrorString(error);
      logger.error("Unable to create model.", error);
      dispatch(
        jujuActions.updateModelsError({
          wsControllerURL: payload.wsControllerURL,
          modelsError,
        }),
      );
      throw error;
    } finally {
      dispatch(
        jujuActions.updateModelListLoading({
          wsControllerURL: payload.wsControllerURL,
          loading: false,
        }),
      );
    }
  };
