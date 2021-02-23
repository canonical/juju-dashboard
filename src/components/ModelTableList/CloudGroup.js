import { useSelector } from "react-redux";
import MainTable from "@canonical/react-components/dist/components/MainTable";
import {
  generateStatusElement,
  getModelStatusGroupData,
  extractOwnerName,
} from "app/utils/utils";
import { getGroupedByCloudAndFilteredModelData } from "app/selectors";
import { generateModelDetailsLink, getStatusValue } from "./shared";

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
  ];
}

export default function CloudGroup({ filters }) {
  const groupedAndFilteredData = useSelector(
    getGroupedByCloudAndFilteredModelData(filters)
  );

  const cloudRows = generateModelTableDataByCloud(groupedAndFilteredData);
  let cloudTables = [];
  let cloudModels = {};
  for (const cloud in cloudRows) {
    Object.values(cloudRows[cloud]).forEach((modelGroup) => {
      cloudModels.rows = [];
      modelGroup.forEach((model) => {
        const { highestStatus } = getModelStatusGroupData(model);
        const owner = extractOwnerName(model.info["owner-tag"]);
        const region = getStatusValue(model, "region");
        const credential = getStatusValue(model.info, "cloud-credential-tag");
        const controller = getStatusValue(model.info, "controllerName");
        const lastUpdated = getStatusValue(model.info, "status.since");
        cloudModels.rows.push({
          "data-test-model-uuid": model?.uuid,
          columns: [
            {
              "data-test-column": "name",
              content: generateModelDetailsLink(
                model.info.name,
                model.info && model.info["owner-tag"],
                model.info.name
              ),
            },
            {
              "data-test-column": "summary",
              content: getStatusValue(model, "summary"),
              className: "u-overflow--visible",
            },
            {
              "data-test-column": "owner",
              content: owner,
            },
            {
              "data-test-column": "status",
              content: generateStatusElement(highestStatus),
              className: "u-capitalise",
            },
            {
              "data-test-column": "region",
              content: region,
            },
            {
              "data-test-column": "credential",
              content: credential,
            },
            {
              "data-test-column": "controller",
              content: controller,
            },
            // We're not currently able to get a last-accessed or updated from JAAS.
            {
              "data-test-column": "updated",
              content: lastUpdated,
              className: "u-align--right",
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
  return <div className="cloud-group u-overflow--scroll">{cloudTables}</div>;
}
