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
        const cloud = `${getStatusValue(model, "region")}/${getStatusValue(
          model,
          "cloud-tag"
        )}`;
        const credential = getStatusValue(model.info, "cloud-credential-tag");
        const controller = getStatusValue(model.info, "controllerName");
        const lastUpdated = getStatusValue(model.info, "status.since");
        ownerModels.rows.push({
          "data-test-model-uuid": model?.uuid,
          columns: [
            {
              "data-test-column": "name",
              content: generateModelDetailsLink(
                model.info.name,
                model.info && model.info["owner-tag"],
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
              content: cloud,
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
      />
    );
  }
  return <div className="owners-group u-overflow--scroll">{ownerTables}</div>;
}
