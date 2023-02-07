import { createAsyncThunk } from "@reduxjs/toolkit";
import { ModelInfoResults } from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV9";

import { actions as jujuActions } from "store/juju";
import { RootState } from "store/store";
import { checkLoggedIn } from "store/middleware/check-auth";

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
    const controllers =
      thunkAPI.getState()?.juju?.controllers?.[wsControllerURL];
    const model = modelInfo.results[0].result;
    if (controllers) {
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
        })
      );
    } else {
      console.log(
        "attempting to update non-existent controller:",
        wsControllerURL
      );
    }
  },
  {
    condition: ({ wsControllerURL }, thunkAPI) => {
      return checkLoggedIn(thunkAPI.getState(), wsControllerURL);
    },
  }
);
