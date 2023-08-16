import type {
  ConnectOptions,
  Credentials,
  Client as JujuClient,
} from "@canonical/jujulib";
import { connect, connectAndLogin } from "@canonical/jujulib";
import Action from "@canonical/jujulib/dist/api/facades/action";
import type {
  Action as ActionType,
  Entities,
  OperationQueryArgs,
} from "@canonical/jujulib/dist/api/facades/action/ActionV7";
import AllWatcher from "@canonical/jujulib/dist/api/facades/all-watcher";
import type { AllWatcherNextResults } from "@canonical/jujulib/dist/api/facades/all-watcher/AllWatcherV3";
import Annotations from "@canonical/jujulib/dist/api/facades/annotations";
import Application from "@canonical/jujulib/dist/api/facades/application";
import type { ErrorResults } from "@canonical/jujulib/dist/api/facades/application/ApplicationV18";
import Charms from "@canonical/jujulib/dist/api/facades/charms";
import type { Charm } from "@canonical/jujulib/dist/api/facades/charms/CharmsV5";
import Client from "@canonical/jujulib/dist/api/facades/client";
import Cloud from "@canonical/jujulib/dist/api/facades/cloud";
import Controller from "@canonical/jujulib/dist/api/facades/controller";
import ModelManager from "@canonical/jujulib/dist/api/facades/model-manager";
import Pinger from "@canonical/jujulib/dist/api/facades/pinger";
import { jujuUpdateAvailable } from "@canonical/jujulib/dist/api/versions";
import type { ValueOf } from "@canonical/react-components";
import Limiter from "async-limiter";
import type { Dispatch } from "redux";

import { isSet } from "components/utils";
import bakery from "juju/bakery";
import JIMMV4 from "juju/jimm-facade";
import { actions as generalActions } from "store/general";
import {
  getConfig,
  getControllerConnection,
  getUserPass,
  getWSControllerURL,
  isLoggedIn,
} from "store/general/selectors";
import type { Credential } from "store/general/types";
import { actions as jujuActions } from "store/juju";
import { addControllerCloudRegion } from "store/juju/thunks";
import type { Controller as JujuController } from "store/juju/types";
import type { RootState, Store } from "store/store";

import { getModelByUUID } from "../store/juju/selectors";

import type {
  CrossModelQueryRequest,
  CrossModelQueryResponse,
} from "./jimm-facade";
import type {
  AllWatcherDelta,
  ApplicationInfo,
  ConnectionWithFacades,
  Facades,
  FullStatusAnnotations,
  FullStatusWithAnnotations,
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
  onClose: ConnectOptions["closeCallback"] = () => null
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
    JIMMV4,
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
  };
}

function determineLoginParams(
  credentials: Credential | null | undefined,
  identityProviderAvailable: boolean
) {
  let loginParams: Credentials = {};
  if (credentials && !identityProviderAvailable) {
    loginParams = {
      username: credentials.user,
      password: credentials.password,
    };
  }
  return loginParams;
}

function startPingerLoop(conn: ConnectionWithFacades) {
  // Ping to keep the connection alive.
  const intervalId = window.setInterval(() => {
    conn.facades.pinger?.ping(null).catch((e) => {
      // If the pinger fails for whatever reason then cancel the ping.
      console.error("pinger stopped,", e);
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
  @param identityProviderAvailable Whether an identity provider is available.
  @returns
    conn The controller connection instance.
    juju The juju api instance.
*/
export async function loginWithBakery(
  wsControllerURL: string,
  credentials: Credential,
  identityProviderAvailable: boolean
) {
  const juju: JujuClient = await connect(
    wsControllerURL,
    generateConnectionOptions(true, (e) => console.log("controller closed", e))
  );
  const loginParams = determineLoginParams(
    credentials,
    identityProviderAvailable
  );
  let conn: ConnectionWithFacades | null | undefined = null;
  try {
    conn = await juju.login(loginParams, CLIENT_VERSION);
  } catch (error) {
    return { error: "Could not log into controller" };
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
  @param identityProviderAvailable If an identity provider is available.
  @returns The full model status.
*/
export async function connectAndLoginWithTimeout(
  modelURL: string,
  credentials: Credential | null | undefined,
  options: ConnectOptions,
  identityProviderAvailable: boolean
): Promise<LoginResponse> {
  const timeout: Promise<string> = new Promise((resolve) => {
    setTimeout(resolve, LOGIN_TIMEOUT, "timeout");
  });
  const loginParams = determineLoginParams(
    credentials,
    identityProviderAvailable
  );
  const juju: Promise<LoginResponse> = connectAndLogin(
    modelURL,
    loginParams,
    options,
    CLIENT_VERSION
  );
  return new Promise((resolve, reject) => {
    Promise.race([timeout, juju]).then((resp) => {
      if (typeof resp === "string") {
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
  @param modelUUID The UUID of the model to connect to. Must be on the
    same controller as provided by the wsControllerURL`.
  @param getState A function that'll return the app redux state.
  @returns The full model status.
*/
export async function fetchModelStatus(
  modelUUID: string,
  wsControllerURL: string,
  getState: () => RootState
) {
  const appState = getState();
  const baseWSControllerURL = getWSControllerURL(appState);
  const config = getConfig(appState);
  let useIdentityProvider = false;

  if (baseWSControllerURL === wsControllerURL) {
    useIdentityProvider = config?.identityProviderAvailable ?? false;
  }
  const modelURL = wsControllerURL.replace("/api", `/model/${modelUUID}/api`);
  let status: FullStatusWithAnnotations | null = null;
  // Logged in state is checked multiple times as the user may have logged out
  // between requests.
  if (isLoggedIn(getState(), wsControllerURL)) {
    try {
      const controllerCredentials = getUserPass(getState(), wsControllerURL);
      const { conn, logout } = await connectAndLoginWithTimeout(
        modelURL,
        controllerCredentials,
        generateConnectionOptions(false),
        useIdentityProvider
      );
      if (isLoggedIn(getState(), wsControllerURL)) {
        status =
          (await conn?.facades.client?.fullStatus({ patterns: [] })) ?? null;
        if (!status) {
          // XXX If there is an error fetching the full status it's likely that
          // Juju can no longer access this model. At this moment we don't have
          // a location to notify the user. In the new watcher model that's
          // being implemented we will be able to surface this error in the
          // model details page.
          console.error("Unable to fetch the status.");
          return;
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
  @param modelUUID The model UUID to fetch the model status of.
  @param dispatch The redux store hook method.
  @param getState A function that'll return the app redux state.
 */
export async function fetchAndStoreModelStatus(
  modelUUID: string,
  wsControllerURL: string,
  dispatch: Dispatch,
  getState: () => RootState
) {
  const status = await fetchModelStatus(modelUUID, wsControllerURL, getState);
  if (!status) {
    return;
  }
  dispatch(
    jujuActions.updateModelStatus({ modelUUID, status, wsControllerURL })
  );
}

/**
  Requests the model information for the supplied UUID from the supplied
  controller connection.
  @param conn The active controller connection.
  @param modelUUID The UUID of the model to connect to. Must be on the
    same controller as provided by the wsControllerURL`.
  @returns The full modelInfo.
*/
async function fetchModelInfo(conn: ConnectionWithFacades, modelUUID: string) {
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
  getState: () => RootState
) {
  const queue = new Limiter({ concurrency: 1 });
  modelUUIDList.forEach((modelUUID) => {
    queue.push(async (done) => {
      if (isLoggedIn(getState(), wsControllerURL)) {
        await fetchAndStoreModelStatus(
          modelUUID,
          getModelByUUID(getState(), modelUUID).wsControllerURL,
          dispatch,
          getState
        );
        const modelInfo = await fetchModelInfo(conn, modelUUID);
        if (modelInfo) {
          dispatch(
            jujuActions.updateModelInfo({
              modelInfo,
              wsControllerURL,
            })
          );
        }
        if (modelInfo?.results[0].result["is-controller"]) {
          // If this is a controller model then update the
          // controller data with this model data.
          dispatch(addControllerCloudRegion({ wsControllerURL, modelInfo }));
        }
      }
      done();
    });
  });
  return new Promise<void>((resolve) => {
    queue.onDone(() => {
      resolve();
    });
  });
}

/**
  Performs an HTTP request to the controller to fetch the controller list.
  Will fail with a console error message if the user doesn't have access.
  @param wsControllerURL The URL of the controller.
  @param conn The Juju controller connection.
  @param reduxStore The applications reduxStore.
  @param additionalController If this is an additional controller.
*/
export async function fetchControllerList(
  wsControllerURL: string,
  conn: ConnectionWithFacades,
  additionalController: boolean,
  dispatch: Store["dispatch"],
  getState: () => RootState
) {
  let controllers: JujuController[] | null = null;
  if (conn.facades.jimM) {
    try {
      const response = await conn.facades.jimM?.listControllers();
      controllers = response.controllers;
      controllers?.forEach(
        (c) => (c.additionalController = additionalController)
      );
    } catch (error) {
      dispatch(
        generalActions.storeConnectionError(
          "Unable to fetch the list of controllers."
        )
      );
    }
  } else {
    // If we're not connected to a JIMM then call to get the controller config
    // and generate a fake controller list.
    const controllerConfig = await conn.facades.controller?.controllerConfig(
      null
    );
    if (controllerConfig?.config) {
      controllers = [
        {
          path: controllerConfig.config["controller-name"],
          uuid: controllerConfig.config["controller-uuid"],
          version: getControllerConnection(getState(), wsControllerURL)
            ?.serverVersion,
          additionalController,
        },
      ];
    }
  }

  if (controllers) {
    // check for updates
    await Promise.all(
      controllers.map(async (controller) => {
        let updateAvailable = false;
        try {
          updateAvailable =
            (await jujuUpdateAvailable(controller.version || "")) ?? false;
        } catch (error) {
          updateAvailable = false;
        }
        controller.updateAvailable = updateAvailable;
      })
    );
    dispatch(
      jujuActions.updateControllerList({ wsControllerURL, controllers })
    );
  }
}

/**
  Calls to disable the controller UUID masking on JIMM. This will be a noop
  if the user is not an administrator on the controller.
  @param conn The controller connection instance.
*/
export function disableControllerUUIDMasking(conn: ConnectionWithFacades) {
  return new Promise<void>(async (resolve, reject) => {
    if (conn?.facades?.jimM) {
      try {
        await conn.facades.jimM.disableControllerUUIDMasking();
        resolve();
      } catch (e) {
        reject();
      }
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
export async function connectAndLoginToModel(
  modelUUID: string,
  appState: RootState
) {
  const wsControllerURL = getModelByUUID(appState, modelUUID)?.wsControllerURL;
  if (!wsControllerURL) {
    return null;
  }
  const config = getConfig(appState);
  const credentials = getUserPass(appState, wsControllerURL);
  const modelURL = wsControllerURL.replace("/api", `/model/${modelUUID}/api`);
  const response = await connectAndLoginWithTimeout(
    modelURL,
    credentials,
    generateConnectionOptions(true),
    config?.identityProviderAvailable ?? false
  );
  return response.conn;
}

/**
  Call the API to fetch the application config data.
  @param modelUUID
  @param appName
  @param appState
  @returns The application config.
*/
export async function getApplicationConfig(
  modelUUID: string,
  appName: string,
  appState: RootState
) {
  const conn = await connectAndLoginToModel(modelUUID, appState);
  const config = await conn?.facades.application?.get({
    application: appName,
    branch: "",
  });
  return config;
}

export type ConfigValue = string | number | boolean | undefined;

export type ConfigOption<V, T> = {
  name: string;
  default?: V;
  description: string;
  source: "default" | "user";
  type: T;
  value?: V;
  newValue?: V;
};

export type ConfigData =
  | ConfigOption<string, "string">
  | ConfigOption<number, "int" | "float">
  | ConfigOption<boolean, "boolean">;

export type Config = {
  [key: string]: ConfigData;
};

/**
  Call the API to set the application config data.
  @param modelUUID
  @param appName
  @param config
  @param appState
  @returns The application set config response
*/
export async function setApplicationConfig(
  modelUUID: string,
  appName: string,
  config: Config,
  appState: RootState
): Promise<ErrorResults | undefined> {
  const conn = await connectAndLoginToModel(modelUUID, appState);
  const setValues: Record<string, string> = {};
  Object.keys(config).forEach((key) => {
    if (isSet(config[key].newValue)) {
      // Juju requires that the value be a string, even if the field is a bool.
      setValues[key] = `${config[key].newValue}`;
    }
  });
  const resp = await conn?.facades.application?.setConfigs({
    Args: [
      {
        application: appName,
        config: setValues,
        "config-yaml": "",
        generation: "",
      },
    ],
  });
  return resp;
}

export async function getActionsForApplication(
  appName: string,
  modelUUID: string,
  appState: RootState
) {
  const conn = await connectAndLoginToModel(modelUUID, appState);
  const actionList = await conn?.facades.action?.applicationsCharmsActions({
    entities: [{ tag: `application-${appName}` }],
  });
  return actionList;
}

export async function executeActionOnUnits(
  unitList: string[] = [],
  actionName: string,
  actionOptions: NonNullable<ActionType["parameters"]>,
  modelUUID: string,
  appState: RootState
) {
  const generatedActions = unitList.map((unit) => {
    return {
      name: actionName,
      receiver: `unit-${unit.replace("/", "-")}`, // Juju unit tag in the format "unit-mysql-1"
      parameters: actionOptions,
      tag: "",
    };
  });
  const conn = await connectAndLoginToModel(modelUUID, appState);
  const actionResult = await conn?.facades.action?.enqueueOperation({
    actions: generatedActions,
  });
  return actionResult;
}

export async function queryOperationsList(
  queryArgs: Partial<OperationQueryArgs>,
  modelUUID: string,
  appState: RootState
) {
  const conn = await connectAndLoginToModel(modelUUID, appState);
  const operationListResult = await conn?.facades.action?.listOperations({
    actions: [],
    applications: [],
    limit: 0,
    machines: [],
    offset: 0,
    status: [],
    units: [],
    ...queryArgs,
  });
  return operationListResult;
}

export async function queryActionsList(
  queryArgs: Entities,
  modelUUID: string,
  appState: RootState
) {
  const conn = await connectAndLoginToModel(modelUUID, appState);
  const actionsListResult = await conn?.facades.action?.actions(queryArgs);
  return actionsListResult;
}

// A typeguard to narrow the type of the deltas to what we expect. This is
// needed because currently jujulib doesn't define types for the delta objects.
const isDeltas = (
  deltas: AllWatcherNextResults["deltas"]
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
  dispatch: Dispatch
) {
  const conn = await connectAndLoginToModel(modelUUID, appState);
  if (!conn) {
    return null;
  }
  const watcherHandle = await conn?.facades.client?.watchAll(null);
  const pingerIntervalId = startPingerLoop(conn);
  const id = watcherHandle?.["watcher-id"];
  if (!id) {
    return;
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
  pingerIntervalId: number
) {
  // TODO: use allWatcher.stop(...)
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
  dispatch: Dispatch
) {
  const modifyAccess = async (access: string, action: string) => {
    return await conn?.facades.modelManager?.modifyModelAccess({
      changes: [
        {
          access,
          action,
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
        })
      );
  } else {
    response = Promise.reject(
      `Unable to connect to controller: ${controllerURL}`
    );
  }

  return response ?? Promise.reject("Incorrect options given.");
}

export async function getCharmInfo(
  charmURL: string,
  modelUUID: string,
  appState: RootState
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
  dispatch: Dispatch
) {
  const uniqueCharmURLs = new Set<string>();
  applications.forEach(
    (app) => "charm-url" in app && uniqueCharmURLs.add(app["charm-url"])
  );
  const charms = await Promise.all(
    [...uniqueCharmURLs].map((charmURL) =>
      getCharmInfo(charmURL, modelUUID, appState)
    )
  );
  const baseWSControllerURL = getWSControllerURL(appState);
  dispatch(
    jujuActions.updateCharms({
      charms: charms.filter((charm): charm is Charm => !!charm),
      wsControllerURL: baseWSControllerURL,
    })
  );
  return charms.filter((charm) => !!charm).map((charm) => charm?.url);
}

export function findCrossModelQuery(
  conn: ConnectionWithFacades,
  params?: CrossModelQueryRequest
) {
  return new Promise<CrossModelQueryResponse>(async (resolve, reject) => {
    if (conn?.facades?.jimM) {
      try {
        const events = await conn.facades.jimM.findCrossModelQuery(params);
        console.log(events); // TODO: remove!!!
        resolve(events);
      } catch (e) {
        reject(e);
      }
    } else {
      reject("Not connected to JIMM.");
    }
  });
}
