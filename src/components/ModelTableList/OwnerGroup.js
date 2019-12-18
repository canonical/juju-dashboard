import React from "react";
import { useSelector } from "react-redux";
import MainTable from "@canonical/react-components/dist/components/MainTable";
import { generateStatusElement } from "app/utils";
import { getGroupedModelDataByOwner } from "app/selectors";
import { getStatusValue } from "./shared";

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
  Generates the table headers owner grouped table
  @param {String} label The title of the table.
  @param {Number} count The number of elements in the status.
  @returns {Array} The headers for the table.
*/
function generateOwnerTableHeaders(owner, count) {
  return [
    {
      content: generateStatusElement(owner, count, false),
      sortKey: owner.toLowerCase()
    },
    { content: "Status", sortKey: "statusˇ" },
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

export default function OwnerGroup() {
  const groupedModelDataByOwner = useSelector(getGroupedModelDataByOwner);
  const ownerRows = generateModelTableDataByOwner(groupedModelDataByOwner);
  let ownerTables = [];
  let ownerModels = {};
  for (const owner in ownerRows) {
    Object.values(ownerRows[owner]).forEach(modelGroup => {
      ownerModels.rows = [];
      modelGroup.forEach(model => {
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

    ownerTables.push(
      <MainTable
        className={"u-table-layout--auto"}
        key={owner}
        headers={generateOwnerTableHeaders(owner, ownerModels.rows.length)}
        rows={ownerModels.rows}
      />
    );
  }
  return ownerTables;
}
