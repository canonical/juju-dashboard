import React from "react";
import cloneDeep from "clone-deep";

import defaultCharmIcon from "static/images/icons/default-charm-icon.svg";

export const generateStatusElement = (status, count, useIcon = true) => {
  let statusClass = status ? `is-${status.toLowerCase()}` : "";
  let countValue = "";
  if (count !== undefined) {
    countValue = ` (${count})`;
  }
  const className = useIcon ? "status-icon " + statusClass : "";
  return (
    <span className={className}>
      {status}
      {countValue}
    </span>
  );
};

export const generateSpanClass = (className, value) => {
  return <span className={className}>{value}</span>;
};

// Highest status to the right
const statusOrder = ["running", "alert", "blocked"];

const setHighestStatus = (entityStatus, highestStatus) => {
  if (statusOrder.indexOf(entityStatus) > statusOrder.indexOf(highestStatus)) {
    return entityStatus;
  }
  return highestStatus;
};

// If it's the highest status then we don't need to continue looping
// applications or units.
const checkHighestStatus = (highestStatus) => {
  return highestStatus === statusOrder[statusOrder.length - 1];
};

export const getModelStatusGroupData = (model) => {
  let highestStatus = statusOrder[0]; // Set the highest status to the lowest.
  let messages = [];
  const applications = model.applications;
  Object.keys(applications).forEach((appName) => {
    const app = applications[appName];
    const { status: appStatus } = getApplicationStatusGroup(app);
    highestStatus = setHighestStatus(appStatus, highestStatus);
    if (checkHighestStatus(highestStatus)) {
      // If it's the highest status then we want to store the message.
      messages.push(app.status.info);
      return;
    }
    Object.keys(app.units).forEach((unitId) => {
      const unit = app.units[unitId];
      const { status: unitStatus } = getUnitStatusGroup(unit);
      highestStatus = setHighestStatus(unitStatus, highestStatus);
      if (checkHighestStatus(highestStatus)) {
        // If it's the highest status then we want to store the message.
        messages.push(unit.agentStatus.info);
        return;
      }
    });
  });
  return {
    highestStatus,
    messages,
  };
};

/**
  Returns the status for the application.
  @param {Object} application The application to check the status of in the
    format stored in the redux store.
  @returns {Object} The status of the application and any relevent messaging.
*/
export const getApplicationStatusGroup = (application) => {
  // Possible "blocked" or error states in application statuses.
  const blocked = ["blocked"];
  // Possible "alert" states in application statuses.
  const alert = ["unknown"];
  const status = application.status.status;
  const response = {
    status: "running",
    message: null,
  };
  if (blocked.includes(status)) {
    response.status = "blocked";
  }
  if (alert.includes(status)) {
    response.status = "alert";
  }
  return response;
};

/**
  Returns the status level for the machine.
  @param {Object} machine The machine to check the status of in the
    format stored in the redux store.
  @returns {Object} The status of the machine and any relevent messaging.
*/
export const getMachineStatusGroup = (machine) => {
  // Possible "blocked" or error states in machine statuses.
  const blocked = ["down"];
  // Possible "alert" states in machine statuses.
  const alert = ["pending"];
  const status = machine.agentStatus.status;
  const response = {
    status: "running",
    message: null,
  };
  if (blocked.includes(status)) {
    response.status = "blocked";
  }
  if (alert.includes(status)) {
    response.status = "alert";
  }
  return response;
};

/**
  Returns the status level for the unit.
  @param {Object} unit The unit to check the status of in the
    format stored in the redux store.
  @returns {Object} The status of the unit and any relevent messaging.
*/
export const getUnitStatusGroup = (unit) => {
  // Possible "blocked" or error states in the unit statuses.
  const blocked = ["lost"];
  // Possible "alert" states in the unit statuses.
  const alert = ["allocating"];
  const status = unit.agentStatus.status;
  const response = {
    status: "running",
    message: null,
  };
  if (blocked.includes(status)) {
    response.status = "blocked";
  }
  if (alert.includes(status)) {
    response.status = "alert";
  }
  return response;
};

/**
  Returns owner string from ownerTag
  @param {string} ownerTag The ownerTag identifier returns from the API
  @returns {string} The simplified owner string
*/
export const extractOwnerName = (tag) => {
  return tag.split("@")[0].replace("user-", "");
};

/**
  Pluralizes the supplied word based on the provided dataset.
  @param {string} value The integer to be checked
  @param {string} string The item name to be pluralized
  @returns {string} The item pluralized if required
*/
export const pluralize = (value, string) => {
  const special = {
    active: "active",
    allocating: "allocating",
    down: "down",
    joined: "joined",
    lost: "lost",
    running: "running",
    started: "started",
    unknown: "unknown",
    waiting: "waiting",
  };
  if (value === 1) {
    return string;
  } else if (special[string]) {
    return special[string];
  }
  return `${string}s`;
};

/**
  Returns cloud string from cloudTag
  @param {string} cloudTag The cloudTag identifier returns from the API
  @returns {string} The simplified cloud string
*/
export const extractCloudName = (tag) => {
  return tag.replace("cloud-", "");
};

/**
  Returns credential string from Tag
  @param {string} cloudTag The cloudTag identifier returns from the API
  @returns {string} The simplified cloud string
*/
export const extractCredentialName = (tag) => {
  // @ is not there in local boostraps
  // cloudcred-localhost_admin_localhost
  let cred = tag.split("cloudcred-")[1];
  if (cred.indexOf("@") > -1) {
    return cred.split("@")[1].split("_")[1];
  }
  return cred.split("_")[1];
};

/**
  Returns the version of the supplied charm string.
  @param {String} charmName The full path of the charm e.g. cs:foo/bar-123
*/
export const extractRevisionNumber = (charmName) => charmName.split("-").pop();

/**
  Returns a link to the charm icon for the provided charm name.
  @param {String} namespace The fully qualified charm name.
  @returns {String} The link to the charm icon.
*/
export const generateIconPath = (namespace) => {
  if (namespace.indexOf("local:") === 0) {
    return defaultCharmIcon;
  }
  if (namespace.indexOf("cs:") === 0) {
    namespace = namespace.replace("cs:", "");
    return `https://api.jujucharms.com/charmstore/v5/${namespace}/icon.svg`;
  }
  return "";
};

/**
  @returns {Int || 0} Returns the current viewport width
*/
export const getViewportWidth = () => {
  const de = document.documentElement;
  return Math.max(de.clientWidth, window.innerWidth || 0);
};

/**
 * @param {function} fn Function to debounce
 * @param {String} wait Time in milliseconds to wait
 */
export const debounce = (fn, wait) => {
  let t;
  return function () {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, arguments), wait);
  };
};

/**
  Returns a bool on whether a user can admin controllers
  @param {Obj} conn The user connection.
  @returns {Boolean} If they are an admin or not.
*/
export const userIsControllerAdmin = (conn) => {
  const controllerAccess = conn?.info?.user?.controllerAccess;
  return ["superuser", "admin"].includes(controllerAccess);
};

/**
  Returns the modelStatusData filtered by the supplied app value.
  @param {Object} modelStatusData The model status data to filter
  @param {String} appName The name of the application to filter the data by.
*/
export const filterModelStatusDataByApp = (modelStatusData, appName) => {
  if (modelStatusData) {
    const filteredData = cloneDeep(modelStatusData);

    if (appName === "") {
      return filteredData;
    }

    const application = filteredData.applications[appName];
    // remove the units from the application objects that are not
    // the filter-by app.
    const subordinateTo = application?.subordinateTo || [];
    Object.keys(filteredData.applications).forEach((key) => {
      if (key !== appName && !subordinateTo.includes(key)) {
        filteredData.applications[key].units = {};
      }
    });
    // Loop through all of the units of the remaining applications that are
    // listed in the subordinateTo list. This is done because although
    // a subordinate is supposed to be installed on each unit, that's not
    // always the case.
    subordinateTo.forEach((parentName) => {
      const units = filteredData.applications[parentName].units;
      Object.entries(units).forEach((entry) => {
        const found = Object.entries(entry[1].subordinates).find(
          (ele) => ele[0].split("/")[0] === appName
        );
        if (!found) {
          delete units[entry[0]];
        }
      });
    });

    // Remove all the machines that the selected application isn't installed on.
    const appMachines = new Set();
    for (let unitId in application?.units) {
      const unit = application.units[unitId];
      appMachines.add(unit.machine);
    }
    subordinateTo.forEach((subAppName) => {
      // this will be the parent of the subordinate and grab the machines from it
      const parent = filteredData.applications[subAppName];
      for (let unitId in parent.units) {
        const unit = parent.units[unitId];
        appMachines.add(unit.machine);
      }
    });
    for (let machineId in filteredData.machines) {
      if (!appMachines.has(machineId)) delete filteredData.machines[machineId];
    }

    // Remove all relations that don't involve the selected application.
    filteredData.relations = modelStatusData.relations.filter(
      (relation) => relation.key.indexOf(appName) > -1
    );

    return filteredData;
  }

  return modelStatusData;
};

/**
  Returns the units filtered by the supplied machine.
  @param {Object} modelStatusData The model status data to filter
  @param {String} machine The machine to filter the data by.
*/
export const filterUnitsByMachine = (modelStatusData, machineId) => {
  console.log(modelStatusData);
  const filteredUnits = [];
  const applications = modelStatusData?.applications;

  applications &&
    Object.values(applications).forEach((app) => {
      Object.entries(app.units).forEach((unit) => {
        const [unitName, unitInfo] = unit;
        if (unitInfo.machine === machineId) {
          filteredUnits.push(unitName);
        }
      });
    });

  // const filteredUnitsData = Object.values(modelStatusData).reduce(
  //   (filteredUnits) => {
  //     console.log(filteredUnits);
  //   }
  // );

  console.log(filteredUnits);

  //return filteredUnitsData;
};
