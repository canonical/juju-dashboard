import React from "react";
import { useSelector } from "react-redux";
import MainTable from "@canonical/react-components/dist/components/MainTable";
import {
  generateStatusElement,
  getModelStatusGroupData,
  extractOwnerName
} from "app/utils";
import { getGroupedModelDataByCloud } from "app/selectors";
import { generateModelDetailsLink, getStatusValue } from "./shared";

/**
  Returns the model info and statuses in the proper format for the table data.
  @param {Object} groupedModels The models grouped by state
  @returns {Object} The formatted table data.
*/
function generateModelTableDataByCloud(groupedModels) {
  const modelData = {};
  Object.keys(groupedModels).forEach(owner => {
    modelData[owner] = modelData[owner] || [];
    modelData[owner].push(groupedModels[owner]);
  });
  return modelData;
}

/**
  Generates the table headers for the owner grouped table
  @param {String} owner The title of the table.
  @param {Number} count The number of elements in the status.
  @returns {Array} The headers for the table.
*/
function generateCloudTableHeaders(cloud, count) {
  return [
    {
      content: generateStatusElement(cloud, count, false),
      sortKey: cloud.toLowerCase()
    },
    { content: "Owner", sortKey: "owner" },
    { content: "Status", sortKey: "status" },
    { content: "Configuration", sortKey: "summary" },
    { content: "Region", sortKey: "region" },
    { content: "Credential", sortKey: "credential" },
    { content: "Controller", sortKey: "controller" },
    {
      content: "Last Updated",
      sortKey: "last-updated",
      className: "u-align--right"
    }
  ];
}

export default function CloudGroup({ activeUser }) {
  const groupedModelDataByCloud = useSelector(getGroupedModelDataByCloud);
  const cloudRows = generateModelTableDataByCloud(groupedModelDataByCloud);
  let cloudTables = [];
  let ownerModels = {};
  for (const owner in cloudRows) {
    Object.values(cloudRows[owner]).forEach(modelGroup => {
      ownerModels.rows = [];
      modelGroup.forEach(model => {
        const { highestStatus } = getModelStatusGroupData(model);
        ownerModels.rows.push({
          columns: [
            {
              content: generateModelDetailsLink(
                model.info.name,
                model.info && model.info.ownerTag,
                activeUser
              )
            },
            {
              content: extractOwnerName(model.info.ownerTag)
            },
            {
              content: generateStatusElement(highestStatus),
              className: "u-capitalise"
            },
            {
              content: getStatusValue(model, "summary"),
              className: "u-overflow--visible"
            },
            {
              content: (
                <a href="#_" className="p-link--soft">
                  {getStatusValue(model, "region")}
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

    cloudTables.push(
      <MainTable
        className={"u-table-layout--auto"}
        key={owner}
        headers={generateCloudTableHeaders(owner, ownerModels.rows.length)}
        rows={ownerModels.rows}
      />
    );
  }
  return <div className="cloud-group">{cloudTables}</div>;
}
