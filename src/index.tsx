import { Notification, Strip } from "@canonical/react-components";
import { unwrapResult } from "@reduxjs/toolkit";
import * as Sentry from "@sentry/browser";
import type { LogLevelDesc } from "loglevel";
import { StrictMode } from "react";
import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import App from "components/App";
import { addWhoamiListener } from "juju/jimm/listeners";
import reduxStore from "store";
import { thunks as appThunks } from "store/app";
import { actions as generalActions } from "store/general";
import { AuthMethod } from "store/general/types";
import type { WindowConfig } from "types";
import { logger } from "utils/logger";

import packageJSON from "../package.json";

import { listenerMiddleware } from "./store/listenerMiddleware";

export const ROOT_ID = "root";
export const RECHECK_TIME = 500;
const appVersion = packageJSON.version;

export enum Label {
  NO_CONFIG = "No configuration found.",
  POLLING_ERROR = "Error while trying to connect and start polling.",
}

if (import.meta.env.PROD && window.jujuDashboardConfig?.analyticsEnabled) {
  Sentry.init({
    dsn: "https://5f679e274f34464194e9592a91ed65d4@sentry.is.canonical.com//29",
  });
  Sentry.setTag("dashboardVersion", appVersion);
}

const getAuthMethod = (config: WindowConfig) => {
  if (!config.isJuju) {
    return AuthMethod.OIDC;
  }
  if (config.identityProviderURL) {
    return AuthMethod.CANDID;
  }
  return AuthMethod.LOCAL;
};

const addressRegex = new RegExp(/^ws[s]?:\/\/(\S+)\//);
export const getControllerAPIEndpointErrors = (
  controllerAPIEndpoint?: string,
) => {
  if (!controllerAPIEndpoint) {
    return "controllerAPIEndpoint is not set.";
  } else if (!controllerAPIEndpoint.endsWith("/api")) {
    return `controllerAPIEndpoint (${controllerAPIEndpoint}) must end with /api.`;
  } else if (!controllerAPIEndpoint?.startsWith("/")) {
    if (
      !controllerAPIEndpoint.startsWith("wss://") &&
      !controllerAPIEndpoint.startsWith("ws://")
    ) {
      return `controllerAPIEndpoint (${controllerAPIEndpoint}) must be an absolute path or begin with ws:// or wss://.`;
    } else if (!addressRegex.test(controllerAPIEndpoint)) {
      return `controllerAPIEndpoint (${controllerAPIEndpoint}) must be an absolute path or contain a hostname or IP.`;
    }
  }

  return null;
};

const getRoot = (): Root | undefined => {
  const rootElement = document.getElementById(ROOT_ID);
  if (rootElement) {
    const root = createRoot(rootElement);
    return root;
  }
};

// Sometimes the config.js file hasn't been parsed by the time this code is
// executed. This is a simple debounce so that in the event it's not it'll wait
// a few cycles before trying again.
let checkCounter = 0;
export const renderApp = () => {
  if (!window.jujuDashboardConfig) {
    if (checkCounter < 5) {
      checkCounter++;
      setTimeout(renderApp, RECHECK_TIME);
      return;
    } else {
      // Display the config error.
      bootstrap();
    }
  } else {
    bootstrap();
  }
};
renderApp();

function bootstrap() {
  const windowConfig = window.jujuDashboardConfig;
  const config = windowConfig
    ? {
        ...windowConfig,
        authMethod: getAuthMethod(windowConfig),
      }
    : null;
  const isProduction = import.meta.env.PROD;
  const logLevel: LogLevelDesc = isProduction
    ? logger.levels.SILENT
    : logger.levels.TRACE;

  logger.setDefaultLevel(logLevel);

  let error: string | null = null;
  if (!config) {
    error = Label.NO_CONFIG;
  }
  // Support Juju 2.9 deployments with the old configuration values.
  // XXX This can be removed once we drop support for 2.9 with the 3.0 release.
  if (config?.baseControllerURL === null) {
    const protocol = window.location.protocol.includes("https") ? "wss" : "ws";
    config.controllerAPIEndpoint = `${protocol}://${window.location.host}/api`;
  }
  const controllerEndpointError = getControllerAPIEndpointErrors(
    config?.controllerAPIEndpoint,
  );
  error = error ?? controllerEndpointError;
  if (error || !config) {
    getRoot()?.render(
      <Strip>
        <Notification severity="negative" title="Error">
          The dashboard is not configured correctly. {error}
        </Notification>
      </Strip>,
    );
    logger.error(error);
    return;
  }
  // It's possible that the charm is generating a relative path for the
  // websocket because it is providing the API on the same host as the
  // application assets.
  // If we were provided with a relative path for the endpoint then we need
  // to build the full correct path for the websocket to connect to.
  const controllerAPIEndpoint = config.controllerAPIEndpoint;
  if (controllerAPIEndpoint) {
    if (!controllerAPIEndpoint.includes("://")) {
      const protocol = window.location.protocol.includes("https")
        ? "wss"
        : "ws";
      config.controllerAPIEndpoint = `${protocol}://${window.location.host}${controllerAPIEndpoint}`;
    }
  }

  if (isProduction && config.analyticsEnabled) {
    Sentry.setTag("isJuju", config.isJuju);
  }

  reduxStore.dispatch(generalActions.storeConfig(config));
  reduxStore.dispatch(generalActions.storeVersion(appVersion));

  if (config.authMethod === AuthMethod.OIDC) {
    addWhoamiListener(listenerMiddleware.startListening);
  }

  if ([AuthMethod.CANDID, AuthMethod.OIDC].includes(config.authMethod)) {
    // If using Candid or OIDC authentication then try and connect automatically
    // If not then wait for the login UI to trigger this
    reduxStore
      .dispatch(appThunks.connectAndStartPolling())
      .then(unwrapResult)
      .catch((error) => logger.error(Label.POLLING_ERROR, error));
  }

  getRoot()?.render(
    <Provider store={reduxStore}>
      <StrictMode>
        <App />
      </StrictMode>
    </Provider>,
  );
}
