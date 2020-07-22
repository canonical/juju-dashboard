import React from "react";
import { Link } from "react-router-dom";
import { extractCloudName, extractCredentialName } from "app/utils";

import appsIcon from "static/images/icons/apps-icon.svg";
import unitsIcon from "static/images/icons/units-icon.svg";
import machinesIcon from "static/images/icons/machines-icon.svg";

/**
  Generates the model details link for the table cell. If no ownerTag can be
  provided then it'll return raw text for the model name.
  @param {String} modelName The name of the model.
  @param {String} ownerTag The ownerTag of the model.
  @param {String} activeUser The ownerTag of the active user.
  @param {String} label The contents of the link.
  @returns {Object} The React component for the link.
*/
export function generateModelDetailsLink(
  modelName,
  ownerTag,
  activeUser,
  label
) {
  const modelDetailsPath = `/models/${modelName}`;
  if (ownerTag === activeUser) {
    return <Link to={modelDetailsPath}>{label}</Link>;
  }
  // Because we get some data at different times based on the multiple API calls
  // we need to check for their existence and supply reasonable fallbacks if it
  // isn't available. Once we have a single API call for all the data this check
  // can be removed.
  if (!ownerTag) {
    // We will just return an unclickable name until we get an owner tag as
    // without it we can't create a reliable link.
    return label;
  }
  // If the owner isn't the logged in user then we need to use the
  // fully qualified path name.
  const sharedModelDetailsPath = `/models/${ownerTag.replace(
    "user-",
    ""
  )}/${modelName}`;
  return <Link to={sharedModelDetailsPath}>{label}</Link>;
}

/**
  Used to fetch the values from status as it won't be defined when the
  modelInfo data is.
  @param {Object|undefined} status The status for the model.
  @param {String} key The key to fetch.
  @returns {String} The computed value for the requested field if defined, or
    an empty string.
*/
export function getStatusValue(status, key) {
  let returnValue = "";
  if (typeof status === "object" && status !== null) {
    switch (key) {
      case "summary":
        const applicationKeys = Object.keys(status.applications);
        const applicationCount = applicationKeys.length;
        const machineCount = Object.keys(status.machines).length;
        const unitCount = applicationKeys.reduce(
          (prev, key) =>
            prev + Object.keys(status.applications[key].units).length,
          0
        );

        returnValue = (
          <>
            <div className="u-flex">
              <div
                className="u-flex--block p-tooltip--top-center"
                aria-describedby="tp-cntr"
              >
                <div className="has-icon">
                  <img src={appsIcon} alt="" className="p-icon" />
                  <span>{applicationCount}</span>
                </div>
                <span
                  className="p-tooltip__message"
                  role="tooltip"
                  id="tp-cntr"
                >
                  Applications
                </span>
              </div>
              <div
                className="u-flex--block p-tooltip--top-center"
                aria-describedby="tp-cntr"
              >
                <div className="has-icon">
                  <img src={unitsIcon} alt="" className="p-icon" />
                  <span>{unitCount}</span>
                </div>
                <span
                  className="p-tooltip__message"
                  role="tooltip"
                  id="tp-cntr"
                >
                  Units
                </span>
              </div>
              <div
                className="u-flex--block p-tooltip--top-center"
                aria-describedby="tp-cntr"
              >
                <div className="has-icon">
                  <img src={machinesIcon} alt="" className="p-icon" />
                  <span>{machineCount}</span>
                </div>
                <span
                  className="p-tooltip__message"
                  role="tooltip"
                  id="tp-cntr"
                >
                  Machines
                </span>
              </div>
            </div>
          </>
        );
        break;
      case "cloudTag":
        returnValue = extractCloudName(status.model.cloudTag);
        break;
      case "region":
        returnValue = status.model.region;
        break;
      case "cloudCredentialTag":
        returnValue = extractCredentialName(status.cloudCredentialTag);
        break;
      case "controllerUuid":
        returnValue = status.controllerUuid;
        break;
      case "controllerName":
        returnValue = status.controllerName;
        break;
      case "status.since":
        returnValue = status.status.since.split("T")[0];
        break;
      default:
        console.log(`unsupported status value key: ${key}`);
        break;
    }
  }
  return returnValue;
}
