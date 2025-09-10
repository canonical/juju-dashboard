import type {
  Action as ActionType,
  ApplicationsCharmActionsResults,
  Entities,
  OperationQueryArgs,
  AdditionalProperties,
  EnqueuedActions,
  ActionResults,
  OperationResults,
} from "@canonical/jujulib/dist/api/facades/action/ActionV7";
import { useCallback } from "react";

import type { ConnectionWithFacades } from "juju/types";

import { useCallWithConnectionPromise } from "./common";

export enum Label {
  NO_ACTION_FACADE_ERROR = "Actions aren't supported for this model",
}

export const useGetActionsForApplication = (
  userName: null | string = null,
  modelName: null | string = null,
): ((appName: string) => Promise<ApplicationsCharmActionsResults>) => {
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
  userName: null | string = null,
  modelName: null | string = null,
): ((
  unitList: string[] | undefined,
  actionName: string,
  actionOptions: AdditionalProperties,
) => Promise<EnqueuedActions>) => {
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
  userName: null | string = null,
  modelName: null | string = null,
): ((queryArgs: Partial<OperationQueryArgs>) => Promise<OperationResults>) => {
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

export const useQueryActionsList = (
  userName: null | string = null,
  modelName: null | string = null,
): ((queryArgs: Entities) => Promise<ActionResults>) => {
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
