import type {
  ApplicationStatus,
  MachineStatus,
  UnitStatus,
} from "@canonical/jujulib/dist/api/facades/client/ClientV6";
import { createSelector } from "@reduxjs/toolkit";
import cloneDeep from "clone-deep";
import fastDeepEqual from "fast-deep-equal/es6";

import type { AuditEvent } from "juju/jimm/JIMMV3";
import type { RelationshipTuple } from "juju/jimm/JIMMV4";
import type {
  AnnotationData,
  ApplicationData,
  MachineData,
  WatcherModelInfo,
  RelationData,
  UnitData,
} from "juju/types";
import {
  getActiveUserTag,
  getActiveUserControllerAccess,
} from "store/general/selectors";
import type { RootState } from "store/store";
import { getLatestRevision, getUserName } from "utils";

import type {
  Controllers,
  ModelData,
  ModelDataList,
  ModelsList,
} from "./types";
import type { Filters } from "./utils/models";
import {
  extractCloudName,
  extractCredentialName,
  extractOwnerName,
  getApplicationStatusGroup,
  getMachineStatusGroup,
  getUnitStatusGroup,
  groupModelsByStatus,
} from "./utils/models";

const slice = (state: RootState) => state.juju;

/**
  Fetches the audit event details from state.
*/
export const getAuditEventsState = createSelector(
  [slice],
  (sliceState) => sliceState.auditEvents,
);

/**
  Fetches the audit event items from state.
*/
export const getAuditEvents = createSelector(
  [getAuditEventsState],
  (auditEvents) => auditEvents.items,
);

/**
  Fetches the audit event errors from state.
*/
export const getAuditEventsErrors = createSelector(
  [getAuditEventsState],
  (auditEvents) => auditEvents.errors,
);

/**
  Fetches the audit events loaded state.
*/
export const getAuditEventsLoaded = createSelector(
  [getAuditEventsState],
  (auditEvents) => auditEvents.loaded,
);

/**
  Fetches the audit events loading state.
*/
export const getAuditEventsLoading = createSelector(
  [getAuditEventsState],
  (auditEvents) => auditEvents.loading,
);

export const getAuditEventsLimit = createSelector(
  [getAuditEventsState],
  (auditEvents) => auditEvents.limit,
);

const getUniqueAuditEventValues = <K extends keyof AuditEvent>(
  key: K,
  auditEvents?: AuditEvent[] | null,
  modifier?: (value: AuditEvent[K]) => string,
) => {
  // Use a set to get unique values.
  const values = new Set<string | AuditEvent[K]>();
  auditEvents
    ?.filter(({ [key]: value }) => typeof value !== "undefined")
    .forEach(({ [key]: value }) =>
      values.add(modifier ? modifier(value) : value),
    );
  return Array.from(values);
};

/**
  Fetches the unique usernames from the audit events.
*/
export const getAuditEventsUsers = createSelector(
  [getAuditEvents],
  (auditEvents) =>
    getUniqueAuditEventValues("user-tag", auditEvents, getUserName),
);

/**
  Fetches the unique model names from the audit events.
*/
export const getAuditEventsModels = createSelector(
  [getAuditEvents],
  (auditEvents) => getUniqueAuditEventValues("model", auditEvents),
);

/**
  Fetches the unique facade names from the audit events.
*/
export const getAuditEventsFacades = createSelector(
  [getAuditEvents],
  (auditEvents) => getUniqueAuditEventValues("facade-name", auditEvents),
);

/**
  Fetches the unique method names from the audit events.
*/
export const getAuditEventsMethods = createSelector(
  [getAuditEvents],
  (auditEvents) => getUniqueAuditEventValues("facade-method", auditEvents),
);

/**
  Fetches the cross model query from state.
*/
export const getCrossModelQueryState = createSelector(
  [slice],
  (sliceState) => sliceState.crossModelQuery,
);

/**
  Fetches the cross model query results from state.
*/
export const getCrossModelQueryResults = createSelector(
  [getCrossModelQueryState],
  (crossModelQuery) => crossModelQuery.results,
);

/**
  Fetches the cross model query errors from state.
*/
export const getCrossModelQueryErrors = createSelector(
  [getCrossModelQueryState],
  (crossModelQuery) => crossModelQuery.errors,
);

/**
  Fetches the cross model query loaded state.
*/
export const getCrossModelQueryLoaded = createSelector(
  [getCrossModelQueryState],
  (crossModelQuery) => crossModelQuery.loaded,
);

/**
  Fetches the cross model query loading state.
*/
export const getCrossModelQueryLoading = createSelector(
  [getCrossModelQueryState],
  (crossModelQuery) => crossModelQuery.loading,
);

export const getSecretsState = createSelector(
  [slice],
  (sliceState) => sliceState.secrets,
);

export const getModelSecretsState = createSelector(
  [getSecretsState, (_state: RootState, modelUUID: string | null) => modelUUID],
  (secrets, modelUUID) => (modelUUID ? secrets[modelUUID] : null),
);

export const getModelSecrets = createSelector(
  [getModelSecretsState],
  (secrets) => secrets?.items,
);

export const getSecretsErrors = createSelector(
  [getModelSecretsState],
  (secrets) => secrets?.errors,
);

export const getSecretsLoaded = createSelector(
  [getModelSecretsState],
  (secrets) => secrets?.loaded,
);

export const getSecretsLoading = createSelector(
  [getModelSecretsState],
  (secrets) => secrets?.loading,
);

export const getSecretByURI = createSelector(
  [
    getModelSecrets,
    (_state: RootState, _modelUUID: string, secretURI?: string | null) =>
      secretURI,
  ],
  (secrets, secretURI) =>
    secretURI ? secrets?.find(({ uri }) => uri === secretURI) : null,
);

export const getSecretLatestRevision = createSelector(
  [getSecretByURI],
  (secret) => getLatestRevision(secret),
);

export const getSecretsContentState = createSelector(
  [getModelSecretsState],
  (secrets) => secrets?.content,
);

export const getSecretsContent = createSelector(
  [getSecretsContentState],
  (content) => content?.content,
);

export const getSecretsContentErrors = createSelector(
  [getSecretsContentState],
  (content) => content?.errors,
);

export const getSecretsContentLoaded = createSelector(
  [getSecretsContentState],
  (content) => content?.loaded,
);

export const getSecretsContentLoading = createSelector(
  [getSecretsContentState],
  (content) => content?.loading,
);

export const getModelFeaturesState = createSelector(
  [slice],
  (sliceState) => sliceState.modelFeatures,
);

export const getModelFeatures = createSelector(
  [getModelFeaturesState, (_state: RootState, modelUUID: string) => modelUUID],
  (modelFeatures, modelUUID) => modelFeatures[modelUUID],
);

export const getCanListSecrets = createSelector(
  [getModelFeatures],
  (modelFeatures) => modelFeatures?.listSecrets,
);

export const getCanManageSecrets = createSelector(
  [getModelFeatures],
  (modelFeatures) => modelFeatures?.manageSecrets,
);

/**
  Fetches the model data from state.
  @param state The application state.
  @returns The list of model data or null if none found.
*/
export const getModelData = createSelector(
  [slice],
  (sliceState) => sliceState.modelData ?? null,
);

export const getModelsError = createSelector(
  [slice],
  (sliceState) => sliceState.modelsError,
);

/**
  Fetches the controller data from state.
  @param state The application state.
  @returns The list of controller data or null if none found.
*/
export const getControllerData = createSelector(
  [slice],
  (sliceState) => sliceState.controllers,
);

export const getControllersCount = createSelector([slice], (sliceState) => {
  const controllerData = sliceState.controllers;
  return controllerData
    ? Object.values(controllerData).reduce(
        (count, controllers) => count + controllers.length,
        0,
      )
    : 0;
});

const getModelWatcherData = createSelector(
  [slice],
  (sliceState) => sliceState.modelWatcherData,
);

export const getModelList = createSelector(
  [slice],
  (sliceState) => sliceState.models,
);

/**
  Get the names of all models.
*/
export const getFullModelNames = createSelector(
  [getModelList, getControllerData],
  (modelList, controllers) =>
    controllers
      ? Object.values(modelList)?.reduce<string[]>((modelNames, model) => {
          const controller =
            model.wsControllerURL in controllers &&
            controllers[model.wsControllerURL][0];
          if (controller && "name" in controller) {
            modelNames.push(`${controller.name}/${model.name}`);
          }
          return modelNames;
        }, [])
      : [],
);

/**
  Get a model by UUID.
*/
export const getModelByUUID = createSelector(
  [getModelList, (_, uuid?: string | null) => uuid],
  (modelList, uuid) => (uuid ? modelList?.[uuid] : null),
);

export const getModelDataByUUID = createSelector(
  [getModelData, (_, modelUUID?: string | null) => modelUUID],
  (modelData, modelUUID) => (modelUUID ? modelData[modelUUID] : null),
);

/**
  Get the full name of a model.
*/
export const getFullModelName = createSelector(
  [getModelByUUID, getControllerData],
  (model, controllers) => {
    const controller =
      controllers &&
      model?.wsControllerURL &&
      model.wsControllerURL in controllers
        ? controllers[model.wsControllerURL][0]
        : null;
    return controller && model && "name" in controller
      ? `${controller.name}/${model.name}`
      : null;
  },
);

/**
  Get all unique users.
*/
export const getUsers = createSelector([getModelData], (models) => {
  const users = new Set<string>();
  Object.values(models).forEach((model) => {
    model.info?.users.forEach(({ user }) => users.add(user));
  });
  return Array.from(users);
});

/**
  Get the active users for each model.
*/
export const getActiveUsers = createSelector(
  [getModelList, (state: RootState) => state],
  (models, state) => {
    const activeUsers: Record<string, string> = {};
    Object.entries(models).forEach(([modelUUID, model]) => {
      const user = getActiveUserTag(state, model.wsControllerURL)?.replace(
        "user-",
        "",
      );
      if (user) {
        activeUsers[modelUUID] = user;
      }
    });
    return activeUsers;
  },
);

/**
  Get all unique external users.
*/
export const getExternalUsers = createSelector([getModelData], (models) => {
  const users = new Set<string>();
  Object.values(models).forEach((model) => {
    model.info?.users.forEach(({ user }) => {
      if (user.includes("@")) {
        users.add(user);
      }
    });
  });
  return Array.from(users.values());
});

/**
  Get external users in a model.
*/
export const getExternalUsersInModel = createSelector(
  [getModelDataByUUID],
  (model) => {
    const users = new Set<string>();
    model?.info?.users.forEach(({ user }) => {
      if (user.includes("@")) {
        users.add(user);
      }
    });
    return Array.from(users.values());
  },
);

/**
  Get user domains.
*/
export const getUserDomains = createSelector([getExternalUsers], (users) => {
  const domains = new Set<string>();
  users.forEach((user) => {
    domains.add(user.split("@")[1]);
  });
  return Array.from(domains.values());
});

/**
  Get user domains in a model.
*/
export const getUserDomainsInModel = createSelector(
  [getExternalUsersInModel],
  (users) => {
    const domains = new Set<string>();
    users.forEach((user) => {
      domains.add(user.split("@")[1]);
    });
    return Array.from(domains.values());
  },
);

/**
  Get the active user for a model.
*/
export const getActiveUser = createSelector(
  [getModelByUUID, (state: RootState) => state],
  (model, state) => {
    const activeUserTag = getActiveUserTag(state, model?.wsControllerURL);
    return activeUserTag ? getUserName(activeUserTag) : undefined;
  },
);

export const getModelCredential = createSelector(
  [getModelDataByUUID],
  (model) => extractCredentialName(model?.info?.["cloud-credential-tag"]),
);

export const getModelAccess = createSelector(
  [
    getModelByUUID,
    getModelDataByUUID,
    getActiveUser,
    (state: RootState) => state,
  ],
  (model, modelData, activeUser, state) => {
    const controllerAccess = getActiveUserControllerAccess(
      state,
      model?.wsControllerURL,
    );
    const modelUser = (modelData?.info?.users ?? []).find(
      ({ user }) => user === activeUser,
    );
    return modelUser?.access || controllerAccess || null;
  },
);

/**
  Get the loaded state of the model list.
  @returns Whether the model list has been loaded.
*/
export const getModelListLoaded = createSelector(
  [slice],
  (sliceState) => sliceState.modelsLoaded,
);

/**
  Whether there are any models in the model list.
  @returns Whether the model list has been loaded.
*/
export const hasModels = createSelector(
  [getModelList],
  (modelList) => Object.keys(modelList).length > 0,
);

export const getModelWatcherDataByUUID = createSelector(
  [getModelWatcherData, (_state: RootState, modelUUID: string) => modelUUID],
  (modelWatcherData, modelUUID) => {
    if (modelWatcherData?.[modelUUID]) {
      return modelWatcherData[modelUUID];
    }

    return null;
  },
);

export const getModelInfo = createSelector(
  getModelWatcherDataByUUID,
  (modelWatcherData): WatcherModelInfo | null => {
    if (modelWatcherData) {
      return modelWatcherData.model;
    }

    return null;
  },
);

export const getModelUUIDFromList = createSelector(
  [
    getModelList,
    (_state: RootState, modelName?: string | null) => modelName || null,
    (_state: RootState, _modelName, ownerName?: string | null) =>
      ownerName || null,
  ],
  (modelList: ModelsList, modelName, ownerName) => {
    let modelUUID = "";
    if (!modelList || !modelName || !ownerName) {
      return modelUUID;
    }
    Object.entries(modelList).some(([_key, { name, ownerTag, uuid }]) => {
      if (name === modelName && getUserName(ownerTag) === ownerName) {
        modelUUID = uuid;
        return true;
      }
      return false;
    });
    return modelUUID;
  },
);

export const getModelAnnotations = createSelector(
  getModelWatcherDataByUUID,
  (modelWatcherData): AnnotationData | null => {
    if (modelWatcherData) {
      return modelWatcherData.annotations;
    }
    return null;
  },
);

export const getModelApplications = createSelector(
  getModelWatcherDataByUUID,
  (modelWatcherData): ApplicationData | null => {
    if (modelWatcherData) {
      return modelWatcherData.applications;
    }
    return null;
  },
);

export const getModelUnits = createSelector(
  getModelWatcherDataByUUID,
  (modelWatcherData): UnitData | null => {
    if (modelWatcherData) {
      return modelWatcherData.units;
    }
    return null;
  },
);

export const getModelRelations = createSelector(
  getModelWatcherDataByUUID,
  (modelWatcherData): RelationData | null => {
    if (modelWatcherData) {
      return modelWatcherData.relations;
    }
    return null;
  },
);

export const getModelMachines = createSelector(
  getModelWatcherDataByUUID,
  (modelWatcherData): MachineData | null => {
    if (modelWatcherData) {
      return modelWatcherData.machines;
    }
    return null;
  },
);

// The order of this enum is important. It needs to be organized in order of
// best to worst status.
export enum Statuses {
  running,
  alert,
  blocked,
}

export interface StatusData {
  // keyof typeof returns the list of string keys in the Statuses enum
  // not the numeric indexes generated at compile time.
  [applicationName: string]: keyof typeof Statuses;
}

/**
  Returns an object of key value pairs indicating an
  applications aggregate unit status.
*/
export const getAllModelApplicationStatus = createSelector(
  getModelUnits,
  (units): StatusData | null => {
    if (!units) {
      return null;
    }

    const applicationStatuses: StatusData = {};
    // Convert the various unit statuses into our three current
    // status types "blocked", "alert", "running".
    Object.entries(units).forEach(([_unitId, unitData]) => {
      let workloadStatus = Statuses.running;
      switch (unitData["workload-status"].current) {
        case "maintenance":
        case "waiting":
          workloadStatus = Statuses.alert;
          break;
        case "blocked":
          workloadStatus = Statuses.blocked;
          break;
      }

      let agentStatus = Statuses.running;
      switch (unitData["agent-status"].current) {
        case "allocating":
        case "executing":
        case "rebooting":
          agentStatus = Statuses.alert;
          break;
        case "failed":
        case "lost":
          agentStatus = Statuses.blocked;
          break;
      }
      // Use the enum index to determine the worst status value.
      const worstStatusIndex = Math.max(
        workloadStatus,
        agentStatus,
        Statuses.running,
      );

      applicationStatuses[unitData.application] = Statuses[
        worstStatusIndex
      ] as keyof typeof Statuses;
    });

    return applicationStatuses;
  },
);

/**
  Returns a selector for the filtered model data.
  @param filters The filters to filter the model data by.
  @returns A selector for the filtered model data.
*/
export const getFilteredModelData = createSelector(
  [getModelData, (_state: RootState, filters: Filters) => filters],
  (modelData, filters) => {
    const clonedModelData: ModelDataList = cloneDeep(modelData);
    const filterSegments: Record<string, string[][]> = {};

    // Collect segments from filter data
    Object.entries(filters).forEach((filter) => {
      if (filter[1].length === 0) return;
      if (!filterSegments[filter[0]]) {
        filterSegments[filter[0]] = [];
      }
      filterSegments[filter[0]].push(filter[1]);
    });

    Object.entries(clonedModelData).forEach(([uuid, data]) => {
      const modelName = "model" in data ? data?.model?.name : null;
      const cloud =
        "model" in data ? extractCloudName(data.model["cloud-tag"]) : null;
      const credential =
        "info" in data
          ? extractCredentialName(data.info?.["cloud-credential-tag"])
          : null;
      const region = "model" in data ? data.model.region : null;
      const owner = data.info ? extractOwnerName(data.info["owner-tag"]) : null;
      // Combine all of the above to create string for fuzzy custom search
      const combinedModelAttributes = [
        modelName,
        cloud,
        credential,
        region,
        owner,
      ]
        .filter(Boolean)
        .join(" ");

      const remove = Object.entries(filterSegments).some(
        ([segment, valuesArr]) => {
          const values: string[] = valuesArr[0];
          switch (segment) {
            case "cloud":
              return !cloud || !values.includes(cloud);
            case "credential":
              if ("info" in data) {
                return !credential || !values.includes(credential);
              }
              break;
            case "region":
              return !region || !values.includes(region);
            case "owner":
              if ("info" in data) {
                return !owner || !values.includes(owner);
              }
              break;
            case "custom":
              return !values.some((value) =>
                combinedModelAttributes.includes(value),
              );
          }
          return false;
        },
      );
      if (remove) {
        delete clonedModelData?.[uuid as keyof ModelData];
      }
    });
    return clonedModelData;
  },
);

/**
  Gets the model UUID from the supplied name using a memoized selector
  Usage:
    const getModelUUIDMemo = useMemo(getModelUUID.bind(null, modelName), [
      modelName
    ]);

  @param name The name of the model.
  @returns The memoized selector to return a modelUUID.
*/
export const getModelUUID = createSelector(
  [getModelData, (_state: RootState, name?: string | null) => name ?? null],
  (modelData, name) => {
    let owner = null;
    let modelName = null;
    if (name?.includes("/")) {
      [owner, modelName] = name.split("/");
    } else {
      modelName = name;
    }
    if (modelData) {
      for (const uuid in modelData) {
        const model = modelData[uuid].info;
        if (model && model.name === modelName) {
          if (owner) {
            if (model["owner-tag"] === `user-${owner}`) {
              // If this is a shared model then we'll also have an owner name
              return uuid;
            }
          } else {
            return uuid;
          }
        }
      }
    }
    return null;
  },
);

export const getModelUUIDs = createSelector([getModelData], (modelData) =>
  Object.keys(modelData).map((modelUUID) => modelUUID),
);

/**
    Returns a model status for the supplied modelUUID.
    @param modelUUID The model UUID to fetch the status for
    @returns The memoized selector to return the model status.
  */
export const getModelStatus = createSelector(
  [getModelData, (_state: RootState, modelUUID?: string | null) => modelUUID],
  (modelData, modelUUID) =>
    modelUUID ? (modelData?.[modelUUID] ?? null) : null,
);

/**
    Returns the model data filtered and grouped by status.
    @param filters The filters to filter the model data by.
    @returns The filtered and grouped model data.
  */
export const getGroupedByStatusAndFilteredModelData = createSelector(
  getFilteredModelData,
  groupModelsByStatus,
);

/**
    Returns the model data filtered and grouped by cloud.
    @param filters The filters to filter the model data by.
    @returns The filtered and grouped model data.
  */
export const getGroupedByCloudAndFilteredModelData = createSelector(
  getFilteredModelData,
  (modelData) => {
    const grouped: Record<string, ModelData[]> = {};
    if (!modelData) {
      return grouped;
    }
    for (const modelUUID in modelData) {
      const model = modelData[modelUUID];
      if (model.info) {
        const cloud = extractCloudName(model.info["cloud-tag"]);
        if (!grouped[cloud]) {
          grouped[cloud] = [];
        }
        grouped[cloud].push(model);
      }
    }
    return grouped;
  },
);

/**
    Returns the model data filtered and grouped by owner.
    @param filters The filters to filter the model data by.
    @returns The filtered and grouped model data.
  */
export const getGroupedByOwnerAndFilteredModelData = createSelector(
  getFilteredModelData,
  (modelData) => {
    const grouped: Record<string, ModelData[]> = {};
    if (!modelData) {
      return grouped;
    }
    for (const modelUUID in modelData) {
      const model = modelData[modelUUID];
      if (model.info) {
        const owner = extractOwnerName(model.info["owner-tag"]);
        if (!grouped[owner]) {
          grouped[owner] = [];
        }
        grouped[owner].push(model);
      }
    }
    return grouped;
  },
);

/**
    Returns the model statuses sorted by status.
    @returns The memoized selector to return the sorted model statuses.
  */
export const getGroupedModelDataByStatus = createSelector(
  getModelData,
  groupModelsByStatus,
);

/**
    Returns the machine instances sorted by status.
    @returns The memoized selector to return the sorted machine instances.
  */
export const getGroupedMachinesDataByStatus = createSelector(
  getModelData,
  (modelData) => {
    const grouped: Record<string, MachineStatus[]> = {
      blocked: [],
      alert: [],
      running: [],
    };
    if (!modelData) {
      return grouped;
    }
    for (const modelUUID in modelData) {
      const model = modelData[modelUUID];
      for (const machineID in model.machines) {
        const machine = model.machines[machineID];
        grouped[getMachineStatusGroup(machine).status].push(machine);
      }
    }
    return grouped;
  },
);

/**
    Returns the unit instances sorted by status.
    @returns The memoized selector to return the sorted unit instances.
  */
export const getGroupedUnitsDataByStatus = createSelector(
  getModelData,
  (modelData) => {
    const grouped: Record<string, UnitStatus[]> = {
      blocked: [],
      alert: [],
      running: [],
    };
    if (!modelData) {
      return grouped;
    }
    for (const modelUUID in modelData) {
      const model = modelData[modelUUID];
      for (const applicationID in model.applications) {
        const application = model.applications[applicationID];
        for (const unitID in application.units) {
          const unit = application.units[unitID];
          grouped[getUnitStatusGroup(unit).status].push(unit);
        }
      }
    }
    return grouped;
  },
);

/**
    Returns the application instances sorted by status.
    @returns The memoized selector to return the sorted application instances.
  */
export const getGroupedApplicationsDataByStatus = createSelector(
  getModelData,
  (modelData) => {
    const grouped: Record<string, ApplicationStatus[]> = {
      blocked: [],
      alert: [],
      running: [],
    };
    if (!modelData) {
      return grouped;
    }
    for (const modelUUID in modelData) {
      const model = modelData[modelUUID];
      for (const applicationID in model.applications) {
        const application = model.applications[applicationID];
        grouped[getApplicationStatusGroup(application).status].push(
          application,
        );
      }
    }
    return grouped;
  },
);

/**
    Returns the counts of the model statuses
    @returns The memoized selector to return the model status counts.
  */
export const getGroupedModelStatusCounts = createSelector(
  getGroupedModelDataByStatus,
  (groupedModelStatuses) => {
    const counts = {
      blocked: groupedModelStatuses.blocked.length,
      alert: groupedModelStatuses.alert.length,
      running: groupedModelStatuses.running.length,
    };
    return counts;
  },
);

/**
    Returns the controller data in the format of an Object.entries output.
    [wsControllerURL, [data]]
    @param controllerUUID The full controller UUID.
    @returns The controller data in the format of an Object.entries output.
  */
export const getControllerDataByUUID = createSelector(
  [
    getControllerData,
    (_state: RootState, controllerUUID?: string) => controllerUUID,
  ],
  (controllerData, controllerUUID) => {
    if (!controllerData) return null;
    const found = Object.entries(controllerData).find((controller) => {
      // Loop through the sub controllers for each primary controller.
      // This is typically only seen in JAAS. Outside of JAAS there is only ever
      // a single sub controller.
      return controller[1].find(
        (subController) =>
          "uuid" in subController && controllerUUID === subController.uuid,
      );
    });
    return found;
  },
);

/**
    @param controllerUUID The full controller UUID.
    @returns The controllerData.
  */
export const getModelControllerDataByUUID = createSelector(
  [
    getControllerData,
    (_state: RootState, controllerUUID?: string) => controllerUUID,
  ],
  (controllerData, controllerUUID) => {
    if (!controllerData || !controllerUUID) return null;
    let modelController: (Controllers[0][0] & { url?: string }) | null = null;
    let controllerURL;
    for (const controller of Object.entries(controllerData)) {
      // Loop through the sub controllers for each primary controller.
      // This is typically only seen in JAAS. Outside of JAAS there is only ever
      // a single sub controller.
      const modelControllerData = controller[1].find(
        (subController) =>
          "uuid" in subController && controllerUUID === subController.uuid,
      );
      if (modelControllerData) {
        controllerURL = controller[0];
        modelController = modelControllerData;
        break;
      }
    }
    // This adds the controller url to existing model controller info so it can be used to access the
    // write facades on the api
    const clonedModelController = cloneDeep(modelController);
    if (clonedModelController) {
      clonedModelController.url = controllerURL;
    }
    return clonedModelController;
  },
);
/**
 * @returns A list of charms that are used by the selected applications.
 */
export const getCharms = createSelector(slice, (sliceState) => {
  return sliceState.charms.filter((charm) => {
    return sliceState.selectedApplications.some(
      (application) =>
        "charm-url" in application && application["charm-url"] === charm.url,
    );
  });
});

/**
 * @param charmURL The charm URL to filter by.
 * @returns A list of applications that are selected.
 */
export const getSelectedApplications = createSelector(
  [slice, (_state: RootState, charmURL?: string) => charmURL],
  (sliceState, charmURL) => {
    if (!charmURL) {
      return sliceState.selectedApplications;
    }
    return sliceState.selectedApplications.filter(
      (application) =>
        "charm-url" in application && application["charm-url"] === charmURL,
    );
  },
);

/**
 * @param charmURL The charm URL to filter by.
 * @returns The charm object that matches the charm URL.
 */
export const getSelectedCharm = createSelector(
  [slice, (_state: RootState, charmURL: string) => charmURL],
  (sliceState, charmURL) => {
    return sliceState.charms.find((charm) => charm.url === charmURL);
  },
);

export const isKubernetesModel = createSelector(
  [
    getModelDataByUUID,
    (state, uuid?: string | null) => (uuid ? getModelInfo(state, uuid) : null),
  ],
  (modelData, modelInfo) =>
    modelData?.info?.["provider-type"] === "kubernetes" ||
    modelInfo?.type === "kubernetes",
);

export const getReBACAllowedState = createSelector(
  [slice],
  (sliceState) => sliceState.rebac.allowed,
);

export const getReBACPermission = createSelector(
  [
    getReBACAllowedState,
    (_state: RootState, tuple?: RelationshipTuple | null) => tuple,
  ],
  (allowed, tuple) =>
    allowed.find((relation) => fastDeepEqual(relation.tuple, tuple)),
);

export const getReBACPermissions = createSelector(
  [
    getReBACAllowedState,
    (_state: RootState, tuples?: RelationshipTuple[] | null) => tuples,
  ],
  (allowed, tuples) =>
    tuples
      ? allowed.filter((relation) => {
          for (const tuple of tuples) {
            if (fastDeepEqual(relation.tuple, tuple)) return relation.tuple;
          }
        })
      : null,
);

export const getReBACPermissionLoading = createSelector(
  [
    (state, tuple?: RelationshipTuple | null) =>
      getReBACPermission(state, tuple),
  ],
  (permission) => {
    return permission?.loading ?? false;
  },
);

export const getReBACPermissionLoaded = createSelector(
  [
    (state, tuple?: RelationshipTuple | null) =>
      getReBACPermission(state, tuple),
  ],
  (permission) => {
    return permission?.loaded ?? false;
  },
);

export const getReBACPermissionErrors = createSelector(
  [
    (state, tuple?: RelationshipTuple | null) =>
      getReBACPermission(state, tuple),
  ],
  (permission) => {
    return permission?.errors;
  },
);

export const hasReBACPermission = createSelector(
  [
    (state, tuple?: RelationshipTuple | null) =>
      getReBACPermission(state, tuple),
  ],
  (permission) => {
    return permission?.allowed ?? false;
  },
);

export const getReBACRelationshipsState = createSelector(
  [slice],
  (sliceState) => sliceState.rebac.relationships,
);

export const getReBACRelationships = createSelector(
  [getReBACRelationshipsState, (_state, requestId: string) => requestId],
  (relationships, requestId) =>
    relationships.find((relation) => relation.requestId, requestId),
);

export const getReBACRelationshipsLoading = createSelector(
  [(state, requestId: string) => getReBACRelationships(state, requestId)],
  (permission) => permission?.loading ?? false,
);

export const getReBACRelationshipsLoaded = createSelector(
  [(state, requestId: string) => getReBACRelationships(state, requestId)],
  (permission) => permission?.loaded ?? false,
);

export const getReBACRelationshipsErrors = createSelector(
  [(state, requestId: string) => getReBACRelationships(state, requestId)],
  (permission) => permission?.errors,
);

export const getCommandHistory = createSelector(
  [slice],
  ({ commandHistory }) => commandHistory,
);
