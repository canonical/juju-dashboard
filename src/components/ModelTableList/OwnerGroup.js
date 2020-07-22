import React from "react";
import { useSelector } from "react-redux";
import MainTable from "@canonical/react-components/dist/components/MainTable";
import { generateStatusElement, getModelStatusGroupData } from "app/utils";
import { getGroupedByOwnerAndFilteredModelData } from "app/selectors";
import { generateModelDetailsLink, getStatusValue } from "./shared";

/**
  Returns the model info and statuses in the proper format for the table data.
  @param {Object} groupedModels The models grouped by state
  @returns {Object} The formatted table data.
*/
function generateModelTableDataByOwner(groupedModels) {
  const modelData = {};
  Object.keys(groupedModels).forEach((owner) => {
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
function generateOwnerTableHeaders(owner, count) {
  return [
    {
      content: generateStatusElement(owner, count, false),
      sortKey: owner.toLowerCase(),
    },
    { content: "", sortKey: "summary" }, // The unit/machines/apps counts
    { content: "Status", sortKey: "statusˇ" },
    { content: "Cloud/Region", sortKey: "cloud" },
    { content: "Credential", sortKey: "credential" },
    { content: "Controller", sortKey: "controller" },
    {
      content: "Last Updated",
      sortKey: "last-updated",
      className: "u-align--right",
    },
  ];
}

export default function OwnerGroup({ activeUser, filters }) {
  const groupedAndFilteredData = useSelector(
    getGroupedByOwnerAndFilteredModelData(filters)
  );
  const ownerRows = generateModelTableDataByOwner(groupedAndFilteredData);
  let ownerTables = [];
  let ownerModels = {};
  for (const owner in ownerRows) {
    Object.values(ownerRows[owner]).forEach((modelGroup) => {
      ownerModels.rows = [];
      modelGroup.forEach((model) => {
        const { highestStatus } = getModelStatusGroupData(model);
        ownerModels.rows.push({
          "data-test-model-uuid": model?.uuid,
          columns: [
            {
              "data-test-column": "name",
              content: generateModelDetailsLink(
                model.info.name,
                model.info && model.info.ownerTag,
                activeUser,
                model.info.name
              ),
            },
            {
              "data-test-column": "summary",
              content: getStatusValue(model, "summary"),
              className: "u-overflow--visible",
            },
            {
              "data-test-column": "status",
              content: generateStatusElement(highestStatus),
              className: "u-capitalise",
            },
            {
              "data-test-column": "cloud",
              content: (
                <a href="#_" className="p-link--soft">
                  {getStatusValue(model, "region")}/
                  {getStatusValue(model, "cloudTag")}
                </a>
              ),
            },
            {
              "data-test-column": "credential",
              content: (
                <a href="#_" className="p-link--soft">
                  {getStatusValue(model.info, "cloudCredentialTag")}
                </a>
              ),
            },
            {
              "data-test-column": "controller",
              content: getStatusValue(model.info, "controllerName"),
            },
            // We're not currently able to get a last-accessed or updated from JAAS.
            {
              "data-test-column": "updated",
              content: getStatusValue(model.info, "status.since"),
              className: "u-align--right",
            },
          ],
        });
      });
    });

    ownerTables.push(
      <MainTable
        key={owner}
        headers={generateOwnerTableHeaders(owner, ownerModels.rows.length)}
        rows={ownerModels.rows}
      />
    );
  }
  return <div className="owners-group u-overflow--scroll">{ownerTables}</div>;
}
