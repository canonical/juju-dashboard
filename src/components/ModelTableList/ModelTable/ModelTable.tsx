import { MainTable } from "@canonical/react-components";
import type {
  MainTableCell,
  MainTableRow,
} from "@canonical/react-components/dist/components/MainTable/MainTable";

import ModelActions from "components/ModelActions";
import ModelDetailsLink from "components/ModelDetailsLink";
import Status from "components/Status";
import TruncatedTooltip from "components/TruncatedTooltip";
import { getControllerData } from "store/juju/selectors";
import type { Controllers, ModelData } from "store/juju/types";
import {
  extractOwnerName,
  getModelStatusGroupData,
} from "store/juju/utils/models";
import { useAppSelector } from "store/store";

import CloudCell from "../CloudCell";
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
import { GroupBy, TestId } from "../types";

const getConditionalCell = (
  excludedGroup: GroupBy,
  currentGroup: GroupBy,
  column: MainTableCell,
  columnForExcludedGroup?: MainTableCell,
): MainTableCell[] => {
  if (currentGroup === excludedGroup)
    return columnForExcludedGroup ? [columnForExcludedGroup] : [];
  return [column];
};

/**
  Returns the model info and statuses in the proper format for the table data.
  @param  models The list of models
  @return The formatted table rows.
*/
function generateModelTableList(
  models: ModelData[],
  controllers: Controllers | null,
  groupBy: GroupBy,
  groupLabel?: string,
) {
  const modelsList: MainTableRow[] = [];
  models.forEach((model) => {
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
            <TruncatedTooltip message={model.model.name}>
              <ModelDetailsLink
                modelName={model.model.name}
                ownerTag={model.info?.["owner-tag"]}
              >
                {model.model.name}
              </ModelDetailsLink>
            </TruncatedTooltip>
            {groupBy === GroupBy.STATUS && groupLabel === "Blocked" ? (
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
      // Conditionally include cells based on the group type
      ...getConditionalCell(GroupBy.OWNER, groupBy, {
        "data-testid": TestId.COLUMN_OWNER,
        content: <TruncatedTooltip message={owner}>{owner}</TruncatedTooltip>,
      }),
      ...getConditionalCell(GroupBy.STATUS, groupBy, {
        "data-testid": TestId.COLUMN_STATUS,
        content: <Status status={highestStatus} />,
        className: "u-capitalise",
      }),
      ...getConditionalCell(
        GroupBy.CLOUD,
        groupBy,
        {
          "data-testid": TestId.COLUMN_CLOUD,
          content: (
            <TruncatedTooltip message={generateCloudAndRegion(model)}>
              {cloud}
            </TruncatedTooltip>
          ),
        },
        {
          "data-testid": TestId.COLUMN_REGION,
          content: (
            <TruncatedTooltip message={region}>{region}</TruncatedTooltip>
          ),
        },
      ),
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
          <ModelActions modelUUID={model.uuid} modelName={model.model.name} />
        ),
        className: "u-align--right",
      },
    ];

    const sortData = {
      name: model.model.name,
      ...(groupBy !== GroupBy.OWNER ? { owner } : {}),
      ...(groupBy !== GroupBy.STATUS ? { status: highestStatus } : {}),
      ...(groupBy === GroupBy.CLOUD ? { region } : { cloud }),
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
  groupBy: GroupBy;
  groupLabel: string;
  emptyStateMessage?: string;
};

export default function ModelTable({
  models,
  groupBy,
  groupLabel,
  emptyStateMessage = "",
}: Props) {
  const controllers = useAppSelector(getControllerData);
  const headerOptions = {
    showCloud: [GroupBy.STATUS, GroupBy.OWNER].includes(groupBy),
    showOwner: [GroupBy.STATUS, GroupBy.CLOUD].includes(groupBy),
    showStatus: [GroupBy.OWNER, GroupBy.CLOUD].includes(groupBy),
    ...(groupLabel === "Blocked" && groupBy === GroupBy.STATUS
      ? { showHeaderStatus: true }
      : {}),
  };

  return (
    <MainTable
      headers={generateTableHeaders(groupLabel, models.length, headerOptions)}
      className="p-main-table"
      sortable
      emptyStateMsg={emptyStateMessage}
      rows={generateModelTableList(models, controllers, groupBy, groupLabel)}
    />
  );
}
