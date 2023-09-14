import type { ModelUserInfo } from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV9";
import type { Endpoint } from "@canonical/jujulib/dist/api/facades/uniter/UniterV18";

import defaultCharmIcon from "static/images/icons/default-charm-icon.svg";
import getUserName from "utils/getUserName";

import type { ModelData, ModelDataList } from "../types";

export type Filters = Record<string, string[]>;

export enum Status {
  ALERT = "alert",
  BLOCKED = "blocked",
  RUNNING = "running",
}

type Response = {
  status: Status;
  message: null;
};

/**
  Returns a grouped collection of model statuses.
  @param modelData
  @returns The grouped model statuses.
*/
export const groupModelsByStatus = (modelData?: ModelDataList | null) => {
  const grouped: Record<Status, ModelData[]> = {
    blocked: [],
    alert: [],
    running: [],
  };
  if (!modelData) {
    return grouped;
  }
  for (const modelUUID in modelData) {
    const model = modelData[modelUUID as keyof ModelDataList];
    const { highestStatus } = getModelStatusGroupData(model);
    grouped[highestStatus].push(model);
  }
  return grouped;
};

// Highest status to the right
const statusOrder = [Status.RUNNING, Status.ALERT, Status.BLOCKED];

const setHighestStatus = (entityStatus: Status, highestStatus: Status) => {
  if (statusOrder.indexOf(entityStatus) > statusOrder.indexOf(highestStatus)) {
    return entityStatus;
  }
  return highestStatus;
};

// If it's the highest status then we don't need to continue looping
// applications or units.
const checkHighestStatus = (highestStatus: Status) => {
  return highestStatus === statusOrder[statusOrder.length - 1];
};

export const getModelStatusGroupData = (model: ModelData) => {
  let highestStatus = statusOrder[0]; // Set the highest status to the lowest.
  const messages: { message: string; appName: string; unitId?: string }[] = [];
  const applications = model.applications || {};
  Object.keys(applications).forEach((appName) => {
    const app = applications[appName];
    const { status: appStatus } = getApplicationStatusGroup(app);
    highestStatus = setHighestStatus(appStatus, highestStatus);
    if (checkHighestStatus(appStatus)) {
      // If it's the highest status then we want to store the message.
      messages.push({
        appName,
        message: app.status.info,
      });
      return;
    }
    const units = app.units || {}; // subordinates do not have units.
    Object.keys(units).forEach((unitId) => {
      const unit = units[unitId];
      const { status: unitStatus } = getUnitStatusGroup(unit);
      highestStatus = setHighestStatus(unitStatus, highestStatus);
      if (checkHighestStatus(unitStatus)) {
        // If it's the highest status then we want to store the message.
        messages.push({
          appName,
          unitId,
          message: unit["agent-status"].info,
        });
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
  @param application The application to check the status of in the
    format stored in the redux store.
  @returns The status of the application and any relevent messaging.
*/
export const getApplicationStatusGroup = (
  application: ModelData["applications"][0]
) => {
  // Possible "blocked" or error states in application statuses.
  const blocked = ["blocked"];
  // Possible "alert" states in application statuses.
  const alert = ["unknown"];
  const status = application.status.status;
  const response: Response = {
    status: Status.RUNNING,
    message: null,
  };
  if (blocked.includes(status)) {
    response.status = Status.BLOCKED;
  }
  if (alert.includes(status)) {
    response.status = Status.ALERT;
  }
  return response;
};

/**
  Returns the status level for the machine.
  @param machine The machine to check the status of in the
    format stored in the redux store.
  @returns The status of the machine and any relevent messaging.
*/
export const getMachineStatusGroup = (machine: ModelData["machines"][0]) => {
  // Possible "blocked" or error states in machine statuses.
  const blocked = ["down"];
  // Possible "alert" states in machine statuses.
  const alert = ["pending"];
  const status = machine["agent-status"].status;
  const response: Response = {
    status: Status.RUNNING,
    message: null,
  };
  if (blocked.includes(status)) {
    response.status = Status.BLOCKED;
  }
  if (alert.includes(status)) {
    response.status = Status.ALERT;
  }
  return response;
};

/**
  Returns the status level for the unit.
  @param unit The unit to check the status of in the
    format stored in the redux store.
  @returns The status of the unit and any relevent messaging.
*/
export const getUnitStatusGroup = (
  unit: ModelData["applications"][0]["units"][0]
) => {
  // Possible "blocked" or error states in the unit statuses.
  const blocked = ["lost"];
  // Possible "alert" states in the unit statuses.
  const alert = ["allocating"];
  const status = unit["agent-status"].status;
  const response: Response = {
    status: Status.RUNNING,
    message: null,
  };
  if (blocked.includes(status)) {
    response.status = Status.BLOCKED;
  }
  if (alert.includes(status)) {
    response.status = Status.ALERT;
  }
  return response;
};

/**
  Returns owner string from ownerTag
  @param ownerTag The ownerTag identifier returns from the API
  @returns The simplified owner string
*/
export const extractOwnerName = (tag: string) => {
  return getUserName(tag.split("@")[0]);
};

/**
  Pluralizes the supplied word based on the provided dataset.
  @param value The integer to be checked
  @param string The item name to be pluralized
  @returns The item pluralized if required
*/
export const pluralize = (value: number, string: string) => {
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
  } else if (string in special) {
    return special[string as keyof typeof special];
  }
  return `${string}s`;
};

/**
  Returns cloud string from cloudTag
  @param cloudTag The cloudTag identifier returns from the API
  @returns The simplified cloud string
*/
export const extractCloudName = (tag = "") => {
  return tag.replace("cloud-", "");
};

/**
  Returns credential string from Tag
  @param cloudTag The cloudTag identifier returns from the API
  @returns The simplified cloud string
*/
export const extractCredentialName = (tag?: string) => {
  // @ is not there in local boostraps
  // cloudcred-localhost_admin_localhost
  if (!tag) return "-";
  const cred = tag.split("cloudcred-")[1];
  if (cred.indexOf("@") > -1) {
    return cred.split("@")[0].split("_")[1];
  }
  return cred.split("_")[1];
};

/**
  Returns the version of the supplied charm string.
  @param charmName The full path of the charm e.g. cs:foo/bar-123
*/
export const extractRevisionNumber = (charmName = "") =>
  charmName.split("-").pop();

/**
  Returns a link to the charm icon for the provided charm name.
  @param charmId The fully qualified charm name.
  @returns The link to the charm icon.
*/
export const generateIconPath = (charmId: string) => {
  if (charmId.indexOf("local:") === 0) {
    return defaultCharmIcon;
  }
  if (charmId.indexOf("cs:") === 0) {
    // Strip unnessesary prefixes
    // before: cs:~containers/lxd-container-47
    // after:  containers/lxd-container-47
    charmId = charmId.replace("cs:~", "");
    charmId = charmId.replace("cs:", "");

    // Remove release from the charmId
    // before: containers/trusty/lxd-container-47
    // after:  containers/lxd-container-47
    charmId = charmId.replace("precise/", "");
    charmId = charmId.replace("trusty/", "");
    charmId = charmId.replace("xenial/", "");
    charmId = charmId.replace("bionic/", "");
    charmId = charmId.replace("focal/", "");

    // Combine owner and charm name
    // before: containers/lxd-container-47
    // after:  containers-lxd-container-47
    charmId = charmId.replace("/", "-");

    // Strip the revision number from the end
    // before: containers-lxd-container-47
    // after:  containers-lxd-container
    charmId = charmId.substr(0, charmId.lastIndexOf("-", charmId.length));

    return `https://charmhub.io/${charmId}/icon`;
  }
  if (charmId.indexOf("ch:") === 0) {
    // Regex explanation:
    // "ch:amd64/xenial/content-cache-425".match(/\/(.+)\/(.+)-\d+/)
    // Array(3) [ "/xenial/content-cache-425", "xenial", "content-cache" ]
    const charmName = charmId.match(/\/(.+)\/(.+)-\d+/)?.[2];
    return `https://charmhub.io/${charmName}/icon`;
  }
  return "";
};

export const extractRelationEndpoints = (relation: {
  endpoints: Endpoint[];
}) => {
  const endpoints: Record<string, string> = {};
  relation.endpoints.forEach((endpoint) => {
    const role = endpoint.relation.role;
    endpoints[role] =
      endpoint["application-name"] + ":" + endpoint.relation.name;
    endpoints[`${role}ApplicationName`] = endpoint["application-name"];
  });
  return endpoints;
};

export const canAdministerModel = (
  userName: string,
  modelUsers?: ModelUserInfo[]
) => {
  let hasPermission = false;
  const sharingAccess = ["admin", "write", "owner"];
  modelUsers &&
    modelUsers.forEach((userObj) => {
      if (userObj.user === userName && sharingAccess.includes(userObj.access)) {
        hasPermission = true;
      }
    });
  return hasPermission;
};
