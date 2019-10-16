import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import MainTable from "../MainTable/MainTable";

import "./_table-list.scss";
/**
  Returns the model info and statuses in the proper format for the table data.
  @param {Object} state The application state.
  @returns {Object} The formatted table data.
*/
function generateModelTableData(state) {
  const models = state.juju.models;
  const modelInfo = state.juju.modelInfo;
  const modelData = {
    blockedModelData: [],
    attentionModelData: [],
    runningModelData: []
  };
  Object.keys(models).forEach(modelUUID => {
    const modelListData = models[modelUUID];
    const modelInfoData = modelInfo[modelUUID];
    const modelStatus = state.juju.modelStatuses[modelUUID];
    const modelDetailsPath = `/models/${modelListData.name}`;
    const generateModelDetailsLink = () => {
      const owner = modelListData.ownerTag;
      const user = state.root.controllerConnection.info.user.identity;
      if (owner === user) {
        return <Link to={modelDetailsPath}>{modelListData.name}</Link>;
      }
      // If the owner isn't the logged in user then we need to use the
      // fully qualified path name.
      const sharedModelDetailsPath = `/models/${owner.replace("user-", "")}/${
        modelListData.name
      }`;
      return <Link to={sharedModelDetailsPath}>{modelListData.name}</Link>;
    };
    const generateModelNameCell = why => {
      const link = generateModelDetailsLink();
      return (
        <>
          {link}
          <div className="table-list_error-message">{why}</div>
        </>
      );
    };
    const { status, why } = determineModelStatus(modelStatus);
    modelData[status].push({
      columns: [
        { content: generateModelNameCell(why) },
        { content: modelListData.ownerTag.split("@")[0].replace("user-", "") },
        { content: getStatusValue(modelStatus, "summary") },
        { content: getStatusValue(modelStatus, "cloudTag") },
        { content: getStatusValue(modelStatus, "region") },
        { content: getStatusValue(modelInfoData, "cloudCredentialTag") },
        // We're not currently able to get the controller name from the API.
        // so display the controller UUID instead.
        { content: getStatusValue(modelInfoData, "controllerUuid") },
        // We're not currently able to get a last-accessed or updated from JAAS.
        { content: getStatusValue(modelInfoData, "status.since") }
      ]
    });
  });
  return modelData;
}

/**
  Uses the model status to determine what the status of the model is and then
  returns the string value of the table it's to be displayed in.
  @param {Object} modelStatus The model status.
  @returns {String} The status table for it to be displayed in.
*/
function determineModelStatus(modelStatus) {
  if (!modelStatus) {
    return { status: "runningModelData", why: "" };
  }
  const badStatuses = ["lost"];
  let status = "runningModelData";
  let why = "";
  // Short circuit the loop. If something is in error then the model is in error.
  // Grab the first error message and display that.
  Object.values(modelStatus.applications).some(app => {
    Object.values(app.units).some(unit => {
      if (badStatuses.includes(unit.agentStatus.status)) {
        status = "blockedModelData";
        why = unit.agentStatus.info;
        return true;
      }
    });
  });
  return { status, why };
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
  const {
    blockedModelData,
    attentionModelData,
    runningModelData
  } = useSelector(generateModelTableData);
  return (
    <>
      <MainTable
        className={"u-table-layout--auto"}
        headers={generateTableHeaders("Blocked")}
        rows={blockedModelData}
      />
      <MainTable
        className={"u-table-layout--auto"}
        headers={generateTableHeaders("Attention")}
        rows={attentionModelData}
      />
      <MainTable
        className={"u-table-layout--auto"}
        headers={generateTableHeaders("Running")}
        rows={runningModelData}
      />
    </>
  );
}

export default TableList;
