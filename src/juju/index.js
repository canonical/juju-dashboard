import Limiter from "async-limiter";
import jujulib from "@canonical/jujulib";
// When updating this list of juju facades be sure to update the
// mangle.reserved list in craco.config.js.
import annotations from "@canonical/jujulib/api/facades/annotations-v2";
import client from "@canonical/jujulib/api/facades/client-v2";
import cloud from "@canonical/jujulib/api/facades/cloud-v3";
import controller from "@canonical/jujulib/api/facades/controller-v5";
import modelManager from "@canonical/jujulib/api/facades/model-manager-v5";
import pinger from "@canonical/jujulib/api/facades/pinger-v1";

import jimm from "app/jimm-facade";

import {
  getBakery,
  getConfig,
  getWSControllerURL,
  isLoggedIn,
  getUserPass,
} from "app/selectors";
import {
  addControllerCloudRegion,
  updateControllerList,
  updateModelInfo,
  updateModelStatus,
} from "./actions";

/**
  Return a common connection option config.
  @param {Boolean} usePinger If the connection will be long lived then use the
    pinger. Defaults to false.
  @param {Object} bakery A bakery instance.
  @returns {Object} The configuration options.
*/
function generateConnectionOptions(usePinger = false, bakery, onClose) {
  // The options used when connecting to a Juju controller or model.
  const facades = [annotations, client, cloud, controller, jimm, modelManager];
  if (usePinger) {
    facades.push(pinger);
  }
  return {
    bakery,
    closeCallback: onClose,
    debug: false,
    facades,
  };
}

function determineLoginParams(credentials, identityProviderAvailable) {
  let loginParams = {};
  if (!identityProviderAvailable) {
    loginParams = {
      user: `user-${credentials.user}`,
      password: credentials.password,
    };
  }
  return loginParams;
}

/**
  Connects to the controller at the url defined in the baseControllerURL
  configuration value.
  @param {String} wsControllerURL The fully qualified URL of the controller api.
  @param {Object|null} credentials The users credentials in the format
    {user: ..., password: ...}
  @param {Object} bakery A bakery instance.
  @param {Boolean} identityProviderAvailable Whether an identity provider is available.
  @returns {Object}
    conn The controller connection instance.
    juju The juju api instance.
*/
export async function loginWithBakery(
  wsControllerURL,
  credentials,
  bakery,
  identityProviderAvailable
) {
  const juju = await jujulib.connect(
    wsControllerURL,
    generateConnectionOptions(true, bakery, (e) =>
      console.log("controller closed", e)
    )
  );
  const loginParams = determineLoginParams(
    credentials,
    identityProviderAvailable
  );
  let conn = null;
  try {
    conn = await juju.login(loginParams);
  } catch (error) {
    return { error };
  }

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
  @param {Object|Null} credentials The users credentials in the format
    {user: ..., password: ...}
  @param {Object} options The options for the connection.
  @param {Boolean} identityProviderAvailable If an identity provider is available.
  @returns {Object} The full model status.
*/
async function connectAndLoginWithTimeout(
  modelURL,
  credentials,
  options,
  identityProviderAvailable
) {
  const duration = 5000;
  const timeout = new Promise((resolve, reject) => {
    setTimeout(resolve, duration, "timeout");
  });
  const loginParams = determineLoginParams(
    credentials,
    identityProviderAvailable
  );
  const juju = jujulib.connectAndLogin(modelURL, loginParams, options);
  return new Promise((resolve, reject) => {
    Promise.race([timeout, juju]).then((resp) => {
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
    same controller as provided by the wsControllerURL`.
  @param {Object} getState A function that'll return the app redux state.
  @returns {Object} The full model status.
*/
async function fetchModelStatus(modelUUID, getState) {
  const appState = getState();
  const bakery = getBakery(appState);
  const { identityProviderAvailable } = getConfig(appState);
  const modelURL = getWSControllerURL(appState).replace(
    "/api",
    `/model/${modelUUID}/api`
  );
  let status = null;
  // Logged in state is checked multiple times as the user may have logged out
  // between requests.
  if (isLoggedIn(getState())) {
    try {
      const credentials = getUserPass(getState());
      const { conn, logout } = await connectAndLoginWithTimeout(
        modelURL,
        credentials,
        generateConnectionOptions(false, bakery),
        identityProviderAvailable
      );
      if (isLoggedIn(getState())) {
        status = await conn.facades.client.fullStatus();
      }
      if (isLoggedIn(getState())) {
        const entities = Object.keys(status.applications).map((name) => ({
          tag: `application-${name}`,
        }));
        const response = await conn.facades.annotations.get({ entities });
        // It will return an entry for every entity even if there are no
        // annotations so we have to inspect them and strip out the empty.
        const annotations = {};
        response.results.forEach((item) => {
          if (Object.keys(item.annotations).length > 0) {
            const appName = item.entity.replace("application-", "");
            annotations[appName] = item.annotations;
          }
        });
        status.annotations = annotations;
      }
      logout();
    } catch (e) {
      console.error("error connecting to model:", modelUUID, e);
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
    same controller as provided by the wsControllerURL`.
  @returns {Object} The full modelInfo.
*/
async function fetchModelInfo(conn, modelUUID) {
  const modelInfo = await conn.facades.modelManager.modelInfo({
    entities: [{ tag: `model-${modelUUID}` }],
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
  modelUUIDs.forEach((modelUUID) => {
    queue.push(async (done) => {
      if (isLoggedIn(getState())) {
        await fetchAndStoreModelStatus(modelUUID, dispatch, getState);
      }
      if (isLoggedIn(getState())) {
        const modelInfo = await fetchModelInfo(conn, modelUUID);
        dispatch(updateModelInfo(modelInfo));
        if (modelInfo.results[0].result.isController) {
          // If this is a controller model then update the
          // controller data with this model data.
          dispatch(addControllerCloudRegion(modelInfo));
        }
      }
      done();
    });
  });
  return new Promise((resolve) => {
    queue.onDone(() => {
      resolve();
    });
  });
}

/**
  Performs an HTTP request to the controller to fetch the controller list.
  Will fail with a console error message if the user doesn't have access.
  @param {Object} conn The Juju controller connection.
  @param {Object} reduxStore The applications reduxStore.
*/
export async function fetchControllerList(conn, reduxStore) {
  let controllers = null;
  if (conn.facades.jimM) {
    const response = await conn.facades.jimM.listControllers();
    controllers = response.controllers;
  } else {
    // If we're not connected to a JIMM then call to get the controller config
    // and generate a fake controller list.
    const controllerConfig = await conn.facades.controller.controllerConfig();
    controllers = [
      {
        path: controllerConfig.config["controller-name"],
        uuid: controllerConfig.config["controller-uuid"],
      },
    ];
  }
  reduxStore.dispatch(updateControllerList(controllers));
}

/**
  Calls to disable the controller UUID masking on JIMM. This will be a noop
  if the user is not an administrator on the controller.
  @param {Object} conn The controller connection instance.
*/
export function disableControllerUUIDMasking(conn) {
  conn.facades.jimM.disableControllerUUIDMasking();
}

export async function updateAnnotations(conn, name, annotations) {
  // XXX Disable until we can properly save back to juju
  // const response = await conn?.facades?.annotations?.set({
  //   annotations: [
  //     {
  //       entity: `application-${name}`,
  //       annotations: {
  //         "gui-x": annotations[0],
  //         "gui-y": annotations[1],
  //       },
  //     },
  //   ],
  // });
  // return response;
}
