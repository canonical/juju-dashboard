import { useSelector } from "react-redux";
import MainTable from "@canonical/react-components/dist/components/MainTable";

import {
  generateStatusElement,
  getModelStatusGroupData,
  extractOwnerName,
} from "app/utils";

import { getGroupedByStatusAndFilteredModelData } from "app/selectors";

import { generateModelDetailsLink, getStatusValue } from "./shared";

/**
  Generates the table headers for the supplied table label.
  @param {String} label The title of the table.
  @param {Number} count The number of elements in the status.
  @returns {Array} The headers for the table.
*/
function generateStatusTableHeaders(label, count) {
  return [
    {
      content: generateStatusElement(label, count),
      sortKey: "name",
    },
    { content: "", sortKey: "summary" }, // The unit/machines/apps counts
    { content: "Owner", sortKey: "owner" },
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

/**
  Generates the warning message for the model name cell.
  @param {Object} model The full model data.
  @param {String} activeUser The active user name.
  @return {Object} The react component for the warning message.
*/
const generateWarningMessage = (model, activeUser) => {
  const { messages } = getModelStatusGroupData(model);
  const title = messages.join("; ");
  const link = generateModelDetailsLink(
    model.model.name,
    model?.info?.ownerTag,
    activeUser,
    title
  );
  return (
    <span className="model-table-list_error-message" title={title}>
      {link}
    </span>
  );
};

/**
  Generates the model name cell.
  @param {Object} model The model data.
  @param {String} groupLabel The status group the model belongs in.
    e.g. blocked, alert, running
  @param {String} activeUser The user tag for the active user.
    e.g. user-foo@external
  @returns {Object} The React element for the model name cell.
*/
const generateModelNameCell = (model, groupLabel, activeUser) => {
  const link = generateModelDetailsLink(
    model.model.name,
    model.info && model.info["owner-tag"],
    activeUser,
    model.model.name
  );
  return (
    <>
      <div>{link}</div>
      {groupLabel === "blocked"
        ? generateWarningMessage(model, activeUser)
        : null}
    </>
  );
};

/**
  Returns the model info and statuses in the proper format for the table data.
  @param {Object} groupedModels The models grouped by state
  @param {String} activeUser The fully qualified user name tag
    e.g. user-foo@external
  @returns {Object} The formatted table data.
*/
function generateModelTableDataByStatus(groupedModels, activeUser) {
  const modelData = {
    blockedRows: [],
    alertRows: [],
    runningRows: [],
  };

  Object.keys(groupedModels).forEach((groupLabel) => {
    const models = groupedModels[groupLabel];
    models.forEach((model) => {
      let owner = "";
      if (model.info) {
        owner = extractOwnerName(model.info["owner-tag"]);
      }
      const cloud = `${getStatusValue(model, "cloud-tag")}/${getStatusValue(
        model,
        "region"
      )}`;
      const credential = getStatusValue(model.info, "cloud-credential-tag");
      const controller = getStatusValue(model.info, "controllerName");
      const lastUpdated = getStatusValue(model.info, "status.since");
      modelData[`${groupLabel}Rows`].push({
        "data-test-model-uuid": model?.uuid,
        columns: [
          {
            "data-test-column": "name",
            content: generateModelNameCell(model, groupLabel, activeUser),
          },
          {
            "data-test-column": "summary",
            content: getStatusValue(model, "summary"),
            className: "u-overflow--visible",
          },
          {
            "data-test-column": "owner",
            content: <>{owner}</>,
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
          name: model.model.name,
          owner,
          cloud,
          credential,
          controller,
          lastUpdated,
        },
      });
    });
  });

  return modelData;
}

export default function StatusGroup({ activeUser, filters }) {
  const groupedAndFilteredData = useSelector(
    getGroupedByStatusAndFilteredModelData(filters)
  );

  const {
    blockedRows,
    alertRows,
    runningRows,
  } = generateModelTableDataByStatus(groupedAndFilteredData, activeUser);

  const emptyStateMsg = "There are no models with this status";

  return (
    <div className="status-group u-overflow--scroll">
      {blockedRows.length ? (
        <MainTable
          headers={generateStatusTableHeaders("Blocked", blockedRows.length)}
          rows={blockedRows}
          sortable
          emptyStateMsg={emptyStateMsg}
        />
      ) : null}
      {alertRows.length ? (
        <MainTable
          headers={generateStatusTableHeaders("Alert", alertRows.length)}
          rows={alertRows}
          sortable
          emptyStateMsg={emptyStateMsg}
        />
      ) : null}
      {runningRows.length ? (
        <MainTable
          headers={generateStatusTableHeaders("Running", runningRows.length)}
          rows={runningRows}
          sortable
          emptyStateMsg={emptyStateMsg}
        />
      ) : null}
    </div>
  );
}
