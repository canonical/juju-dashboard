import Limiter from "async-limiter";
import jujulib from "@canonical/jujulib";
import client from "@canonical/jujulib/api/facades/client-v2";
import modelManager from "@canonical/jujulib/api/facades/model-manager-v5";
import pinger from "@canonical/jujulib/api/facades/pinger-v1";

import { getBakery, isLoggedIn } from "app/selectors";
import { updateModelInfo, updateModelStatus } from "./actions";

// Full URL path to the controller.
const controllerURL = process.env.REACT_APP_CONTROLLER_URL;

/**
  Return a common connection option config.
  @param {Boolean} usePinger If the connection will be long lived then use the
    pinger. Defaults to false.
  @param {Object} bakery A bakery instance.
  @returns {Object} The configuration options.
*/
function generateConnectionOptions(usePinger = false, bakery, onClose) {
  // The options used when connecting to a Juju controller or model.
  const facades = [client, modelManager];
  if (usePinger) {
    facades.push(pinger);
  }
  return {
    bakery,
    closeCallback: onClose,
    debug: false,
    facades
  };
}

/**
  Connects to the controller at the url defined in the REACT_APP_CONTROLLER_URL
  environment variable.
  @param {Object} bakery A bakery instance.
  @returns {Object}
    conn The controller connection instance.
    juju The juju api instance.
*/
export async function loginWithBakery(bakery) {
  const juju = await jujulib.connect(
    controllerURL,
    generateConnectionOptions(true, bakery, e =>
      console.log("controller closed", e)
    )
  );
  const conn = await juju.login({});
  // Ping to keep the connection alive.
  const intervalId = setInterval(() => {
    conn.facades.pinger.ping();
  }, 20000);

  return { conn, juju, intervalId };
}

/**
  Connects and logs in to the supplied modelURL. If the connection takes longer
  than the allowed timeout it gives up.
  @param {String} modelURL The fully qualified url of the model api.
  @param {Object} options The options for the connection.
  @param {Number} duration The timeout in ms for the connection. Defaults to 5s
  @returns {Object} The full model status.
*/
async function connectAndLoginWithTimeout(modelURL, options, duration = 5000) {
  const timeout = new Promise((resolve, reject) => {
    setTimeout(resolve, duration, "timeout");
  });
  const juju = jujulib.connectAndLogin(modelURL, {}, options);
  return new Promise((resolve, reject) => {
    Promise.race([timeout, juju]).then(resp => {
      if (resp === "timeout") {
        reject("timeout");
        return;
      }
      resolve(resp);
    });
  });
}

/**
  Connects to the model url by doing a replacement on the controller url and
  fetches it's full status then logs out of the model and closes the connection.
  @param {String} modelUUID The UUID of the model to connect to. Must be on the
    same controller as provided by the controllerURL`.
  @param {Object} getState A function that'll return the app redux state.
  @returns {Object} The full model status.
*/
async function fetchModelStatus(modelUUID, getState) {
  const bakery = getBakery(getState());
  const modelURL = controllerURL.replace("/api", `/model/${modelUUID}/api`);
  let status = null;
  // Logged in state is checked multiple times as the user may have logged out
  // between requests.
  if (isLoggedIn(getState())) {
    try {
      const { conn, logout } = await connectAndLoginWithTimeout(
        modelURL,
        generateConnectionOptions(false, bakery)
      );
      if (isLoggedIn(getState())) {
        status = await conn.facades.client.fullStatus();
      }
      logout();
    } catch (e) {
      console.error("timeout, unable to log in to model:", modelUUID);
    }
  }
  return status;
}

/**
  Calls the fetchModelStatus method with the UUID and then dispatches the
  action to store it in the redux store.
  @param {String} modelUUID The model UUID to fetch the model status of.
  @param {Function} dispatch The redux store hook method.
  @param {Object} getState A function that'll return the app redux state.
 */
export async function fetchAndStoreModelStatus(modelUUID, dispatch, getState) {
  const status = await fetchModelStatus(modelUUID, getState);
  if (status === null) {
    return;
  }
  dispatch(updateModelStatus(modelUUID, status));
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
  @param {Object} reduxStore The applications reduxStore.
  @returns {Promise} Resolves when the queue fetching the model statuses has
    completed. Does not reject.
*/
export async function fetchAllModelStatuses(conn, reduxStore) {
  const getState = reduxStore.getState;
  const modelList = getState().juju.models;
  const dispatch = reduxStore.dispatch;
  const queue = new Limiter({ concurrency: 5 });
  const modelUUIDs = Object.keys(modelList);
  modelUUIDs.forEach(modelUUID => {
    queue.push(async done => {
      if (isLoggedIn(getState())) {
        await fetchAndStoreModelStatus(modelUUID, dispatch, getState);
      }
      if (isLoggedIn(getState())) {
        const modelInfo = await fetchModelInfo(conn, modelUUID);
        dispatch(updateModelInfo(modelInfo));
      }
      done();
    });
  });
  return new Promise(resolve => {
    queue.onDone(() => {
      resolve();
    });
  });
}
