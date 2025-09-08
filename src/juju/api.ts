import type { ConnectOptions, Client as JujuClient } from "@canonical/jujulib";
import { connect, connectAndLogin } from "@canonical/jujulib";
import Action from "@canonical/jujulib/dist/api/facades/action";
import AllWatcher from "@canonical/jujulib/dist/api/facades/all-watcher";
import type { AllWatcherNextResults } from "@canonical/jujulib/dist/api/facades/all-watcher/AllWatcherV3";
import Annotations from "@canonical/jujulib/dist/api/facades/annotations";
import Application from "@canonical/jujulib/dist/api/facades/application";
import Charms from "@canonical/jujulib/dist/api/facades/charms";
import type { Charm } from "@canonical/jujulib/dist/api/facades/charms/CharmsV5";
import Client from "@canonical/jujulib/dist/api/facades/client";
import Cloud from "@canonical/jujulib/dist/api/facades/cloud";
import Controller from "@canonical/jujulib/dist/api/facades/controller";
import ModelManager from "@canonical/jujulib/dist/api/facades/model-manager";
import Pinger from "@canonical/jujulib/dist/api/facades/pinger";
import Secrets from "@canonical/jujulib/dist/api/facades/secrets";
import { jujuUpdateAvailable } from "@canonical/jujulib/dist/api/versions";
import type { ValueOf } from "@canonical/react-components";
import { unwrapResult } from "@reduxjs/toolkit";
import type { Dispatch } from "redux";

import { Auth } from "auth";
import bakery from "juju/bakery";
import JIMM from "juju/jimm";
import { actions as generalActions } from "store/general";
import {
  getControllerConnection,
  getUserPass,
  getWSControllerURL,
  isLoggedIn,
} from "store/general/selectors";
import type { Credential } from "store/general/types";
import { actions as jujuActions } from "store/juju";
import { addControllerCloudRegion } from "store/juju/thunks";
import type {
  Controller as JujuController,
  ModelFeatures,
} from "store/juju/types";
import { ModelsError } from "store/middleware/model-poller";
import type { RootState, Store } from "store/store";
import { toErrorString } from "utils";
import { logger } from "utils/logger";

import { getModelByUUID } from "../store/juju/selectors";

import {
  Label,
  type AllWatcherDelta,
  type ApplicationInfo,
  type ConnectionWithFacades,
  type Facades,
  type FullStatusAnnotations,
  type FullStatusWithAnnotations,
} from "./types";

export const PING_TIME = 20000;
export const LOGIN_TIMEOUT = 5000;
// Juju supports a client one major version away from the controller's version,
// but only when the minor version is `0` so by setting this to exactly `3.0.0`
// this will allow the dashboard to work with both 2.x.x and 3.x.x controllers.
// See the API server code for more details:
// https://github.com/juju/juju/blob/e2c7b4c88e516976666e3d0c9479d0d3c704e643/apiserver/restrict_newer_client.go#L21C1-L29
export const CLIENT_VERSION = "3.0.0";

/**
  Return a common connection option config.
  @param usePinger If the connection will be long lived then use the
    pinger. Defaults to false.
  @returns The configuration options.
*/
export function generateConnectionOptions(
  usePinger = false,
  onClose: ConnectOptions["closeCallback"] = () => null,
) {
  // The options used when connecting to a Juju controller or model.
  const facades: ValueOf<Facades>[] = [
    Action,
    AllWatcher,
    Annotations,
    Application,
    Charms,
    Client,
    Cloud,
    Controller,
    ModelManager,
    JIMM,
    Secrets,
  ];
  if (usePinger) {
    facades.push(Pinger);
  }
  return {
    bakery,
    closeCallback: onClose,
    debug: false,
    facades,
    wsclass: WebSocket,
    ...Auth.instance.jujulibConnectOptions(),
  };
}

function startPingerLoop(conn: ConnectionWithFacades) {
  // Ping to keep the connection alive.
  const intervalId = window.setInterval(() => {
    conn.facades.pinger?.ping(null).catch((err) => {
      // If the pinger fails for whatever reason then cancel the ping.
      // Not shown in UI. Logged for debugging purposes.
      logger.error("pinger stopped,", err);
      stopPingerLoop(intervalId);
    });
  }, PING_TIME);
  return intervalId;
}

function stopPingerLoop(intervalId: number) {
  if (intervalId) {
    clearInterval(intervalId);
  }
}

/**
  Connects to the controller at the url defined in the controllerAPIEndpoint
  configuration value.
  @param wsControllerURL The fully qualified URL of the controller api.
  @param credentials The users credentials in the format
    {user: ..., password: ...}
  @returns
    conn The controller connection instance.
    juju The juju api instance.
*/
export async function loginWithBakery(
  wsControllerURL: string,
  credentials?: Credential,
) {
  const juju: JujuClient = await connect(
    wsControllerURL,
    generateConnectionOptions(true, (err) =>
      logger.log("controller closed", err),
    ),
  );
  const loginParams = Auth.instance.determineCredentials(credentials);
  let conn: ConnectionWithFacades | null | undefined = null;
  try {
    conn = await juju.login(loginParams, CLIENT_VERSION);
  } catch (error) {
    return { error: Label.CONTROLLER_LOGIN_ERROR };
  }

  const intervalId = conn ? startPingerLoop(conn) : null;
  return { conn, juju, intervalId };
}

export type LoginResponse = Awaited<ReturnType<typeof connectAndLogin>> & {
  conn?: ConnectionWithFacades;
};

/**
  Connects and logs in to the supplied modelURL. If the connection takes longer
  than the allowed timeout it gives up.
  @param modelURL The fully qualified url of the model api.
  @param credentials The users credentials in the format
    {user: ..., password: ...}
  @param options The options for the connection.
  @returns The full model status.
*/
export async function connectAndLoginWithTimeout(
  modelURL: string,
  credentials: Credential | null | undefined,
  options: ConnectOptions,
): Promise<LoginResponse> {
  const timeout: Promise<never> = new Promise((_resolve, reject) => {
    setTimeout(reject, LOGIN_TIMEOUT, new Error(Label.LOGIN_TIMEOUT_ERROR));
  });
  const loginParams = Auth.instance.determineCredentials(credentials);
  const juju: Promise<LoginResponse> = connectAndLogin(
    modelURL,
    options,
    loginParams,
    CLIENT_VERSION,
  );
  return Promise.race([timeout, juju]);
}

/**
  Connects to the model url by doing a replacement on the controller url and
  fetches it's full status then logs out of the model and closes the connection.
  @param modelUUID The UUID of the model to connect to. Must be on the
    same controller as provided by the wsControllerURL`.
  @param getState A function that'll return the app redux state.
  @returns The full model status.
*/
export async function fetchModelStatus(
  modelUUID: string,
  wsControllerURL: string,
  getState: () => RootState,
) {
  const modelURL = wsControllerURL.replace("/api", `/model/${modelUUID}/api`);
  let status: FullStatusWithAnnotations | null = null;
  let features: ModelFeatures | null = null;
  // Logged in state is checked multiple times as the user may have logged out
  // between requests.
  if (isLoggedIn(getState(), wsControllerURL)) {
    try {
      const controllerCredentials = getUserPass(getState(), wsControllerURL);
      const { conn, logout } = await connectAndLoginWithTimeout(
        modelURL,
        controllerCredentials,
        generateConnectionOptions(false),
      );
      if (isLoggedIn(getState(), wsControllerURL)) {
        try {
          status =
            (await conn?.facades.client?.fullStatus({ patterns: [] })) ?? null;
          if (!status) {
            throw new Error("Status not returned.");
          }
        } catch (error) {
          throw new Error(
            `Unable to fetch the status. ${toErrorString(error)}`,
          );
        }
      }

      if (status && isLoggedIn(getState(), wsControllerURL)) {
        const entities = Object.keys(status.applications ?? {}).map((name) => ({
          tag: `application-${name}`,
        }));
        const response = await conn?.facades.annotations?.get({ entities });
        // It will return an entry for every entity even if there are no
        // annotations so we have to inspect them and strip out the empty.
        const annotations: FullStatusAnnotations = {};
        response?.results?.forEach((item) => {
          // Despite what the type says, the annotations property can be null.
          if (Object.keys(item.annotations ?? {}).length > 0) {
            const appName = item.entity.replace("application-", "");
            annotations[appName] = item.annotations;
          }
        });
        status.annotations = annotations;
        const secretsFacade = conn?.facades.secrets?.VERSION ?? 0;
        features = {
          listSecrets: secretsFacade >= 1,
          manageSecrets: secretsFacade >= 2,
        };
      }
      logout();
    } catch (error) {
      logger.error("Error connecting to model:", modelUUID, error);
      throw error;
    }
  }
  return { status, features };
}

/**
  Calls the fetchModelStatus method with the UUID and then dispatches the
  action to store it in the redux store.
  @param modelUUID The model UUID to fetch the model status of.
  @param dispatch The redux store hook method.
  @param getState A function that'll return the app redux state.
 */
export async function fetchAndStoreModelStatus(
  modelUUID: string,
  wsControllerURL: string,
  dispatch: Dispatch,
  getState: () => RootState,
) {
  const { status, features } = await fetchModelStatus(
    modelUUID,
    wsControllerURL,
    getState,
  );
  if (!isLoggedIn(getState(), wsControllerURL)) {
    // The user may have logged out while fetching the model status so don't
    // store anything if they did.
    return;
  }
  if (status) {
    dispatch(
      jujuActions.updateModelStatus({ modelUUID, status, wsControllerURL }),
    );
  }
  if (features) {
    dispatch(
      jujuActions.updateModelFeatures({ modelUUID, features, wsControllerURL }),
    );
  }
}

/**
  Requests the model information for the supplied UUID from the supplied
  controller connection.
  @param conn The active controller connection.
  @param modelUUID The UUID of the model to connect to. Must be on the
    same controller as provided by the wsControllerURL`.
  @returns The full modelInfo.
*/
export async function fetchModelInfo(
  conn: ConnectionWithFacades,
  modelUUID: string,
) {
  const modelInfo = await conn.facades.modelManager?.modelInfo({
    entities: [{ tag: `model-${modelUUID}` }],
  });
  return modelInfo;
}

/**
  Loops through each model UUID to fetch the status. Upon receiving the status
  dispatches to store that status data.
  @param conn The connection to the controller.
  @param modelUUIDList A list of the model uuid's to connect to.
  @param reduxStore The applications reduxStore.
  @returns Resolves when the queue fetching the model statuses has
    completed. Does not reject.
*/
export async function fetchAllModelStatuses(
  wsControllerURL: string,
  modelUUIDList: string[],
  conn: ConnectionWithFacades,
  dispatch: Store["dispatch"],
  getState: () => RootState,
) {
  let modelErrorCount = 0;
  // Use for/of so that the awaits are blocking so only one model gets polled at a time.
  for (const modelUUID of modelUUIDList) {
    if (isLoggedIn(getState(), wsControllerURL)) {
      try {
        const modelWsControllerURL = getModelByUUID(
          getState(),
          modelUUID,
        )?.wsControllerURL;
        if (modelWsControllerURL) {
          await fetchAndStoreModelStatus(
            modelUUID,
            modelWsControllerURL,
            dispatch,
            getState,
          );
        }
        if (!isLoggedIn(getState(), wsControllerURL)) {
          // The user may have logged out while the previous call was in
          // progress.
          return;
        }
        const modelInfo = await fetchModelInfo(conn, modelUUID);
        if (modelInfo) {
          dispatch(
            jujuActions.updateModelInfo({
              modelInfo,
              wsControllerURL,
            }),
          );
        }
        if (!isLoggedIn(getState(), wsControllerURL)) {
          // The user may have logged out while the previous call was in
          // progress.
          return;
        }
        if (modelInfo?.results[0].result?.["is-controller"]) {
          // If this is a controller model then update the
          // controller data with this model data.
          dispatch(addControllerCloudRegion({ wsControllerURL, modelInfo }))
            .then(unwrapResult)
            .catch((error) =>
              // Not shown in UI. Logged for debugging purposes.
              logger.error(
                "Error when trying to add controller cloud and region data.",
                error,
              ),
            );
        }
      } catch (error) {
        modelErrorCount++;
      }
    }
  }
  // If errors exist and appear in more than 10% of models, the promise is
  // rejected and the error further handled in modelPollerMiddleware().
  if (modelErrorCount && modelErrorCount >= 0.1 * modelUUIDList.length) {
    throw new Error(
      modelErrorCount === modelUUIDList.length
        ? ModelsError.LOAD_ALL_MODELS
        : ModelsError.LOAD_SOME_MODELS,
    );
  }
}

/**
  Performs an HTTP request to the controller to fetch the controller list.
  Will fail with a console error message if the user doesn't have access.
  @param wsControllerURL The URL of the controller.
  @param conn The Juju controller connection.
  @param reduxStore The applications reduxStore.
*/
export async function fetchControllerList(
  wsControllerURL: string,
  conn: ConnectionWithFacades,
  dispatch: Store["dispatch"],
  getState: () => RootState,
) {
  let controllers: JujuController[] | null = null;
  try {
    if (conn.facades.jimM) {
      const response = await conn.facades.jimM?.listControllers();
      controllers = response.controllers ?? [];
    } else {
      // If we're not connected to a JIMM then call to get the controller config
      // and generate a fake controller list.
      const controllerConfig =
        await conn.facades.controller?.controllerConfig(null);
      if (controllerConfig?.config) {
        controllers = [
          {
            path: controllerConfig.config["controller-name"],
            uuid: controllerConfig.config["controller-uuid"],
            version: getControllerConnection(getState(), wsControllerURL)
              ?.serverVersion,
          },
        ];
      }
    }
  } catch (error) {
    dispatch(
      generalActions.storeConnectionError(
        "Unable to fetch the list of controllers.",
      ),
    );
  }

  if (controllers) {
    // check for updates
    await Promise.all(
      controllers.map(async (controller) => {
        let updateAvailable = false;
        try {
          updateAvailable =
            (await jujuUpdateAvailable(
              "agent-version" in controller
                ? controller["agent-version"]
                : controller.version || "",
            )) ?? false;
        } catch (error) {
          updateAvailable = false;
        }
        controller.updateAvailable = updateAvailable;
      }),
    );
    dispatch(
      jujuActions.updateControllerList({ wsControllerURL, controllers }),
    );
  }
}

/**
  Calls to disable the controller UUID masking on JIMM. This will be a noop
  if the user is not an administrator on the controller.
  @param conn The controller connection instance.
*/
export function disableControllerUUIDMasking(conn: ConnectionWithFacades) {
  return new Promise<void>((resolve, reject) => {
    if (conn?.facades?.jimM) {
      conn.facades.jimM
        .disableControllerUUIDMasking()
        .then(() => resolve())
        .catch((error) =>
          reject(
            new Error("Unable to disabled controller UUID masking.", error),
          ),
        );
    } else {
      resolve();
    }
  });
}

/**
  Connect to the model representing the supplied modelUUID.
  @param modelUUID
  @param appState
  @returns conn The connection.
*/
export async function connectToModel(
  modelUUID: string,
  wsControllerURL: string,
  credentials?: Credential,
) {
  const modelURL = wsControllerURL.replace("/api", `/model/${modelUUID}/api`);
  const response = await connectAndLoginWithTimeout(
    modelURL,
    credentials,
    generateConnectionOptions(true),
  );
  return response.conn;
}

/**
  Connect to the model representing the supplied modelUUID.
  @param modelUUID
  @param appState
  @returns conn The connection.
*/
export async function connectAndLoginToModel(
  modelUUID: string,
  appState: RootState,
) {
  const wsControllerURL = getModelByUUID(appState, modelUUID)?.wsControllerURL;
  if (!wsControllerURL) {
    return null;
  }
  const credentials = getUserPass(appState, wsControllerURL);
  return connectToModel(modelUUID, wsControllerURL, credentials);
}

// A typeguard to narrow the type of the deltas to what we expect. This is
// needed because currently jujulib doesn't define types for the delta objects.
const isDeltas = (
  deltas: AllWatcherNextResults["deltas"],
): deltas is AllWatcherDelta[] =>
  deltas.length > 0 &&
  Array.isArray(deltas[0]) &&
  deltas[0].length === 3 &&
  typeof deltas[0][0] === "string" &&
  typeof deltas[0][1] === "string" &&
  typeof deltas[0][2] === "object";

export async function startModelWatcher(
  modelUUID: string,
  appState: RootState,
  dispatch: Dispatch,
) {
  const conn = await connectAndLoginToModel(modelUUID, appState);
  if (!conn) {
    throw new Error(Label.START_MODEL_WATCHER_NO_CONNECTION_ERROR);
  }
  const watcherHandle = await conn?.facades.client?.watchAll(null);
  const pingerIntervalId = startPingerLoop(conn);
  const id = watcherHandle?.["watcher-id"];
  if (!id) {
    throw new Error(Label.START_MODEL_WATCHER_NO_ID_ERROR);
  }
  const data = await conn?.facades.allWatcher?.next({ id });
  if (data?.deltas && isDeltas(data?.deltas)) {
    dispatch(jujuActions.processAllWatcherDeltas(data.deltas));
  }
  return { conn, watcherHandle, pingerIntervalId };
}

export async function stopModelWatcher(
  conn: ConnectionWithFacades,
  watcherHandleId: string,
  pingerIntervalId: number,
) {
  await conn.facades.allWatcher?.stop({ id: watcherHandleId });
  stopPingerLoop(pingerIntervalId);
  conn.transport.close();
}

/**
  Call the API to grant the sharing permissions for a model
  @param controllerURL
  @param modelUUID
  @param conn The controller connection.
  @param user The user obj with name and access info
  @param permissionTo
  @param permissionFrom The level of access a user previously had (read|write|admin)
  @param action grant|revoke
  @param dispatch Redux dispatch method
  @returns The application set config response
*/
export async function setModelSharingPermissions(
  controllerURL: string,
  modelUUID: string,
  conn: ConnectionWithFacades | undefined,
  user: string | undefined,
  permissionTo: string | undefined,
  permissionFrom: string | undefined,
  action: string,
  dispatch: Dispatch,
) {
  const modifyAccess = async (access: string, actionName: string) => {
    return await conn?.facades.modelManager?.modifyModelAccess({
      changes: [
        {
          access,
          action: actionName,
          "model-tag": `model-${modelUUID}`,
          "user-tag": `user-${user}`,
        },
      ],
    });
  };

  let response;

  if (conn) {
    if (permissionFrom) {
      response = await modifyAccess(permissionFrom, "revoke");
    }

    if (action === "grant" && permissionTo) {
      response = await modifyAccess(permissionTo, "grant");
    }

    const modelInfo = await fetchModelInfo(conn, modelUUID);
    modelInfo &&
      dispatch(
        jujuActions.updateModelInfo({
          modelInfo,
          wsControllerURL: controllerURL,
        }),
      );
  } else {
    response = Promise.reject(
      new Error(`Unable to connect to controller: ${controllerURL}`),
    );
  }

  return response ?? Promise.reject(new Error("Incorrect options given."));
}

export async function getCharmInfo(
  charmURL: string,
  modelUUID: string,
  appState: RootState,
) {
  const conn = await connectAndLoginToModel(modelUUID, appState);
  const charmDetails = await conn?.facades.charms?.charmInfo({
    url: charmURL,
  });
  return charmDetails;
}

export async function getCharmsURLFromApplications(
  applications: ApplicationInfo[],
  modelUUID: string,
  appState: RootState,
  dispatch: Dispatch,
) {
  const uniqueCharmURLs = new Set<string>();
  applications.forEach(
    (app) => "charm-url" in app && uniqueCharmURLs.add(app["charm-url"]),
  );
  const charms = await Promise.all(
    [...uniqueCharmURLs].map((charmURL) =>
      getCharmInfo(charmURL, modelUUID, appState),
    ),
  );
  const baseWSControllerURL = getWSControllerURL(appState);
  dispatch(
    jujuActions.updateCharms({
      charms: charms.filter((charm): charm is Charm => !!charm),
      wsControllerURL: baseWSControllerURL,
    }),
  );
  return charms.filter((charm) => !!charm).map((charm) => charm?.url);
}
