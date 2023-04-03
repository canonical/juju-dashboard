import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { List, MainTable, Tooltip } from "@canonical/react-components";
import { ListItem } from "@canonical/react-components/dist/components/List/List";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";

import { useQueryParams, SetParams } from "hooks/useQueryParams";
import {
  getModelStatusGroupData,
  extractOwnerName,
  canAdministerModelAccess,
  Filters,
  Status,
} from "store/juju/utils/models";
import TruncatedTooltip from "components/TruncatedTooltip";
import { generateStatusElement } from "components/utils";
import {
  getActiveUsers,
  getControllerData,
  getGroupedByStatusAndFilteredModelData,
} from "store/juju/selectors";
import { Controllers, ModelData } from "store/juju/types";
import urls from "urls";

import {
  generateModelDetailsLink,
  getStatusValue,
  generateCloudCell,
  generateCloudAndRegion,
  generateAccessButton,
} from "./shared";

export const TestId = {
  STATUS_GROUP: "status-group",
};

/**
  Generates the table headers for the supplied table label.
  @param label The title of the table.
  @param count The number of elements in the status.
  @returns The headers for the table.
*/
function generateStatusTableHeaders(label: string, count: number) {
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
  @param model The full model data.
  @return The react component for the warning message.
*/
const generateWarningMessage = (model: ModelData) => {
  const { messages } = getModelStatusGroupData(model);
  if (!messages.length) {
    return null;
  }
  const ownerTag = model?.info?.["owner-tag"] ?? "";
  const userName = ownerTag.replace("user-", "");
  const modelName = model.model.name;
  const link = generateModelDetailsLink(
    modelName,
    ownerTag,
    messages[0].message
  );
  const list: ListItem[] = messages.slice(0, 5).map((message) => {
    const unitId = message.unitId ? message.unitId.replace("/", "-") : null;
    const appName = message.appName;
    return {
      className: "u-truncate",
      content: (
        <>
          {unitId || appName}:{" "}
          <Link
            to={
              unitId
                ? urls.model.unit({ userName, modelName, appName, unitId })
                : urls.model.app.index({ userName, modelName, appName })
            }
          >
            {message.message}
          </Link>
        </>
      ),
    };
  });
  const remainder = messages.slice(5);
  if (remainder.length) {
    list.push(`+${remainder.length} more...`);
  }
  return (
    <Tooltip
      positionElementClassName="p-tooltip__position-element--inline"
      tooltipClassName="p-tooltip--constrain-width"
      message={<List className="u-no-margin--bottom" items={list} />}
    >
      <span className="model-table-list_error-message">{link}</span>
    </Tooltip>
  );
};

/**
  Generates the model name cell.
  @param model The model data.
  @param groupLabel The status group the model belongs in.
    e.g. blocked, alert, running
  @returns The React element for the model name cell.
*/
const generateModelNameCell = (model: ModelData, groupLabel: string) => {
  const link = generateModelDetailsLink(
    model.model.name,
    model.info?.["owner-tag"] ?? "",
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
  @param  groupedModels The models grouped by state
  @return The formatted table data.
*/
function generateModelTableDataByStatus(
  groupedModels: Record<Status, ModelData[]>,
  setPanelQs: SetParams<Record<string, unknown>>,
  activeUsers: Record<string, string>,
  controllers: Controllers | null
) {
  const modelData: Record<string, MainTableRow[]> = {
    blockedRows: [],
    alertRows: [],
    runningRows: [],
  };

  Object.keys(groupedModels).forEach((groupLabel) => {
    const models = groupedModels[groupLabel as Status];

    models.forEach((model) => {
      let owner = "";
      if (model.info) {
        owner = extractOwnerName(model.info["owner-tag"]);
      }
      const activeUser = activeUsers[model.uuid];
      const cloud = generateCloudCell(model);
      const credential = getStatusValue(model, "cloud-credential-tag");
      const controller = getStatusValue(model, "controllerName", controllers);
      let lastUpdated = getStatusValue(model, "status.since");
      if (typeof lastUpdated === "string") {
        // .slice(2) here will make the year 2 characters instead of 4
        // e.g. 2021-01-01 becomes 21-01-01
        lastUpdated = lastUpdated.slice(2);
      }
      const row = {
        "data-testid": `model-uuid-${model?.uuid}`,
        columns: [
          {
            "data-testid": "column-name",
            content: generateModelNameCell(model, groupLabel),
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
            content: <>{owner}</>,
          },
          {
            "data-testid": "column-cloud",
            content: (
              <TruncatedTooltip message={generateCloudAndRegion(model)}>
                {cloud}
              </TruncatedTooltip>
            ),
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
      };
      modelData[`${groupLabel}Rows`].push(row);
    });
  });

  return modelData;
}

export default function StatusGroup({ filters }: { filters: Filters }) {
  const groupedAndFilteredData = useSelector(
    getGroupedByStatusAndFilteredModelData(filters)
  );
  const controllers = useSelector(getControllerData);
  const [, setPanelQs] = useQueryParams({
    model: null,
    panel: null,
  });
  const activeUsers = useSelector(getActiveUsers);

  const { blockedRows, alertRows, runningRows } =
    generateModelTableDataByStatus(
      groupedAndFilteredData,
      setPanelQs,
      activeUsers,
      controllers
    );

  const emptyStateMsg = "There are no models with this status";

  return (
    <div
      className="status-group u-overflow--auto"
      data-testid={TestId.STATUS_GROUP}
    >
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
