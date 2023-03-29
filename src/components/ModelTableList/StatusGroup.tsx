import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { List, MainTable, Tooltip } from "@canonical/react-components";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import {
  useQueryParams,
  StringParam,
  withDefault,
  QueryParamConfig,
  SetQuery,
} from "use-query-params";

import {
  getModelStatusGroupData,
  extractOwnerName,
  canAdministerModelAccess,
  Filters,
  Status,
} from "store/juju/utils/models";
import { generateStatusElement } from "components/utils";

import {
  getActiveUsers,
  getGroupedByStatusAndFilteredModelData,
} from "store/juju/selectors";
import { ModelData } from "store/juju/types";

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
  const link = generateModelDetailsLink(
    model.model.name,
    ownerTag,
    messages[0].message
  );
  const modelDetailsPath = `/models/${ownerTag.replace("user-", "")}/${
    model.model.name
  }`;
  const list: ReactNode[] = messages.slice(0, 5).map((message) => (
    <>
      {message.unitId || message.appName}:{" "}
      <Link
        to={[
          modelDetailsPath,
          `app/${message.appName}`,
          message.unitId ? `unit/${message.unitId.replace("/", "-")}` : null,
        ]
          .filter(Boolean)
          .join("/")}
      >
        {message.message}
      </Link>
    </>
  ));
  const remainder = messages.slice(5);
  if (remainder.length) {
    list.push(`+${remainder.length} more...`);
  }
  return (
    <Tooltip
      className="p-tooltip--constrain-width"
      message={<List className="u-no-margin--bottom u-truncate" items={list} />}
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
  setPanelQs: SetQuery<
    Record<
      string,
      QueryParamConfig<string | null | undefined, string | null | undefined>
    >
  >,
  activeUsers: Record<string, string>
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
      const controller = getStatusValue(model, "controllerName");
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
  const setPanelQs = useQueryParams({
    model: StringParam,
    panel: withDefault(StringParam, "share-model"),
  })[1];
  const activeUsers = useSelector(getActiveUsers);

  const { blockedRows, alertRows, runningRows } =
    generateModelTableDataByStatus(
      groupedAndFilteredData,
      setPanelQs,
      activeUsers
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
