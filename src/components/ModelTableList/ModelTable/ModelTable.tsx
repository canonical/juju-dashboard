import { MainTable } from "@canonical/react-components";
import type {
  MainTableCell,
  MainTableRow,
} from "@canonical/react-components/dist/components/MainTable/MainTable";
import classNames from "classnames";
import { useMemo } from "react";
import type { JSX } from "react";

import ModelActions from "components/ModelActions";
import ModelDetailsLink from "components/ModelDetailsLink";
import Status from "components/Status";
import TruncatedTooltip from "components/TruncatedTooltip";
import { getControllerData, getDestructionState } from "store/juju/selectors";
import type { Controllers, DestroyState, ModelData } from "store/juju/types";
import {
  extractOwnerName,
  getModelQualifier,
  getModelStatusGroupData,
} from "store/juju/utils/models";
import { useAppSelector } from "store/store";
import { testId } from "testing/utils";

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
  if (currentGroup === excludedGroup) {
    return columnForExcludedGroup ? [columnForExcludedGroup] : [];
  }
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
  destructionState: DestroyState,
  groupLabel?: string,
): MainTableRow[] {
  const modelsList: MainTableRow[] = [];
  models.forEach((model) => {
    const { highestStatus } = getModelStatusGroupData(model);
    const qualifier = model.info ? getModelQualifier(model.info) : null;
    const owner = qualifier ? extractOwnerName(qualifier) : null;
    const region = getRegion(model);
    const cloud = <CloudCell model={model} />;
    const credential = getCredential(model);
    const controller = getControllerName(model, controllers);
    const lastUpdated = getLastUpdated(model);
    const isDying = model.uuid in destructionState;
    const columns = [
      {
        ...testId(TestId.COLUMN_NAME),
        content: (
          <>
            <div className="model-name-column">
              {isDying ? (
                <span className="model-name-column__status u-truncate">
                  Destroying&hellip;&nbsp;
                </span>
              ) : null}
              <div className="model-name-column__name">
                <TruncatedTooltip message={model.model.name}>
                  <ModelDetailsLink
                    className={classNames({ "u-text--muted": isDying })}
                    modelName={model.model.name}
                    qualifier={qualifier}
                  >
                    {model.model.name}
                  </ModelDetailsLink>
                </TruncatedTooltip>
              </div>
            </div>
            {groupBy === GroupBy.STATUS && groupLabel === "Blocked" ? (
              <WarningMessage model={model} />
            ) : null}
          </>
        ),
      },
      {
        ...testId(TestId.COLUMN_SUMMARY),
        content: <ModelSummary modelData={model} qualifier={qualifier} />,
        className: classNames("u-overflow--visible", {
          "dying-model": isDying,
        }),
      },
      // Conditionally include cells based on the group type
      ...getConditionalCell(GroupBy.OWNER, groupBy, {
        ...testId(TestId.COLUMN_OWNER),
        content: <TruncatedTooltip message={owner}>{owner}</TruncatedTooltip>,
        className: classNames({ "dying-model": isDying }),
      }),
      ...getConditionalCell(GroupBy.STATUS, groupBy, {
        ...testId(TestId.COLUMN_STATUS),
        content: <Status status={highestStatus} />,
        className: classNames("u-capitalise", {
          "dying-model": isDying,
        }),
      }),
      ...getConditionalCell(
        GroupBy.CLOUD,
        groupBy,
        {
          ...testId(TestId.COLUMN_CLOUD),
          content: (
            <TruncatedTooltip message={generateCloudAndRegion(model)}>
              {cloud}
            </TruncatedTooltip>
          ),
          className: classNames({ "dying-model": isDying }),
        },
        {
          ...testId(TestId.COLUMN_REGION),
          content: (
            <TruncatedTooltip message={region}>{region}</TruncatedTooltip>
          ),
          className: classNames({ "dying-model": isDying }),
        },
      ),
      {
        ...testId(TestId.COLUMN_CREDENTIAL),
        content: (
          <TruncatedTooltip message={credential}>{credential}</TruncatedTooltip>
        ),
        className: classNames({ "dying-model": isDying }),
      },
      {
        ...testId(TestId.COLUMN_CONTROLLER),
        content: (
          <TruncatedTooltip message={controller}>{controller}</TruncatedTooltip>
        ),
        className: classNames({ "dying-model": isDying }),
      },
      // We're not currently able to get a last-accessed or updated from JAAS.
      {
        ...testId(TestId.COLUMN_UPDATED),
        content: (
          <TruncatedTooltip message={lastUpdated}>
            {lastUpdated}
          </TruncatedTooltip>
        ),
        className: classNames("u-align--right", "lrg-screen-access-cell", {
          "dying-model": isDying,
        }),
      },
      {
        ...testId(TestId.COLUMN_ACTIONS),
        content: (
          <ModelActions modelUUID={model.uuid} modelName={model.model.name} />
        ),
        className: classNames("u-align--right", {
          "dying-model": isDying,
        }),
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
      ...testId(`model-uuid-${model?.uuid}`),
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
}: Props): JSX.Element {
  const controllers = useAppSelector(getControllerData);
  const destructionState = useAppSelector(getDestructionState);

  const headerOptions = {
    showCloud: [GroupBy.STATUS, GroupBy.OWNER].includes(groupBy),
    showOwner: [GroupBy.STATUS, GroupBy.CLOUD].includes(groupBy),
    showStatus: [GroupBy.OWNER, GroupBy.CLOUD].includes(groupBy),
    ...(groupLabel === "Blocked" && groupBy === GroupBy.STATUS
      ? { showHeaderStatus: true }
      : {}),
  };

  const tableRows = useMemo(
    () =>
      generateModelTableList(
        models,
        controllers,
        groupBy,
        destructionState,
        groupLabel,
      ),
    [models, controllers, groupBy, destructionState, groupLabel],
  );

  return (
    <MainTable
      headers={generateTableHeaders(groupLabel, models.length, headerOptions)}
      className="p-main-table"
      sortable
      emptyStateMsg={emptyStateMessage}
      rows={tableRows}
    />
  );
}
