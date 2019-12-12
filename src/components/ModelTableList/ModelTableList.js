import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import MainTable from "@canonical/react-components/dist/components/MainTable";
import { useSelector } from "react-redux";
import {
  generateStatusIcon,
  generateSpanClass,
  getModelStatusGroupData,
  stripOwnerTag
} from "app/utils";

import {
  getActiveUserTag,
  getGroupedModelDataByStatus,
  getGroupedModelDataByOwner
} from "app/selectors";

import "./_model-table-list.scss";

/**
  Generates the model details link for the table cell. If no ownerTag can be
  provided then it'll return raw text for the model name.
  @param {String} modelName The name of the model.
  @param {String} ownerTag The ownerTag of the model.
  @param {String} activeUser The ownerTag of the active user.
  @returns {Object} The React component for the link.
*/
const generateModelDetailsLink = (modelName, ownerTag, activeUser) => {
  const modelDetailsPath = `/models/${modelName}`;
  if (ownerTag === activeUser) {
    return <Link to={modelDetailsPath}>{modelName}</Link>;
  }
  // Because we get some data at different times based on the multiple API calls
  // we need to check for their existence and supply reasonable fallbacks if it
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

/**
  Generates the warning message for the model name cell.
  @param {Object} model The full model data.
  @return {Object} The react component for the warning message.
*/
const generateWarningMessage = model => {
  const { messages } = getModelStatusGroupData(model);
  const title = messages.join("; ");
  return (
    <span className="model-table-list_error-message" title={title}>
      {title}
    </span>
  );
};

/**
  Generates the model name cell.
  @param {Object} model The model data.
  @param {String} groupLabel The status group the model belongs in.
    ex) blocked, alert, running
  @param {String} activeUser The user tag for the active user.
    ex) user-foo@external
  @returns {Object} The React element for the model name cell.
*/
const generateModelNameCell = (model, groupLabel, activeUser) => {
  const link = generateModelDetailsLink(
    model.model.name,
    model.info && model.info.ownerTag,
    activeUser
  );
  return (
    <>
      <div>{link}</div>
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
function generateModelTableDataByStatus(groupedModels, activeUser) {
  const modelData = {
    blockedRows: [],
    alertRows: [],
    runningRows: [],
    owners: []
  };

  Object.keys(groupedModels).forEach(groupLabel => {
    const models = groupedModels[groupLabel];
    models.forEach(model => {
      let owner = "";
      if (model.info) {
        owner = stripOwnerTag(model.info.ownerTag);
      }
      modelData[`${groupLabel}Rows`].push({
        columns: [
          { content: generateModelNameCell(model, groupLabel, activeUser) },
          {
            content: (
              <a href="#_" className="p-link--soft">
                {owner}
              </a>
            )
          },
          {
            content: getStatusValue(model, "summary"),
            className: "u-overflow--visible"
          },
          {
            content: (
              <a href="#_" className="p-link--soft">
                {getStatusValue(model, "region")}/
                {getStatusValue(model, "cloudTag")}
              </a>
            )
          },
          {
            content: (
              <a href="#_" className="p-link--soft">
                {getStatusValue(model.info, "cloudCredentialTag")}
              </a>
            )
          },
          // We're not currently able to get the controller name from the API
          // so, display the controller UUID instead.
          {
            content: (
              <a
                href="#_"
                className="p-link--soft"
                title={getStatusValue(model.info, "controllerUuid")}
              >
                {getStatusValue(model.info, "controllerUuid").split("-")[0] +
                  "..."}
              </a>
            )
          },
          // We're not currently able to get a last-accessed or updated from JAAS.
          {
            content: getStatusValue(model.info, "status.since"),
            className: "u-align--right"
          }
        ]
      });
    });
  });

  return modelData;
}

/**
  Returns the model info and statuses in the proper format for the table data.
  @param {Object} groupedModels The models grouped by state
  @returns {Object} The formatted table data.
*/
function generateModelTableDataByOwner(groupedModels) {
  const modelData = {};
  Object.keys(groupedModels).forEach(owner => {
    modelData[owner] = modelData[owner] || [];
    modelData[owner].push(groupedModels[owner]);
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
        const applicationCount = generateSpanClass(
          "model-details__app-icon",
          applicationKeys.length
        );
        const machineCount = generateSpanClass(
          "model-details__machine-icon",
          Object.keys(status.machines).length
        );
        const unitCount = generateSpanClass(
          "model-details__unit-icon",
          applicationKeys.reduce(
            (prev, key) =>
              prev + Object.keys(status.applications[key].units).length,
            0
          )
        );
        returnValue = (
          <Fragment>
            <div className="model-details__config">
              <div className="p-tooltip--top-center" aria-describedby="tp-cntr">
                {applicationCount}
                <span
                  className="p-tooltip__message"
                  role="tooltip"
                  id="tp-cntr"
                >
                  Applications
                </span>
              </div>
              <div className="p-tooltip--top-center" aria-describedby="tp-cntr">
                {unitCount}
                <span
                  className="p-tooltip__message"
                  role="tooltip"
                  id="tp-cntr"
                >
                  Units
                </span>
              </div>
              <div className="p-tooltip--top-center" aria-describedby="tp-cntr">
                {machineCount}
                <span
                  className="p-tooltip__message"
                  role="tooltip"
                  id="tp-cntr"
                >
                  Machines
                </span>
              </div>
            </div>
          </Fragment>
        );
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
        returnValue = status.controllerUuid;
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
  @param {Number} count The number of elements in the status.
  @returns {Array} The headers for the table.
*/
function generateStatusTableHeaders(label, count) {
  return [
    {
      content: generateStatusIcon(label, count),
      sortKey: label.toLowerCase()
    },
    { content: "Owner", sortKey: "owner" },
    { content: "Configuration", sortKey: "summary" },
    { content: "Cloud/Region", sortKey: "cloud" },
    { content: "Credential", sortKey: "credential" },
    { content: "Controller", sortKey: "controller" },
    {
      content: "Last Updated",
      sortKey: "last-updated",
      className: "u-align--right"
    }
  ];
}

function ModelTableList({ groupedBy }) {
  // Even though the activeUser tag is needed many functions deep, because
  // hooks _must_ be called in the same order every time we have to get it here
  // and pass it down through the `generateModelTableData` function as the order
  // of the model data changes frequently and it's guaranteed to almost never be
  // in the same order.
  const activeUser = useSelector(getActiveUserTag);
  const groupedModelDataByStatus = useSelector(getGroupedModelDataByStatus);
  const groupedModelDataByOwner = useSelector(getGroupedModelDataByOwner);
  const {
    blockedRows,
    alertRows,
    runningRows
  } = generateModelTableDataByStatus(groupedModelDataByStatus, activeUser);
  const ownerRows = generateModelTableDataByOwner(groupedModelDataByOwner);

  switch (groupedBy) {
    case "status":
      return (
        <>
          <MainTable
            className={"u-table-layout--auto"}
            headers={generateStatusTableHeaders("Blocked", blockedRows.length)}
            rows={blockedRows}
          />
          <MainTable
            className={"u-table-layout--auto"}
            headers={generateStatusTableHeaders("Alert", alertRows.length)}
            rows={alertRows}
          />
          <MainTable
            className={"u-table-layout--auto"}
            headers={generateStatusTableHeaders("Running", runningRows.length)}
            rows={runningRows}
          />
        </>
      );
    case "owner":
      let ownerTables = [];
      let ownerModels = {};
      for (const owner in ownerRows) {
        Object.values(ownerRows[owner]).map(modelGroup => {
          ownerModels.count = modelGroup.length;
          ownerModels.rows = ownerModels.rows || [];
          modelGroup.map(model => {
            console.log(model);
            ownerModels.rows.push({
              columns: [
                { content: model.info.name },
                { content: model.info.status.status },
                {
                  content: getStatusValue(model, "summary"),
                  className: "u-overflow--visible"
                },
                {
                  content: (
                    <a href="#_" className="p-link--soft">
                      {getStatusValue(model, "region")}/
                      {getStatusValue(model, "cloudTag")}
                    </a>
                  )
                },
                {
                  content: (
                    <a href="#_" className="p-link--soft">
                      {getStatusValue(model.info, "cloudCredentialTag")}
                    </a>
                  )
                },
                // We're not currently able to get the controller name from the API
                // so, display the controller UUID instead.
                {
                  content: (
                    <a
                      href="#_"
                      className="p-link--soft"
                      title={getStatusValue(model.info, "controllerUuid")}
                    >
                      {getStatusValue(model.info, "controllerUuid").split(
                        "-"
                      )[0] + "..."}
                    </a>
                  )
                },
                // We're not currently able to get a last-accessed or updated from JAAS.
                {
                  content: getStatusValue(model.info, "status.since"),
                  className: "u-align--right"
                }
              ]
            });
          });
        });

        ownerTables.push(
          <MainTable
            className={"u-table-layout--auto"}
            key={owner}
            headers={generateStatusTableHeaders(owner, ownerModels.count)}
            rows={ownerModels.rows}
          />
        );
      }
      return ownerTables;

    case "cloud":
      return (
        <>
          <MainTable
            className={"u-table-layout--auto"}
            headers={generateStatusTableHeaders("google", blockedRows.length)}
            rows={blockedRows}
          />
        </>
      );
  }
}

export default ModelTableList;
