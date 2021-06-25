import { useSelector } from "react-redux";
import MainTable from "@canonical/react-components/dist/components/MainTable";
import { useQueryParams, StringParam, withDefault } from "use-query-params";
import useActiveUser from "hooks/useActiveUser";

import {
  generateStatusElement,
  getModelStatusGroupData,
  extractOwnerName,
  canAdministerModelAccess,
} from "app/utils/utils";

import { getGroupedByStatusAndFilteredModelData } from "app/selectors";

import {
  generateModelDetailsLink,
  getStatusValue,
  generateCloudCell,
  generateCloudAndRegion,
  generateAccessButton,
} from "./shared";

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
    {
      content: "",
      sortKey: "",
      className: "sm-screen-access-header",
    },
  ];
}

/**
  Generates the warning message for the model name cell.
  @param {Object} model The full model data.
  @return {Object} The react component for the warning message.
*/
const generateWarningMessage = (model) => {
  const { messages } = getModelStatusGroupData(model);
  const title = messages.join("; ");
  const link = generateModelDetailsLink(
    model.model.name,
    model?.info?.ownerTag,
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
  @returns {Object} The React element for the model name cell.
*/
const generateModelNameCell = (model, groupLabel) => {
  const link = generateModelDetailsLink(
    model.model.name,
    model.info && model.info["owner-tag"],
    model.model.name
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
  @returns {Object} The formatted table data.
*/
function generateModelTableDataByStatus(groupedModels, setPanelQs, activeUser) {
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
      const cloud = generateCloudCell(model);
      const credential = getStatusValue(model.info, "cloud-credential-tag");
      const controller = getStatusValue(model.info, "controllerName");
      // .slice(2) here will make the year 2 characters instead of 4
      // e.g. 2021-01-01 becomes 21-01-01
      const lastUpdated = getStatusValue(model.info, "status.since")?.slice(2);
      modelData[`${groupLabel}Rows`].push({
        "data-test-model-uuid": model?.uuid,
        columns: [
          {
            "data-test-column": "name",
            content: generateModelNameCell(model, groupLabel),
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
            className: "u-truncate",
            title: generateCloudAndRegion(model),
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
            content: (
              <>
                {canAdministerModelAccess(activeUser, model?.info?.users) &&
                  generateAccessButton(setPanelQs, model.model.name)}
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
                  generateAccessButton(setPanelQs, model.model.name)}
              </>
            ),
            className: "sm-screen-access-cell",
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

export default function StatusGroup({ filters }) {
  const groupedAndFilteredData = useSelector(
    getGroupedByStatusAndFilteredModelData(filters)
  );
  const setPanelQs = useQueryParams({
    model: StringParam,
    panel: withDefault(StringParam, "share-model"),
  })[1];
  const activeUser = useActiveUser();

  const { blockedRows, alertRows, runningRows } =
    generateModelTableDataByStatus(
      groupedAndFilteredData,
      setPanelQs,
      activeUser
    );

  const emptyStateMsg = "There are no models with this status";

  return (
    <div className="status-group u-overflow--scroll">
      {blockedRows.length ? (
        <MainTable
          headers={generateStatusTableHeaders("Blocked", blockedRows.length)}
          rows={blockedRows}
          sortable
          emptyStateMsg={emptyStateMsg}
          className="p-main-table"
        />
      ) : null}
      {alertRows.length ? (
        <MainTable
          headers={generateStatusTableHeaders("Alert", alertRows.length)}
          rows={alertRows}
          sortable
          emptyStateMsg={emptyStateMsg}
          className="p-main-table"
        />
      ) : null}
      {runningRows.length ? (
        <MainTable
          headers={generateStatusTableHeaders("Running", runningRows.length)}
          rows={runningRows}
          sortable
          emptyStateMsg={emptyStateMsg}
          className="p-main-table"
        />
      ) : null}
    </div>
  );
}
