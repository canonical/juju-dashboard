import { MainTable } from "@canonical/react-components";
import type {
  MainTableCell,
  MainTableRow,
} from "@canonical/react-components/dist/components/MainTable/MainTable";
import { useEffect } from "react";
import type { JSX } from "react";
import reactHotToast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Link } from "react-router";

import ModelActions from "components/ModelActions";
import ModelDetailsLink from "components/ModelDetailsLink";
import Status from "components/Status";
import ToastCard from "components/ToastCard";
import type { ToastInstance } from "components/ToastCard";
import TruncatedTooltip from "components/TruncatedTooltip";
import { getWSControllerURL } from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import {
  getControllerData,
  getDestructionState,
  getModelList,
} from "store/juju/selectors";
import type { Controllers, DestroyState, ModelData } from "store/juju/types";
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
    const owner = model.info ? extractOwnerName(model.info["owner-tag"]) : null;
    const region = getRegion(model);
    const cloud = <CloudCell model={model} />;
    const credential = getCredential(model);
    const controller = getControllerName(model, controllers);
    const lastUpdated = getLastUpdated(model);
    const isDying = Object.keys(destructionState).includes(model.uuid);

    const columns = [
      {
        "data-testid": TestId.COLUMN_NAME,
        content: (
          <div className="model-name">
            {isDying ? "Destroying... " : ""}
            <TruncatedTooltip
              message={model.model.name}
              className={isDying ? "dying-model" : ""}
            >
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
          </div>
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
        className: `u-overflow--visible ${isDying ? "dying-model" : ""}`,
      },
      // Conditionally include cells based on the group type
      ...getConditionalCell(GroupBy.OWNER, groupBy, {
        "data-testid": TestId.COLUMN_OWNER,
        content: <TruncatedTooltip message={owner}>{owner}</TruncatedTooltip>,
        className: isDying ? "dying-model" : "",
      }),
      ...getConditionalCell(GroupBy.STATUS, groupBy, {
        "data-testid": TestId.COLUMN_STATUS,
        content: <Status status={highestStatus} />,
        className: `u-capitalise ${isDying ? "dying-model" : ""}`,
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
          className: isDying ? "dying-model" : "",
        },
        {
          "data-testid": TestId.COLUMN_REGION,
          content: (
            <TruncatedTooltip message={region}>{region}</TruncatedTooltip>
          ),
          className: isDying ? "dying-model" : "",
        },
      ),
      {
        "data-testid": TestId.COLUMN_CREDENTIAL,
        content: (
          <TruncatedTooltip message={credential}>{credential}</TruncatedTooltip>
        ),
        className: isDying ? "dying-model" : "",
      },
      {
        "data-testid": TestId.COLUMN_CONTROLLER,
        content: (
          <TruncatedTooltip message={controller}>{controller}</TruncatedTooltip>
        ),
        className: isDying ? "dying-model" : "",
      },
      // We're not currently able to get a last-accessed or updated from JAAS.
      {
        "data-testid": TestId.COLUMN_UPDATED,
        content: (
          <TruncatedTooltip message={lastUpdated}>
            {lastUpdated}
          </TruncatedTooltip>
        ),
        className: `u-align--right lrg-screen-access-cell ${isDying ? "dying-model" : ""}`,
      },
      {
        "data-testid": TestId.COLUMN_ACTIONS,
        content: (
          <ModelActions modelUUID={model.uuid} modelName={model.model.name} />
        ),
        className: `u-align--right ${isDying ? "dying-model" : ""}`,
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
}: Props): JSX.Element {
  const controllers = useAppSelector(getControllerData);
  const modelsList = useAppSelector(getModelList);
  const destructionState = useAppSelector(getDestructionState);
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
    Object.entries(destructionState).forEach(([modelUUID, status]) => {
      // Check if the destruction is in a loading state.
      if (status.loading) {
        // Handle an initiated destruction
        reactHotToast.custom((toast: ToastInstance) => (
          <ToastCard type="info" toastInstance={toast}>
            <b>Destroying model "{modelUUID}"...</b>
          </ToastCard>
        ));
      } else if (
        status.loaded &&
        status.errors === null &&
        !Object.keys(modelsList).includes(modelUUID)
      ) {
        // Handle a successful destruction
        reactHotToast.custom((toast: ToastInstance) => (
          <ToastCard type="positive" toastInstance={toast}>
            <b>Model "{modelUUID}" destroyed successfully</b>
          </ToastCard>
        ));

        // Dispatch the clear action to remove this entry from the state.
        // This prevents the useEffect from re-running for this item.
        dispatch(
          jujuActions.clearDestroyedModel({
            modelUUID,
            wsControllerURL,
          }),
        );
      }

      if (status.errors) {
        // Handle a failed destruction
        reactHotToast.custom((toast: ToastInstance) => (
          <ToastCard type="negative" toastInstance={toast}>
            <b>Destroying model "{modelUUID}" failed</b>
            <div>
              Retry or consult{" "}
              <Link
                to="https://documentation.ubuntu.com/juju/3.6/reference/juju-cli/list-of-juju-cli-commands/destroy-model/"
                target="_blank"
              >
                documentation
              </Link>
            </div>
          </ToastCard>
        ));

        // Dispatch the clear action to remove this entry from the state.
        // This prevents the useEffect from re-running for this item.
        dispatch(
          jujuActions.clearDestroyedModel({
            modelUUID,
            wsControllerURL,
          }),
        );
      }
    });
  }, [destructionState, wsControllerURL, modelsList, dispatch]);

  return (
    <MainTable
      headers={generateTableHeaders(groupLabel, models.length, headerOptions)}
      className="p-main-table"
      sortable
      emptyStateMsg={emptyStateMessage}
      rows={generateModelTableList(
        models,
        controllers,
        groupBy,
        destructionState,
        groupLabel,
      )}
    />
  );
}
