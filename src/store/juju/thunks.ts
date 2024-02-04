import type { ModelInfoResults } from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV9";
import { createAsyncThunk } from "@reduxjs/toolkit";
import cloneDeep from "clone-deep";

import { actions as jujuActions } from "store/juju";
import { checkLoggedIn } from "store/middleware/check-auth";
import type { RootState } from "store/store";

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
  async ({ wsControllerURL, modelInfo }, thunkAPI) => {
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
      console.log(
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
