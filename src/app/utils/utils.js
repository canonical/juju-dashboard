import classNames from "classnames";
import { parseISO, formatDistanceToNow } from "date-fns";
import { useState } from "react";
import defaultCharmIcon from "static/images/icons/default-charm-icon.svg";

export function generateEntityIdentifier(charmId, name, subordinate) {
  if (!charmId) {
    return null;
  }

  return (
    <div className="entity-name u-truncate" title={name}>
      {subordinate && <span className="subordinate"></span>}
      {charmId && generateIconImg(name, charmId)}
      {name}
    </div>
  );
}

export const generateStatusElement = (
  status = "unknown",
  count,
  useIcon = true,
  actionsLogs = false,
  className = null
) => {
  let statusClass = status ? `is-${status.toLowerCase()}` : "";
  let countValue = "";
  if (count || count === 0) {
    countValue = ` (${count})`;
  }
  const iconClasses = useIcon ? "status-icon " + statusClass : "";
  // ActionLogs uses a spinner icon if 'running'
  if (actionsLogs && statusClass === "is-running") {
    return (
      <span className="status-icon is-spinner">
        <i className="p-icon--spinner u-animation--spin"></i>
        {status}
      </span>
    );
  }

  return (
    <span className={classNames(iconClasses, className)}>
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
  const applications = model.applications || {};
  Object.keys(applications).forEach((appName) => {
    const app = applications[appName];
    const { status: appStatus } = getApplicationStatusGroup(app);
    highestStatus = setHighestStatus(appStatus, highestStatus);
    if (checkHighestStatus(highestStatus)) {
      // If it's the highest status then we want to store the message.
      messages.push(app.status.info);
      return;
    }
    const units = app.units || {}; // subordinates do not have units.
    Object.keys(units).forEach((unitId) => {
      const unit = units[unitId];
      const { status: unitStatus } = getUnitStatusGroup(unit);
      highestStatus = setHighestStatus(unitStatus, highestStatus);
      if (checkHighestStatus(highestStatus)) {
        // If it's the highest status then we want to store the message.
        messages.push(unit["agent-status"].info);
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
  const status = machine["agent-status"].status;
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
  const status = unit["agent-status"].status;
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
  @param {Number} value The integer to be checked
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
export const extractCloudName = (tag = "") => {
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
  if (!tag) return "-";
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
export const extractRevisionNumber = (charmName = "") =>
  charmName.split("-").pop();

/**
  Returns a link to the charm icon for the provided charm name.
  @param {String} charmId The fully qualified charm name.
  @returns {String} The link to the charm icon.
*/
export const generateIconPath = (charmId) => {
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
    const charmName = charmId.match(/\/(.+)\/(.+)-\d+/)[2];
    return `https://charmhub.io/${charmName}/icon`;
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
 * @param {Number} wait Time in milliseconds to wait
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

export const isSet = (val) => val || val !== undefined;

export const extractRelationEndpoints = (relation) => {
  const endpoints = {};
  relation.endpoints.forEach((endpoint) => {
    const role = endpoint.relation.role;
    endpoints[role] =
      endpoint["application-name"] + ":" + endpoint.relation.name;
    endpoints[`${role}ApplicationName`] = endpoint["application-name"];
  });
  return endpoints;
};

const ImgWithFallback = ({
  src,
  fallback = defaultCharmIcon,
  alt,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const onError = () => setImgSrc(fallback);

  return (
    <img
      alt={alt}
      src={imgSrc ? imgSrc : fallback}
      onError={onError}
      {...props}
    />
  );
};

export const generateIconImg = (name, charmId) => {
  let iconSrc = defaultCharmIcon;
  if (charmId.indexOf("local:") !== 0) {
    iconSrc = generateIconPath(charmId);
  }
  return (
    <ImgWithFallback
      alt={name + " icon"}
      key={`${name}-${charmId}`}
      title={name}
      width="24"
      height="24"
      className="entity-icon"
      src={iconSrc}
    />
  );
};

export const generateRelationIconImage = (applicationName, applications) => {
  const application = applications[applicationName];
  if (!application || !applicationName) {
    return;
  }
  return generateIconImg(applicationName, application["charm-url"]);
};

export const formatFriendlyDateToNow = (date) => {
  const formattedDate = formatDistanceToNow(parseISO(date));
  return formattedDate.concat(" ago");
};

export const canAdministerModelAccess = (userName, modelUsers) => {
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
