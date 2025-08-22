import { MainTable } from "@canonical/react-components";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";

import ModelActions from "components/ModelActions";
import Status from "components/Status";
import TruncatedTooltip from "components/TruncatedTooltip";
import { getActiveUsers, getControllerData } from "store/juju/selectors";
import type { Controllers, ModelData } from "store/juju/types";
import {
  extractOwnerName,
  getModelStatusGroupData,
} from "store/juju/utils/models";
import { useAppSelector } from "store/store";

import CloudCell from "../CloudCell";
import ModelNameCell from "../ModelNameCell";
import ModelSummary from "../ModelSummary";
import WarningMessage from "../StatusGroup/WarningMessage";
import {
  generateCloudAndRegion,
  generateTableHeaders,
  getControllerName,
  getCredential,
  getLastUpdated,
  getRegion,
} from "../shared";
import { TestId } from "../types";

/**
  Returns the model info and statuses in the proper format for the table data.
  @param  models The list of models
  @return The formatted table rows.
*/
function generateModelTableList(
  models: ModelData[],
  activeUsers: Record<string, string>,
  controllers: Controllers | null,
  groupBy: "status" | "owner" | "cloud",
  groupLabel?: string,
) {
  const modelsList: MainTableRow[] = [];
  models.forEach((model) => {
    const activeUser = activeUsers[model.uuid];
    const { highestStatus } = getModelStatusGroupData(model);
    const owner = model.info ? extractOwnerName(model.info["owner-tag"]) : null;
    const region = getRegion(model);
    const cloud = <CloudCell model={model} />;
    const credential = getCredential(model);
    const controller = getControllerName(model, controllers);
    const lastUpdated = getLastUpdated(model);

    const columns = [
      {
        "data-testid": TestId.COLUMN_NAME,
        content: (
          <>
            <ModelNameCell model={model} />
            {groupBy === "status" && groupLabel === "blocked" ? (
              <WarningMessage model={model} />
            ) : null}
          </>
        ),
      },
      {
        "data-testid": TestId.COLUMN_SUMMARY,
        content: (
          <ModelSummary
            modelData={model}
            ownerTag={model.info?.["owner-tag"]}
          />
        ),
        className: "u-overflow--visible",
      },
      // Conditionally include columns based on the group type
      ...(groupBy !== "owner"
        ? [
            {
              "data-testid": TestId.COLUMN_OWNER,
              content: (
                <TruncatedTooltip message={owner}>{owner}</TruncatedTooltip>
              ),
            },
          ]
        : []),
      ...(groupBy !== "status"
        ? [
            {
              "data-testid": TestId.COLUMN_STATUS,
              content: <Status status={highestStatus} />,
              className: "u-capitalise",
            },
          ]
        : []),
      ...(groupBy === "cloud"
        ? [
            {
              "data-testid": TestId.COLUMN_REGION,
              content: (
                <TruncatedTooltip message={region}>{region}</TruncatedTooltip>
              ),
            },
          ]
        : [
            {
              "data-testid": TestId.COLUMN_CLOUD,
              content: (
                <TruncatedTooltip message={generateCloudAndRegion(model)}>
                  {cloud}
                </TruncatedTooltip>
              ),
            },
          ]),
      {
        "data-testid": TestId.COLUMN_CREDENTIAL,
        content: (
          <TruncatedTooltip message={credential}>{credential}</TruncatedTooltip>
        ),
      },
      {
        "data-testid": TestId.COLUMN_CONTROLLER,
        content: (
          <TruncatedTooltip message={controller}>{controller}</TruncatedTooltip>
        ),
      },
      // We're not currently able to get a last-accessed or updated from JAAS.
      {
        "data-testid": TestId.COLUMN_UPDATED,
        content: (
          <TruncatedTooltip message={lastUpdated}>
            {lastUpdated}
          </TruncatedTooltip>
        ),
        className: "u-align--right lrg-screen-access-cell",
      },
      {
        "data-testid": TestId.COLUMN_ACTIONS,
        content: (
          <ModelActions activeUser={activeUser} modelName={model.model.name} />
        ),
      },
    ];

    const sortData = {
      name: model.model.name,
      ...(groupBy !== "owner" ? { owner } : {}),
      ...(groupBy !== "status" ? { status: highestStatus } : {}),
      ...(groupBy === "cloud" ? { region } : { cloud }),
      credential,
      controller,
      lastUpdated,
    };

    const row = {
      "data-testid": `model-uuid-${model?.uuid}`,
      columns,
      sortData,
    };

    modelsList.push(row);
  });

  return modelsList;
}

type Props = {
  models: ModelData[];
  groupBy: "status" | "owner" | "cloud";
  groupLabel: string;
  emptyStateMessage?: string;
};

export default function ModelTable({
  models,
  groupBy,
  groupLabel,
  emptyStateMessage = "",
}: Props) {
  const activeUsers = useAppSelector(getActiveUsers);
  const controllers = useAppSelector(getControllerData);
  let headerOptions = {};
  if (groupBy === "status") {
    headerOptions = {
      showCloud: true,
      showOwner: true,
      ...(groupLabel === "Blocked" ? { showHeaderStatus: true } : {}),
    };
  } else if (groupBy === "owner") {
    headerOptions = { showCloud: true, showStatus: true };
  } else if (groupBy === "cloud") {
    headerOptions = { showOwner: true, showStatus: true };
  }

  return (
    <MainTable
      headers={generateTableHeaders(groupLabel, models.length, headerOptions)}
      className="p-main-table"
      sortable
      emptyStateMsg={emptyStateMessage}
      rows={generateModelTableList(
        models,
        activeUsers,
        controllers,
        groupBy,
        groupLabel,
      )}
    />
  );
}
