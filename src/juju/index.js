import Limiter from "async-limiter";
import jujulib from "@canonical/jujulib";
import client from "@canonical/jujulib/api/facades/client-v2";
import modelManager from "@canonical/jujulib/api/facades/model-manager-v5";
import { Bakery } from "@canonical/macaroon-bakery";

import { actionsList } from "./actions";

// Shared bakery instance.
let bakery = null;

// Full URL path to the controller.
const controllerURL = process.env.REACT_APP_CONTROLLER_URL;

/**
  Creates a new bakery instance
  @param {Function} visitPage The function to call when the bakery returns with
    a visit page URL.
  @returns {Bakery} A new bakery instance.
*/
function createNewBakery(visitPage) {
  const defaultVisitPage = resp => {
    // eslint-disable-next-line no-console
    console.log("visit this URL to login:", resp.Info.VisitURL);
  };
  return new Bakery({
    visitPage: visitPage || defaultVisitPage
  });
}

/**
  Return a common connection option config.
  @returns {Object} The configuration options.
*/
function generateConnectionOptions() {
  // The options used when connecting to a Juju controller or model.
  return {
    debug: true,
    facades: [client, modelManager],
    bakery
  };
}

/**
  Connects to the controller at the url defined in the REACT_APP_CONTROLLER_URL
  environment variable.
  @returns {Object} conn The controller connection instance.
*/
async function loginWithBakery(visitPage) {
  if (bakery === null) {
    bakery = createNewBakery(visitPage);
  }
  const juju = await jujulib.connect(
    controllerURL,
    generateConnectionOptions()
  );
  const conn = await juju.login({});
  return { bakery, conn };
}

/**
  Connects to the model url by doing a replacement on the controller url and
  fetches it's full status then logs out of the model and closes the connection.
  @param {String} modelUUID The UUID of the model to connect to. Must be on the
    same controller as provided by the controllerURL`.
  @returns {Object} The full model status.
*/
async function fetchModelStatus(modelUUID) {
  const modelURL = controllerURL.replace("/api", `/model/${modelUUID}/api`);
  const { conn, logout } = await jujulib.connectAndLogin(
    modelURL,
    {},
    generateConnectionOptions()
  );
  const status = await conn.facades.client.fullStatus();
  logout();
  return status;
}

/**
  Requests the model information for the supplied UUID from the supplied
  controller connection.
  @param {Object} conn The active controller connection.
  @param {String} modelUUID The UUID of the model to connect to. Must be on the
    same controller as provided by the controllerURL`.
  @returns {Object} The full modelInfo.
*/
async function fetchModelInfo(conn, modelUUID) {
  const modelInfo = await conn.facades.modelManager.modelInfo({
    entities: [{ tag: `model-${modelUUID}` }]
  });
  return modelInfo;
}

/**
  Loops through each model UUID to fetch the status. Uppon receiving the status
  dispatches to store that status data.
  @param {Object} conn The connection to the controller.
  @param {Object} modelList The list of models where the key is the model's
    UUID and the body is the models info.
  @param {Function} dispatch The function to call with the action to store the
    model status.
  @returns {Promise} Resolves when the queue fetching the model statuses has
    completed. Does not reject.
*/
async function fetchAllModelStatuses(conn, modelList, dispatch) {
  const queue = new Limiter({ concurrency: 5 });
  const modelUUIDs = Object.keys(modelList);
  modelUUIDs.forEach(modelUUID => {
    queue.push(async done => {
      const status = await fetchModelStatus(modelUUID);
      dispatch({
        type: actionsList.updateModelStatus,
        payload: {
          modelUUID: modelUUID,
          status
        }
      });
      const modelInfo = await fetchModelInfo(conn, modelUUID);
      dispatch({
        type: actionsList.updateModelInfo,
        payload: modelInfo
      });
      done();
    });
  });
  return new Promise(resolve => {
    queue.onDone(() => {
      resolve();
    });
  });
}

export { loginWithBakery, fetchAllModelStatuses };
