import { MainTable } from "@canonical/react-components";
import useActiveUser from "hooks/useActiveUser";
import { useSelector } from "react-redux";
import { StringParam, useQueryParams, withDefault } from "use-query-params";

import {
  canAdministerModelAccess,
  generateStatusElement,
  getModelStatusGroupData,
} from "app/utils/utils";

import { getGroupedByOwnerAndFilteredModelData } from "app/selectors";

import {
  generateAccessButton,
  generateCloudAndRegion,
  generateCloudCell,
  generateModelDetailsLink,
  getStatusValue,
} from "./shared";

export const TestId = {
  OWNER_GROUP: "owner group",
};

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
      sortKey: "name",
    },
    { content: "", sortKey: "summary" }, // The unit/machines/apps counts
    { content: "Status", sortKey: "status" },
    { content: "Cloud/Region", sortKey: "cloud" },
    { content: "Credential", sortKey: "credential" },
    { content: "Controller", sortKey: "controller" },
    {
      content: "Last Updated",
      sortKey: "lastUpdated",
      className: "u-align--right",
    },
    {
      content: "",
      sortKey: "",
      className: "sm-screen-access-header",
    },
  ];
}

export default function OwnerGroup({ filters }) {
  const groupedAndFilteredData = useSelector(
    getGroupedByOwnerAndFilteredModelData(filters)
  );
  const ownerRows = generateModelTableDataByOwner(groupedAndFilteredData);
  const setPanelQs = useQueryParams({
    model: StringParam,
    panel: withDefault(StringParam, "share-model"),
  })[1];
  const activeUser = useActiveUser();

  let ownerTables = [];
  let ownerModels = {};
  for (const owner in ownerRows) {
    Object.values(ownerRows[owner]).forEach((modelGroup) => {
      ownerModels.rows = [];
      modelGroup.forEach((model) => {
        const { highestStatus } = getModelStatusGroupData(model);
        const cloud = generateCloudCell(model);
        const credential = getStatusValue(model.info, "cloud-credential-tag");
        const controller = getStatusValue(model.info, "controllerName");
        const lastUpdated = getStatusValue(model.info, "status.since")?.slice(
          2
        );
        ownerModels.rows.push({
          "data-testid": `model-uuid-${model?.uuid}`,
          columns: [
            {
              "data-testid": "column-name",
              content: generateModelDetailsLink(
                model.info.name,
                model.info && model.info["owner-tag"],
                model.info.name
              ),
            },
            {
              "data-testid": "column-summary",
              content: getStatusValue(model, "summary"),
              className: "u-overflow--visible",
            },
            {
              "data-testid": "column-status",
              content: generateStatusElement(highestStatus),
              className: "u-capitalise",
            },
            {
              "data-testid": "column-cloud",
              content: cloud,
              className: "u-truncate",
              title: generateCloudAndRegion(model),
            },
            {
              "data-testid": "column-credential",
              content: credential,
            },
            {
              "data-testid": "column-controller",
              content: controller,
            },
            {
              "data-testid": "column-updated",
              content: (
                <>
                  {canAdministerModelAccess(activeUser, model?.info?.users) &&
                    generateAccessButton(setPanelQs, model.info.name)}
                  <span className="model-access-alt">{lastUpdated}</span>
                </>
              ),
              className: `u-align--right lrg-screen-access-cell ${
                canAdministerModelAccess(activeUser, model?.info?.users)
                  ? "has-permission"
                  : ""
              }`,
            },
            {
              content: (
                <>
                  {canAdministerModelAccess(activeUser, model?.info?.users) &&
                    generateAccessButton(setPanelQs, model.info.name)}
                </>
              ),
              className: "sm-screen-access-cell",
            },
          ],
          sortData: {
            name: model.info.name,
            status: highestStatus,
            cloud,
            credential,
            controller,
            lastUpdated,
          },
        });
      });
    });

    ownerTables.push(
      <MainTable
        key={owner}
        headers={generateOwnerTableHeaders(owner, ownerModels.rows.length)}
        rows={ownerModels.rows}
        sortable
        className="p-main-table"
      />
    );
  }
  return (
    <div
      className="owners-group u-overflow--auto"
      data-testid={TestId.OWNER_GROUP}
    >
      {ownerTables}
    </div>
  );
}
