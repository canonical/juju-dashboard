import type {
  ApplicationGetResults,
  ErrorResults,
} from "@canonical/jujulib/dist/api/facades/application/ApplicationV18";
import { useCallback } from "react";

import { isSet } from "components/utils";
import type { ConnectionWithFacades } from "juju/types";
import type { Config } from "panels/ConfigPanel/types";

import { useCallWithConnectionPromise } from "./common";

export enum Label {
  NO_APP_FACADE_ERROR = "Applications aren't supported for this model",
}

export const useGetApplicationConfig = (
  userName: null | string = null,
  modelName: null | string = null,
): ((appName: string) => Promise<ApplicationGetResults>) => {
  const handler = useCallback(
    (connection: ConnectionWithFacades, appName: string) => {
      if (!connection.facades.application) {
        throw new Error(Label.NO_APP_FACADE_ERROR);
      }
      return connection.facades.application.get({
        application: appName,
        branch: "",
      });
    },
    [],
  );
  return useCallWithConnectionPromise(handler, userName, modelName);
};

export const useSetApplicationConfig = (
  userName: null | string = null,
  modelName: null | string = null,
): ((appName: string, config: Config) => Promise<ErrorResults>) => {
  const handler = useCallback(
    (connection: ConnectionWithFacades, appName: string, config: Config) => {
      if (!connection.facades.application) {
        throw new Error(Label.NO_APP_FACADE_ERROR);
      }
      const setValues: Record<string, string> = {};
      Object.keys(config).forEach((key) => {
        if (isSet(config[key].newValue)) {
          // Juju requires that the value be a string, even if the field is a bool.
          setValues[key] = `${config[key].newValue}`;
        }
      });
      return connection.facades.application.setConfigs({
        Args: [
          {
            application: appName,
            config: setValues,
            "config-yaml": "",
            generation: "",
          },
        ],
      });
    },
    [],
  );
  return useCallWithConnectionPromise(handler, userName, modelName);
};
