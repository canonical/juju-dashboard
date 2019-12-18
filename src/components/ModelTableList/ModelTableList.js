import React from "react";

import MainTable from "@canonical/react-components/dist/components/MainTable";
import { useSelector } from "react-redux";
import { generateStatusElement } from "app/utils";

import { getActiveUserTag, getGroupedModelDataByOwner } from "app/selectors";
import { getStatusValue } from "./shared";
import StatusGroup from "./StatusGroup";

import "./_model-table-list.scss";

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

function ModelTableList({ groupedBy }) {
  // Even though the activeUser tag is needed many functions deep, because
  // hooks _must_ be called in the same order every time we have to get it here
  // and pass it down through the `generateModelTableData` function as the order
  // of the model data changes frequently and it's guaranteed to almost never be
  // in the same order.
  const activeUser = useSelector(getActiveUserTag);

  const groupedModelDataByOwner = useSelector(getGroupedModelDataByOwner);

  const ownerRows = generateModelTableDataByOwner(groupedModelDataByOwner);

  switch (groupedBy) {
    case "status":
      return <StatusGroup activeUser={activeUser} />;
    case "owner":
      let ownerTables = [];
      let ownerModels = {};
      for (const owner in ownerRows) {
        Object.values(ownerRows[owner]).map(modelGroup => {
          ownerModels.rows = [];
          modelGroup.map(model => {
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
            headers={generateOwnerTableHeaders(owner, ownerModels.rows.length)}
            rows={ownerModels.rows}
          />
        );
      }
      return ownerTables;

    case "cloud":
      return (
        <>
          <p>@TODO: Group by cloud</p>
        </>
      );
    default:
      return (
        <>
          <p>Sorry, models can be displayed at this time.</p>
        </>
      );
  }
}

export default ModelTableList;
