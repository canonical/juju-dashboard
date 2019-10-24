import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { getActiveUserTag, getGroupedModelData } from "app/selectors";
import MainTable from "../MainTable/MainTable";

import "./_table-list.scss";

const generateModelDetailsLink = (modelName, ownerTag, activeUser) => {
  const modelDetailsPath = `/models/${modelName}`;
  if (ownerTag === activeUser) {
    return <Link to={modelDetailsPath}>{modelName}</Link>;
  }
  // Because we get some data at different times based on the multiple API calls
  // we need to check for their existance and supply reasonable fallbacks if it
  // isn't available. Once we have a single API call for all the data this check
  // can be removed.
  if (!ownerTag) {
    // We will just return an unclickable name until we get an owner tag as
    // without it we can't create a reliable link.
    return modelName;
  }
  // If the owner isn't the logged in user then we need to use the
  // fully qualified path name.
  const sharedModelDetailsPath = `/models/${ownerTag.replace(
    "user-",
    ""
  )}/${modelName}`;
  return <Link to={sharedModelDetailsPath}>{modelName}</Link>;
};

const generateWarningMessage = model => {
  // <div className="table-list_error-message">{why}</div>
};

const generateModelNameCell = (model, groupLabel, activeUser) => {
  const link = generateModelDetailsLink(
    model.model.name,
    model.info && model.info.ownerTag,
    activeUser
  );
  return (
    <>
      {link}
      {groupLabel === "blocked" ? generateWarningMessage(model) : null}
    </>
  );
};

/**
  Returns the model info and statuses in the proper format for the table data.
  @param {Object} groupedModels The models grouped by state
  @param {String} activeUser The fully qualified user name tag
    ex) user-foo@external
  @returns {Object} The formatted table data.
*/
function generateModelTableData(groupedModels, activeUser) {
  const modelData = {
    blockedRows: [],
    alertRows: [],
    runningRows: []
  };
  Object.keys(groupedModels).forEach(groupLabel => {
    const models = groupedModels[groupLabel];
    models.forEach(model => {
      modelData[`${groupLabel}Rows`].push({
        columns: [
          { content: generateModelNameCell(model, groupLabel, activeUser) },
          {
            content:
              model.info &&
              model.info.ownerTag.split("@")[0].replace("user-", "")
          },
          { content: getStatusValue(model, "summary") },
          { content: getStatusValue(model, "cloudTag") },
          { content: getStatusValue(model, "region") },
          { content: getStatusValue(model.info, "cloudCredentialTag") },
          // We're not currently able to get the controller name from the API.
          // so display the controller UUID instead.
          { content: getStatusValue(model.info, "controllerUuid") },
          // We're not currently able to get a last-accessed or updated from JAAS.
          { content: getStatusValue(model.info, "status.since") }
        ]
      });
    });
  });
  return modelData;
}

/**
  Used to fetch the values from status as it won't be defined when the
  modelInfo data is.
  @param {Object|undefined} status The status for the model.
  @param {String} key The key to fetch.
  @returns {String} The computed value for the requested field if defined, or
    an empty string.
*/
function getStatusValue(status, key) {
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
        returnValue = applicationCount + "/" + machineCount + "/" + unitCount;
        break;
      case "cloudTag":
        returnValue = status.model.cloudTag.replace("cloud-", "");
        break;
      case "region":
        returnValue = status.model.region;
        break;
      case "cloudCredentialTag":
        returnValue = status.cloudCredentialTag
          .split("cloudcred-")[1]
          .split("@")[1]
          .split("_")[1];
        break;
      case "controllerUuid":
        returnValue = status.controllerUuid.split("-")[0] + "...";
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

/**
  Generates the table headers for the supplied table label.
  @param {String} label The title of the table.
  @returns {Array} The headers for the table.
*/
function generateTableHeaders(label) {
  return [
    { content: label, sortKey: label.toLowerCase() },
    { content: "Owner", sortKey: "owner" },
    { content: "Apps/Machines/Units", sortKey: "summary" },
    { content: "Cloud", sortKey: "cloud" },
    { content: "Region", sortKey: "region" },
    { content: "Credential", sortKey: "credential" },
    { content: "Controller", sortKey: "controller" },
    { content: "Last Updated", sortKey: "last-updated" }
  ];
}

function TableList() {
  const activeUser = useSelector(getActiveUserTag);
  const groupedModelData = useSelector(getGroupedModelData);
  const { blockedRows, alertRows, runningRows } = generateModelTableData(
    groupedModelData,
    activeUser
  );

  return (
    <>
      <MainTable
        className={"u-table-layout--auto"}
        headers={generateTableHeaders("Blocked")}
        rows={blockedRows}
      />
      <MainTable
        className={"u-table-layout--auto"}
        headers={generateTableHeaders("Alert")}
        rows={alertRows}
      />
      <MainTable
        className={"u-table-layout--auto"}
        headers={generateTableHeaders("Running")}
        rows={runningRows}
      />
    </>
  );
}

export default TableList;
