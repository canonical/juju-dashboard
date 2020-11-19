import { createSelector } from "reselect";
import cloneDeep from "clone-deep";
import {
  getModelStatusGroupData,
  extractOwnerName,
  extractCloudName,
  getApplicationStatusGroup,
  getMachineStatusGroup,
  getUnitStatusGroup,
  extractCredentialName,
} from "./utils";

// ---- Selectors for top level keys

/**
  Fetches the model data from state.
  @param {Object} state The application state.
  @returns {Object|Null} The list of model data or null if none found.
*/
export const getModelData = (state) => {
  if (state?.juju?.modelData) {
    return state.juju.modelData;
  }
  return null;
};

/**
  Fetches the controller data from state.
  @param {Object} state The application state.
  @returns {Object|Null} The list of controller data or null if none found.
*/
export const getControllerData = (state) => state?.juju?.controllers;

/**
  Fetches the bakery from state.
  @param {Object} state The application state.
  @returns {Object|Null} The bakery instance or null if none found.
*/
export const getBakery = (state) => state?.root?.bakery;

/**
  Fetches the application config from state.
  @param {Object} state The application state.
  @returns {Object|Null} The config object or null if none found.
*/
export const getConfig = (state) => state?.root?.config;

/**
  Fetches the username and password from state.
  @param {String} wsControllerURL The fully qualified wsController URL to
    retrieve the credentials from.
  @param {Object} state The application state.
  @returns {Object|Null} The username and password or null if none found.
*/
export const getUserPass = (wsControllerURL, state) =>
  state?.root?.credentials?.[wsControllerURL];

/**
  Fetches a login error from state
  @param {Object} state The application state.
  @returns {String|Undefined} The error message if any.
*/
export const getLoginError = (state) => state?.root?.loginError;

/**
  Fetches the juju api instance from state.
  @param {Object} state The application state.
  @returns {Object|Null} The juju api instance or null if none found.
*/
export const getJujuAPIInstances = (state) => state?.root?.jujus;

/**
  Fetches the pinger intervalId from state.
  @param {Object} state The application state.
  @returns {Object|Null} The pinger intervalId or null if none found.
*/
export const getPingerIntervalIds = (state) => state?.root?.pingerIntervalIds;

/**
  Fetches the application version.
  @param {Object} state The application state.
  @returns {Object|Undefined} The application version or undefined
*/
export const getAppVersion = (state) => state?.root?.appVersion;

// ---- Utility selectors

/**
  Returns a selector for the filtered model data.
  @param {Object} filters The filters to filter the model data by.
  @returns {Object} A selector for the filtered model data.
*/
const getFilteredModelData = (filters) =>
  createSelector(
    [getModelData, getControllerData],
    (modelData, controllerData) =>
      filterModelData(filters, modelData, controllerData)
  );

// ---- Utility functions

/**
  Pull the users macaroon credentials from state.
  @param {Object} state The application state.
  @returns {Object} The macaroons extracted from the bakery in state.
*/
const getUserCredentials = (state) => {
  let storedMacaroons = null;
  if (state?.root?.bakery) {
    storedMacaroons = state.root.bakery.storage._store;
  }
  return storedMacaroons;
};

/**
  Base64 decode and json parse the supplied macaroons from the bakery.
  @param {Object} macaroons The macaroons data from the bakery.
  @returns {Object} The users decoded macaroons.
*/
const getDecodedMacaroons = (macaroons) => {
  if (!macaroons) {
    return null;
  }
  let decodedMacaroons = {};
  Object.keys(macaroons).forEach((key) => {
    try {
      decodedMacaroons[key] = JSON.parse(atob(macaroons[key]));
    } catch (err) {
      console.error("Unable to decode macaroons", err);
    }
  });
  return decodedMacaroons;
};

/**
  Gets the model UUID from the supplied name.
  @param {String} name The name of the model.
  @param {Object} modelData The list of models.
  @returns {Object|Null} The model UUID or null if none found.
*/
const getModelUUIDByName = (name, modelData) => {
  let owner = null;
  let modelName = null;
  if (name.includes("/")) {
    [owner, modelName] = name.split("/");
  } else {
    modelName = name;
  }
  if (modelData) {
    for (let uuid in modelData) {
      const model = modelData[uuid].info;
      if (model && model.name === modelName) {
        if (owner) {
          if (model.ownerTag === `user-${owner}`) {
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
};

/**
  Returns the modelStatus for the supplied modelUUID.
  @param {String} modelUUID
  @param {Object} modelData
  @returns {Object|Null} The model status or null if none found
*/
const getModelDataByUUID = (modelUUID, modelData) => {
  if (modelData && modelData[modelUUID]) {
    return modelData[modelUUID];
  }
  return null;
};

/**
  Returns a grouped collection of model statuses.
  @param {Object} modelData
  @returns {Object} The grouped model statuses.
*/
const groupModelsByStatus = (modelData) => {
  const grouped = {
    blocked: [],
    alert: [],
    running: [],
  };
  if (!modelData) {
    return grouped;
  }
  for (let modelUUID in modelData) {
    const model = modelData[modelUUID];
    const { highestStatus } = getModelStatusGroupData(model);
    grouped[highestStatus].push(model);
  }
  return grouped;
};

/**
  Returns a grouped collection of machine instances.
  @param {Object} modelData
  @returns {Object} The grouped machine instances.
*/
const groupMachinesByStatus = (modelData) => {
  const grouped = {
    blocked: [],
    alert: [],
    running: [],
  };
  if (!modelData) {
    return grouped;
  }
  for (let modelUUID in modelData) {
    const model = modelData[modelUUID];
    for (let machineID in model.machines) {
      const machine = model.machines[machineID];
      grouped[getMachineStatusGroup(machine).status].push(machine);
    }
  }
  return grouped;
};

/**
  Returns a grouped collection of unit instances.
  @param {Object} modelData
  @returns {Function} The grouped unit instances.
*/
const groupUnitsByStatus = (modelData) => {
  const grouped = {
    blocked: [],
    alert: [],
    running: [],
  };
  if (!modelData) {
    return grouped;
  }
  for (let modelUUID in modelData) {
    const model = modelData[modelUUID];
    for (let applicationID in model.applications) {
      const application = model.applications[applicationID];
      for (let unitID in application.units) {
        const unit = application.units[unitID];
        grouped[getUnitStatusGroup(unit).status].push(unit);
      }
    }
  }
  return grouped;
};

/**
  Returns a grouped collection of machine instances.
  @param {Object} modelData
  @returns {Object} The grouped machine instances.
*/
const groupApplicationsByStatus = (modelData) => {
  const grouped = {
    blocked: [],
    alert: [],
    running: [],
  };
  if (!modelData) {
    return grouped;
  }
  for (let modelUUID in modelData) {
    const model = modelData[modelUUID];
    for (let applicationID in model.applications) {
      const application = model.applications[applicationID];
      grouped[getApplicationStatusGroup(application).status].push(application);
    }
  }
  return grouped;
};

/**
  Returns a grouped collection of model statuses by owner.
  @param {Object} modelData
  @returns {Object} The grouped model statuses by owner.
*/
const groupModelsByOwner = (modelData) => {
  const grouped = {};
  if (!modelData) {
    return grouped;
  }
  for (let modelUUID in modelData) {
    const model = modelData[modelUUID];
    if (model.info) {
      const owner = extractOwnerName(model.info.ownerTag);
      if (!grouped[owner]) {
        grouped[owner] = [];
      }
      grouped[owner].push(model);
    }
  }
  return grouped;
};

/**
  Returns a grouped collection of model statuses by cloud.
  @param {Object} modelData
  @returns {Object} The grouped model statuses by cloud.
*/
const groupModelsByCloud = (modelData) => {
  const grouped = {};
  if (!modelData) {
    return grouped;
  }
  for (let modelUUID in modelData) {
    const model = modelData[modelUUID];
    if (model.info) {
      const cloud = extractCloudName(model.info.cloudTag);
      if (!grouped[cloud]) {
        grouped[cloud] = [];
      }
      grouped[cloud].push(model);
    }
  }
  return grouped;
};

/**
  Returns an object containing the grouped model status counts.
  @param {Object} groupedModelStatuses
  @returns {Object} The counts for each group of model statuses.
*/
const countModelStatusGroups = (groupedModelStatuses) => {
  const counts = {
    blocked: groupedModelStatuses.blocked.length,
    alert: groupedModelStatuses.alert.length,
    running: groupedModelStatuses.running.length,
  };
  return counts;
};

/**
  Uses the supplied filters object to filter down the supplied modelData and
  returns the filtered object.
  @param {Object} filters The filters to filter by in the format:
    {segment: [values]}
  @param {Object} modelData The model data from the redux store.
  @param {Array} controllers The controllers from the redux store.
  @returns {Object} The filtered model data.
*/
const filterModelData = (filters, modelData, controllers) => {
  const clonedModelData = cloneDeep(modelData);
  // Add the controller name to the model data where we have a valid name.
  Object.entries(clonedModelData).forEach((model) => {
    if (model[1].info) {
      let controllerName = null;
      const modelInfo = model[1].info;
      if (controllers) {
        Object.entries(controllers).some((controller) => {
          controllerName = controller[1].find(
            (controller) => modelInfo.controllerUuid === controller.uuid
          )?.path;
          return controllerName;
        });
      }
      if (modelInfo.controllerUuid === "a030379a-940f-4760-8fcf-3062b41a04e7") {
        controllerName = "JAAS";
      }
      if (!controllerName) {
        controllerName = modelInfo.controllerUuid;
      }
      modelInfo.controllerName = controllerName;
    }
  });
  if (!filters) {
    return clonedModelData;
  }
  const filterSegments = {};

  // Collect segments from filter data
  Object.entries(filters).forEach((filter) => {
    if (filter[1].length === 0) return;
    if (!filterSegments[filter[0]]) {
      filterSegments[filter[0]] = [];
    }
    filterSegments[filter[0]].push(filter[1]);
  });

  Object.entries(clonedModelData).forEach(([uuid, data]) => {
    const modelName = data?.model?.name;
    const cloud = data?.model && extractCloudName(data.model.cloudTag);
    const credential =
      data?.info && extractCredentialName(data.info.cloudCredentialTag);
    const region = data?.model && data.model.region;
    const owner = data?.info && extractOwnerName(data.info.ownerTag);
    // Combine all of the above to create string for fuzzy custom search
    const combinedModelAttributes = `${modelName} ${cloud} ${credential} ${region} ${owner}`;

    const remove = Object.entries(filterSegments).some(
      ([segment, valuesArr]) => {
        const values = valuesArr[0];
        switch (segment) {
          case "cloud":
            return !values.includes(cloud);
          case "credential":
            if (data.info) {
              return !values.includes(credential);
            }
            break;
          case "region":
            return !values.includes(region);
          case "owner":
            if (data.info) {
              return !values.includes(owner);
            }
            break;
          case "custom":
            function includesMatch(v) {
              return combinedModelAttributes.includes(v);
            }
            return !values.some((v) => includesMatch(v));
        }
        return false;
      }
    );
    if (remove) {
      delete clonedModelData[uuid];
    }
  });
  return clonedModelData;
};

// ----- Exported functions

/**
  Gets the model UUID from the supplied name using a memoized selector
  Usage:
    const getModelUUIDMemo = useMemo(getModelUUID.bind(null, modelName), [
      modelName
    ]);

  @param {String} modelName The name of the model.
  @returns {Function} The memoized selector to return a modelUUID.
*/
export const getModelUUID = (modelName) => {
  return createSelector(getModelData, (modelData) =>
    getModelUUIDByName(modelName, modelData)
  );
};

/**
  Gets the model UUID from the supplied name using a memoized selector
  Usage:
    const macaroons = useSelector(getMacaroons);

  @returns {Function} The memoized selector to return the users macaroons.
*/
export const getMacaroons = createSelector(
  getUserCredentials,
  getDecodedMacaroons
);

/**
  Checks state to see if the user is logged in.
  Usage:
    const userIsLoggedIn = useSelector(isLoggedIn);

  @param {Object} state The application state.
  @returns {Boolean} If the user is logged in.
*/
export const isLoggedIn = (wsControllerURL, state) => {
  return state.root.controllerConnections?.[wsControllerURL]?.info?.user
    ?.identity;
};

export const getControllerConnection = (wsControllerURL, state) =>
  state?.root?.controllerConnections?.[wsControllerURL];

export const getControllerConnections = (state) =>
  state?.root?.controllerConnections;

export const isConnecting = (state) => !!state.root.visitURL;
/**
  Returns the users current controller logged in identity
  @param {String} wsControllerURL The controller url to make the query on.
  @param {Object} state The application state.
  @returns {String} The users userTag.
*/
export const getActiveUserTag = (wsControllerURL, state) =>
  state?.root?.controllerConnections?.[wsControllerURL]?.info.user.identity;

/**
  Returns a model status for the supplied modelUUID.
  @param {String} modelUUID The model UUID to fetch the status for
  @returns {Function} The memoized selector to return the model status.
*/
export const getModelStatus = (modelUUID) => {
  return createSelector(getModelData, (modelData) =>
    getModelDataByUUID(modelUUID, modelData)
  );
};

/**
  Returns the model data filtered and grouped by status.
  @param {Object} filters The filters to filter the model data by.
  @returns {Object} The filtered and grouped model data.
*/
export const getGroupedByStatusAndFilteredModelData = (filters) =>
  createSelector(getFilteredModelData(filters), groupModelsByStatus);

/**
  Returns the model data filtered and grouped by cloud.
  @param {Object} filters The filters to filter the model data by.
  @returns {Object} The filtered and grouped model data.
*/
export const getGroupedByCloudAndFilteredModelData = (filters) =>
  createSelector(getFilteredModelData(filters), groupModelsByCloud);

/**
  Returns the model data filtered and grouped by owner.
  @param {Object} filters The filters to filter the model data by.
  @returns {Object} The filtered and grouped model data.
*/
export const getGroupedByOwnerAndFilteredModelData = (filters) =>
  createSelector(getFilteredModelData(filters), groupModelsByOwner);

/**
  Returns the model statuses sorted by status.
  @returns {Function} The memoized selector to return the sorted model statuses.
*/
export const getGroupedModelDataByStatus = createSelector(
  getModelData,
  groupModelsByStatus
);

/**
  Returns the machine instances sorted by status.
  @returns {Function} The memoized selector to return the sorted machine instances.
*/
export const getGroupedMachinesDataByStatus = createSelector(
  getModelData,
  groupMachinesByStatus
);

/**
  Returns the unit instances sorted by status.
  @returns {Function} The memoized selector to return the sorted unit instances.
*/
export const getGroupedUnitsDataByStatus = createSelector(
  getModelData,
  groupUnitsByStatus
);

/**
  Returns the application instances sorted by status.
  @returns {Function} The memoized selector to return the sorted application instances.
*/
export const getGroupedApplicationsDataByStatus = createSelector(
  getModelData,
  groupApplicationsByStatus
);

/**
  Returns the counts of the model statuses
  @returns {Function} The memoized selector to return the model status counts.
*/
export const getGroupedModelStatusCounts = createSelector(
  getGroupedModelDataByStatus,
  countModelStatusGroups
);

/**
  Returns the fully qualified websocket controller API URL.
  @returns {Function} The memoized selector to return the controller websocket api url.
*/
export const getWSControllerURL = createSelector(
  getConfig,
  (config) => `wss://${config.baseControllerURL}/api`
);

/**
  Returns the controller data in the format of an Object.entries output.
  [wsControllerURL, [data]]
  @param {String} controllerUUID The full controller UUID.
  @returns {Array} The controller data in the format of an Object.entries output.
*/
export const getControllerDataByUUID = (controllerUUID) => {
  return createSelector(getControllerData, (controllerData) => {
    if (!controllerData) return null;
    const found = Object.entries(controllerData).find((controller) => {
      // Loop through the sub controllers for each primary controller.
      // This is typically only seen in JAAS. Outside of JAAS there is only ever
      // a single sub controller.
      return controller[1].find(
        (subController) => controllerUUID === subController.uuid
      );
    });
    return found;
  });
};

/**
  @param {String} controllerUUID The full controller UUID.
  @returns {Object} The controllerData.
*/
export const getModelControllerDataByUUID = (controllerUUID) => {
  return createSelector(getControllerData, (controllerData) => {
    if (!controllerData) return null;
    let modelController = null;
    Object.entries(controllerData).some((controller) => {
      // Loop through the sub controllers for each primary controller.
      // This is typically only seen in JAAS. Outside of JAAS there is only ever
      // a single sub controller.
      const modelControllerData = controller[1].find(
        (subController) => controllerUUID === subController.uuid
      );
      if (modelControllerData) {
        modelController = modelControllerData;
        return true;
      }
      return false;
    });
    return modelController;
  });
};
