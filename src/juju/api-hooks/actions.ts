import type {
  Action as ActionType,
  Entities,
  OperationQueryArgs,
} from "@canonical/jujulib/dist/api/facades/action/ActionV7";
import { useCallback } from "react";

import type { ConnectionWithFacades } from "juju/types";

import { useCallWithConnectionPromise } from "./common";

export enum Label {
  NO_ACTION_FACADE_ERROR = "Actions aren't supported for this model",
}

export const useGetActionsForApplication = (
  userName?: string,
  modelName?: string,
) => {
  const handler = useCallback(
    (connection: ConnectionWithFacades, appName: string) => {
      if (!connection.facades.action) {
        throw new Error(Label.NO_ACTION_FACADE_ERROR);
      }
      return connection.facades.action.applicationsCharmsActions({
        entities: [{ tag: `application-${appName}` }],
      });
    },
    [],
  );
  return useCallWithConnectionPromise(handler, userName, modelName);
};

export const useExecuteActionOnUnits = (
  userName?: string,
  modelName?: string,
) => {
  const handler = useCallback(
    (
      connection: ConnectionWithFacades,
      unitList: string[] = [],
      actionName: string,
      actionOptions: NonNullable<ActionType["parameters"]>,
    ) => {
      if (!connection.facades.action) {
        throw new Error(Label.NO_ACTION_FACADE_ERROR);
      }
      const generatedActions = unitList.map((unit) => {
        return {
          name: actionName,
          receiver: `unit-${unit.replace("/", "-")}`, // Juju unit tag in the format "unit-mysql-1"
          parameters: actionOptions,
          tag: "",
        };
      });
      return connection.facades.action.enqueueOperation({
        actions: generatedActions,
      });
    },
    [],
  );
  return useCallWithConnectionPromise(handler, userName, modelName);
};

export const useQueryOperationsList = (
  userName?: string,
  modelName?: string,
) => {
  const handler = useCallback(
    (
      connection: ConnectionWithFacades,
      queryArgs: Partial<OperationQueryArgs>,
    ) => {
      if (!connection.facades.action) {
        throw new Error(Label.NO_ACTION_FACADE_ERROR);
      }
      return connection.facades.action.listOperations({
        actions: [],
        applications: [],
        limit: 0,
        machines: [],
        offset: 0,
        status: [],
        units: [],
        ...queryArgs,
      });
    },
    [],
  );
  return useCallWithConnectionPromise(handler, userName, modelName);
};

export const useQueryActionsList = (userName?: string, modelName?: string) => {
  const handler = useCallback(
    (connection: ConnectionWithFacades, queryArgs: Entities) => {
      if (!connection.facades.action) {
        throw new Error(Label.NO_ACTION_FACADE_ERROR);
      }
      return connection.facades.action.actions(queryArgs);
    },
    [],
  );
  return useCallWithConnectionPromise(handler, userName, modelName);
};
