import cloneDeep from "clone-deep";

import { fetchAndStoreModelStatus } from "juju/api";

import { actionsList } from "./action-types";

// Action creators

export function clearModelData() {
  return {
    type: actionsList.clearModelData,
  };
}

export function clearControllerData() {
  return {
    type: actionsList.clearControllerData,
  };
}

/**
  @param {String} wsControllerURL The URL of the websocket connection.
  @param {Array} controllers The list of controllers to store.
*/
export function updateControllerList(wsControllerURL, controllers) {
  return {
    type: actionsList.updateControllerList,
    payload: {
      wsControllerURL,
      controllers,
    },
  };
}

/**
  @param models The list of models to store.
*/
export function updateModelList(models, wsControllerURL) {
  return {
    type: actionsList.updateModelList,
    payload: {
      models,
      wsControllerURL,
    },
  };
}

/**
  @param {String} modelUUID The modelUUID of the model to store the
    status under.
  @param {Object} status The status data as returned from the API.
 */
export function updateModelStatus(modelUUID, status, wsControllerURL) {
  return {
    type: actionsList.updateModelStatus,
    payload: {
      modelUUID,
      status,
      wsControllerURL,
    },
  };
}

/**
  @param {Object} modelInfo The model info data as returned from the API.
 */
export function updateModelInfo(modelInfo, wsControllerURL) {
  return {
    type: actionsList.updateModelInfo,
    payload: {
      modelInfo,
      wsControllerURL,
    },
  };
}

/**
  @param {Array} deltas An array of deltas from the AllWatcher.
*/
export function processAllWatcherDeltas(deltas) {
  return {
    type: actionsList.processAllWatcherDeltas,
    payload: deltas,
  };
}

/**
  @param {Object} status The status data from an `fullStatus` API call.
*/
export function populateMissingAllWatcherData(uuid, status) {
  return {
    type: actionsList.populateMissingAllWatcherData,
    payload: { status, uuid },
  };
}

// Thunks

/**
  Returns the model status that's stored in the database if it exists or makes
  another call to request it if it doesn't.
  @param {String} modelUUID The UUID of the model to request the status of.
 */
export function fetchModelStatus(modelUUID) {
  return async function fetchModelStatus(dispatch, getState) {
    const jujuState = getState().juju;
    if (jujuState.modelStatuses && jujuState.modelStatuses[modelUUID]) {
      // It already exists, don't do anything as it'll be updated shortly
      // by the polling loop.
      return;
    }
    fetchAndStoreModelStatus(modelUUID, dispatch, getState);
  };
}

/**
  Updates the correct controller entry with a cloud and region fetched from
  the supplied model info call.
  @param {String} modelInfo The response from a modelInfo call.
*/
export function addControllerCloudRegion(wsControllerURL, modelInfo) {
  return async function addControllerCloudRegion(dispatch, getState) {
    const controllers = getState()?.juju?.controllers[wsControllerURL];
    const model = modelInfo.results[0].result;
    if (controllers) {
      const updatedControllers = cloneDeep(controllers).map((controller) => {
        if (controller.uuid === model["controller-uuid"]) {
          controller.location = {
            cloud: model["cloud-region"],
            region: model["cloud-tag"].replace("cloud-", ""),
          };
        }
        return controller;
      });
      dispatch(updateControllerList(wsControllerURL, updatedControllers));
    } else {
      console.log(
        "attempting to update non-existent controller:",
        wsControllerURL
      );
    }
  };
}
