import { MainTable } from "@canonical/react-components";
import type {
  MainTableCell,
  MainTableRow,
} from "@canonical/react-components/dist/components/MainTable/MainTable";
import { useEffect } from "react";
import reactHotToast from "react-hot-toast";
import { useDispatch } from "react-redux";

import ModelActions from "components/ModelActions";
import Status from "components/Status";
import ToastCard from "components/ToastCard";
import type { ToastInstance } from "components/ToastCard";
import TruncatedTooltip from "components/TruncatedTooltip";
import { getWSControllerURL } from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import {
  getActiveUsers,
  getControllerData,
  getMigrationState,
} from "store/juju/selectors";
import type { Controllers, MigrationState, ModelData } from "store/juju/types";
import {
  extractOwnerName,
  getModelStatusGroupData,
} from "store/juju/utils/models";
import { useAppSelector } from "store/store";

import CloudCell from "../CloudCell";
import ModelNameCell from "../ModelNameCell";
import ModelSummary from "../ModelSummary";
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
  activeUsers: Record<string, string>,
  controllers: Controllers | null,
  groupBy: GroupBy,
  migrationState: MigrationState,
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
    const { loading, loaded } = migrationState[model.uuid] ?? {};

    const columns = [
      {
        "data-testid": TestId.COLUMN_NAME,
        content: (
          <ModelNameCell
            loading={loading && !loaded}
            model={model}
            groupBy={groupBy}
            groupLabel={groupLabel}
          />
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
          <ModelActions
            activeUser={activeUser}
            modelUUID={model?.uuid}
            modelName={model.model.name}
          />
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
  const activeUsers = useAppSelector(getActiveUsers);
  const controllers = useAppSelector(getControllerData);
  const migrationState = useAppSelector(getMigrationState);
  const wsControllerURL = useAppSelector(getWSControllerURL) ?? "";
  const dispatch = useDispatch();
  const headerOptions = {
    showCloud: [GroupBy.STATUS, GroupBy.OWNER].includes(groupBy),
    showOwner: [GroupBy.STATUS, GroupBy.CLOUD].includes(groupBy),
    showStatus: [GroupBy.OWNER, GroupBy.CLOUD].includes(groupBy),
    ...(groupLabel === "Blocked" && groupBy === GroupBy.STATUS
      ? { showHeaderStatus: true }
      : {}),
  };

  useEffect(() => {
    Object.entries(migrationState).forEach(([uuid, status]) => {
      // Check if the migration has completed and is not in a loading state.
      // The `status.loaded` check is key.
      if (status.loaded && !status.loading) {
        // Handle a successful migration
        if (status.results?.["migration-id"]) {
          reactHotToast.custom((toast: ToastInstance) => (
            <ToastCard type="positive" toastInstance={toast}>
              Model migration completed for {uuid} successfully
            </ToastCard>
          ));
        }
        // Handle a failed migration
        else if (status.errors) {
          reactHotToast.custom((toast: ToastInstance) => (
            <ToastCard type="negative" toastInstance={toast}>
              {typeof status.errors === "string"
                ? status.errors
                : "Unable to upgrade model"}
            </ToastCard>
          ));
        }

        // Dispatch the clear action to remove this entry from the state.
        // This prevents the useEffect from re-running for this item.
        dispatch(
          jujuActions.clearModelMigration({
            modelUUID: uuid,
            wsControllerURL,
          }),
        );
      }
    });

    // The dependencies are just the state and dispatch
    // since `Object.entries` creates a new array on each render
  }, [migrationState, wsControllerURL, dispatch]);

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
        migrationState,
        groupLabel,
      )}
    />
  );
}
