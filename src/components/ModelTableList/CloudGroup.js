import { useSelector } from "react-redux";
import { MainTable } from "@canonical/react-components";
import { useQueryParams, StringParam, withDefault } from "use-query-params";
import useActiveUsers from "hooks/useActiveUsers";

import {
  getModelStatusGroupData,
  extractOwnerName,
  canAdministerModelAccess,
} from "store/juju/utils/models";
import { generateStatusElement } from "components/utils";

import { getGroupedByCloudAndFilteredModelData } from "store/juju/selectors";

import {
  generateModelDetailsLink,
  getStatusValue,
  generateAccessButton,
} from "./shared";

export const TestId = {
  CLOUD_GROUP: "cloud-group",
};

/**
  Returns the model info and statuses in the proper format for the table data.
  @param {Object} groupedModels The models grouped by state
  @returns {Object} The formatted table data.
*/
function generateModelTableDataByCloud(groupedModels) {
  const modelData = {};
  Object.keys(groupedModels).forEach((cloud) => {
    modelData[cloud] = modelData[cloud] || [];
    modelData[cloud].push(groupedModels[cloud]);
  });
  return modelData;
}

/**
  Generates the table headers for the cloud grouped table
  @param {String} cloud The title of the table.
  @param {Number} count The number of elements in the status.
  @returns {Array} The headers for the table.
*/
function generateCloudTableHeaders(cloud, count) {
  return [
    {
      content: generateStatusElement(cloud, count, false),
      sortKey: "name",
    },
    { content: "", sortKey: "summary" }, // The unit/machines/apps counts
    { content: "Owner", sortKey: "owner" },
    { content: "Status", sortKey: "status" },
    { content: "Region", sortKey: "region" },
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

export default function CloudGroup({ filters }) {
  const activeUsers = useActiveUsers();

  const groupedAndFilteredData = useSelector(
    getGroupedByCloudAndFilteredModelData(filters)
  );

  const setPanelQs = useQueryParams({
    model: StringParam,
    panel: withDefault(StringParam, "share-model"),
  })[1];

  const cloudRows = generateModelTableDataByCloud(groupedAndFilteredData);
  let cloudTables = [];
  let cloudModels = {};
  for (const cloud in cloudRows) {
    Object.values(cloudRows[cloud]).forEach((modelGroup) => {
      cloudModels.rows = [];
      modelGroup.forEach((model) => {
        const activeUser = activeUsers[model.uuid];
        const { highestStatus } = getModelStatusGroupData(model);
        const owner = extractOwnerName(model.info["owner-tag"]);
        const region = getStatusValue(model, "region");
        const credential = getStatusValue(model, "cloud-credential-tag");
        const controller = getStatusValue(model, "controllerName");
        const lastUpdated = getStatusValue(model, "status.since")?.slice(2);
        cloudModels.rows.push({
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
              content: getStatusValue(
                model,
                "summary",
                model.info?.["owner-tag"]
              ),
              className: "u-overflow--visible",
            },
            {
              "data-testid": "column-owner",
              content: owner,
            },
            {
              "data-testid": "column-status",
              content: generateStatusElement(highestStatus),
              className: "u-capitalise",
            },
            {
              "data-testid": "column-region",
              content: region,
            },
            {
              "data-testid": "column-credential",
              content: credential,
            },
            {
              "data-testid": "column-controller",
              content: controller,
            },
            // We're not currently able to get a last-accessed or updated from JAAS.
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
            owner,
            status: highestStatus,
            region,
            credential,
            controller,
            lastUpdated,
          },
        });
      });
    });

    cloudTables.push(
      <MainTable
        key={cloud}
        headers={generateCloudTableHeaders(cloud, cloudModels.rows.length)}
        rows={cloudModels.rows}
        sortable
      />
    );
  }
  return (
    <div
      className="cloud-group u-overflow--auto"
      data-testid={TestId.CLOUD_GROUP}
    >
      {cloudTables}
    </div>
  );
}
