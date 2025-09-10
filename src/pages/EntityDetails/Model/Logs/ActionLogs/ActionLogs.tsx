import type {
  ActionResult,
  OperationResult,
} from "@canonical/jujulib/dist/api/facades/action/ActionV7";
import {
  Button,
  ContextualMenu,
  Icon,
  ModularTable,
  usePortal,
} from "@canonical/react-components";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import type { Row } from "react-table";

import FadeIn from "animations/FadeIn";
import CharmIcon from "components/CharmIcon/CharmIcon";
import LoadingSpinner from "components/LoadingSpinner/LoadingSpinner";
import RelativeDate from "components/RelativeDate";
import type { EntityDetailsRoute } from "components/Routes";
import Status from "components/Status";
import useInlineErrors from "hooks/useInlineErrors";
import { useQueryActionsList, useQueryOperationsList } from "juju/api-hooks";
import PanelInlineErrors from "panels/PanelInlineErrors";
import { getModelStatus, getModelUUID } from "store/juju/selectors";
import type { ModelData } from "store/juju/types";
import { useAppSelector } from "store/store";
import urls from "urls";
import { logger } from "utils/logger";

import ActionPayloadModal from "./ActionPayloadModal";
import { Label, Output } from "./types";

type Operations = OperationResult[];
type Actions = ActionResult[];

type TableRows = TableRow[];

type RowCells = {
  application: ReactNode;
  completed?: ReactNode;
  id: string;
  message: ReactNode;
  sortData: {
    application: string;
    completed?: number;
    message?: string;
    status: string;
  };
  status: ReactNode;
};

type TableRow = RowCells & {
  subRows: RowCells[];
};

type ApplicationData = {
  charm: string;
};

enum InlineErrors {
  FETCH = "fetch",
}

function generateAppIcon(
  application: ApplicationData | undefined,
  appName: string,
  userName: string | null = null,
  modelName: string | null = null,
) {
  // If the user has executed actions with an application and then removed
  // that application it'll no longer be in the model data so in this
  // case we need to fail gracefully.
  if (
    application &&
    userName !== null &&
    userName &&
    modelName !== null &&
    modelName
  ) {
    return (
      <>
        <CharmIcon name={appName} charmId={application.charm} />
        <Link to={urls.model.app.index({ userName, modelName, appName })}>
          {appName}
        </Link>
      </>
    );
  }
  return <>{appName}</>;
}

const compare = (numA: string | number, numB: string | number) =>
  numA === numB ? 0 : numA > numB ? 1 : -1;

const tableSort = (column: string, rowA: Row<RowCells>, rowB: Row<RowCells>) =>
  column in rowA.original.sortData && column in rowB.original.sortData
    ? compare(rowA.original.sortData.status, rowB.original.sortData.status)
    : 0;

const generateApplicationRow = (
  actionData: ActionResult,
  operationData: OperationResult,
  modelStatusData: ModelData | null,
  userName: string,
  modelName: string,
): TableRow | null => {
  // The action name is being defined like this because the action name is
  // only contained in the actions array and not on the operation level.
  // Even though at the current time an operation is the same action
  // performed across multiple units of the same application. I expect
  // that the CLI may gain this functionality in the future and we'll have
  // to update this code to display the correct action name.
  const actionName = actionData.action?.name;
  const [_name, operationId] = operationData.operation.split("-");
  // The receiver is in the format "unit-ceph-mon-0" to "ceph-mon"
  const parts = actionData.action?.receiver.match(/unit-(.+)-\d+/);
  const appName = (parts && parts[1]) ?? null;
  if (appName === null || !appName) {
    // Not shown in UI. Logged for debugging purposes.
    logger.error(
      "Unable to parse action receiver",
      actionData.action?.receiver,
    );
    return null;
  }
  return {
    application: generateAppIcon(
      modelStatusData?.applications[appName],
      appName,
      userName,
      modelName,
    ),
    id: `${operationId}/${actionName}`,
    message: "",
    sortData: {
      application: appName,
      status: actionData?.status ?? "",
    },
    status: <Status status={actionData.status} useIcon actionsLogs />,
    subRows: [],
  };
};

export default function ActionLogs() {
  const [operations, setOperations] = useState<Operations>([]);
  const [actions, setActions] = useState<Actions>([]);
  const [fetchedOperations, setFetchedOperations] = useState(false);
  const [modalDetails, setModalDetails] = useState<
    ActionResult["output"] | null
  >(null);
  const [inlineErrors, setInlineErrors] = useInlineErrors({
    [InlineErrors.FETCH]: (error) => (
      <>
        {error} Try{" "}
        <Button appearance="link" onClick={() => fetchData()}>
          refetching
        </Button>{" "}
        the action logs data.
      </>
    ),
  });
  const { userName = null, modelName = null } = useParams<EntityDetailsRoute>();
  const [selectedOutput, setSelectedOutput] = useState<{
    [key: string]: Output;
  }>({});
  const queryOperationsList = useQueryOperationsList(userName, modelName);
  const queryActionsList = useQueryActionsList(userName, modelName);
  const modelUUID = useAppSelector((state) => getModelUUID(state, modelName));
  const modelStatusData = useAppSelector((state) =>
    getModelStatus(state, modelUUID),
  );

  const applicationList = Object.keys(modelStatusData?.applications ?? {});

  const fetchData = useCallback(async () => {
    try {
      if (modelUUID !== null && modelUUID) {
        const operationList = await queryOperationsList({
          applications: applicationList,
        });
        if (operationList?.results) {
          setOperations(operationList.results);
          const actionsTags = operationList.results
            .flatMap((operation: OperationResult) =>
              operation.actions?.map((action) => action.action?.tag),
            )
            .filter((actionTag?: string): actionTag is string =>
              Boolean(actionTag),
            )
            .map((actionTag: string) => ({ tag: actionTag }));
          const actionsList = await queryActionsList({ entities: actionsTags });
          if (actionsList?.results) {
            setActions(actionsList.results);
          }
        }
      }
      setInlineErrors(InlineErrors.FETCH, null);
    } catch (error) {
      setInlineErrors(InlineErrors.FETCH, Label.FETCH_ERROR);
      logger.error(Label.FETCH_ERROR, error);
    } finally {
      setFetchedOperations(true);
    }
  }, [
    applicationList,
    modelUUID,
    queryActionsList,
    queryOperationsList,
    setInlineErrors,
  ]);

  useEffect(() => {
    void fetchData();
    // XXX Temporarily disabled.
    // Used to stop it re-requesting every time state changes.
    // appStore and applicationList removed from dependency graph
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelUUID]);

  const tableData = useMemo<Record<string, unknown>[]>(() => {
    const handleOutputSelect = (actionTag: string, output: Output) => {
      setSelectedOutput((previousSelected) => ({
        ...previousSelected,
        [actionTag]: output,
      }));
    };

    const rows: TableRows = [];
    operations?.forEach((operationData) => {
      const operationActions = operationData.actions ?? [];
      if (
        !operationActions?.length ||
        userName === null ||
        !userName ||
        modelName === null ||
        !modelName
      ) {
        return;
      }
      // Retrieve the application details from the first action:
      const applicationRow = generateApplicationRow(
        operationActions[0],
        operationData,
        modelStatusData,
        userName,
        modelName,
      );
      if (!applicationRow) {
        return;
      }
      operationActions?.forEach((actionData) => {
        const outputType = actionData.action
          ? selectedOutput[actionData.action.tag]
          : Output.ALL;
        const actionFullDetails = actions.find(
          (action) =>
            Boolean(action.action) &&
            action.action?.tag === actionData.action?.tag,
        );
        delete actionFullDetails?.output?.["return-code"];
        if (!actionFullDetails) return;
        const { log } = actionFullDetails;
        const hasStdout = (log && log.length > 0) ?? false;
        const hasSterr =
          actionFullDetails.status === "failed" &&
          Boolean(actionFullDetails.message);
        const stdout = hasStdout
          ? log?.map(({ message }, i) => (
              <span className="action-logs__stdout" key={i}>
                {message}
              </span>
            ))
          : [];
        const stderr = hasSterr ? (actionFullDetails.message ?? null) : null;
        const completedDate =
          actionData.completed !== undefined && actionData.completed
            ? new Date(actionData.completed)
            : null;
        const name = actionData.action?.receiver.replace(
          /unit-(.+)-(\d+)/,
          "$1/$2",
        );
        applicationRow.subRows.push({
          application: (
            <>
              <span className="entity-details__unit-indent">└</span>
              <span>{name}</span>
            </>
          ),
          id: actionData.action?.tag.split("-")[1] ?? "",
          status: (
            <div className="u-flex u-flex--gap-small">
              <div className="u-flex-shrink u-truncate">
                <Status status={actionData.status} useIcon actionsLogs inline />
              </div>
              {Object.keys(actionFullDetails?.output ?? {}).length > 0 ? (
                <div>
                  <Button
                    onClick={() => setModalDetails(actionFullDetails.output)}
                    data-testid="show-output"
                    dense
                    hasIcon
                  >
                    <Icon name="code" />
                  </Button>
                </div>
              ) : null}
            </div>
          ),
          message:
            hasStdout || hasSterr ? (
              <div className="u-flex">
                <div>
                  {outputType !== Output.STDERR ? <span>{stdout}</span> : null}
                  {outputType !== Output.STDOUT ? (
                    <span className="action-logs__stderr">{stderr}</span>
                  ) : null}
                </div>
                <div>
                  <ContextualMenu
                    hasToggleIcon
                    toggleProps={{
                      dense: true,
                      appearance: "base",
                      "aria-label": Label.OUTPUT,
                    }}
                    links={[
                      {
                        children: Output.ALL,
                        onClick: () =>
                          actionData.action &&
                          handleOutputSelect(actionData.action.tag, Output.ALL),
                      },
                      {
                        children: Output.STDOUT,
                        onClick: () =>
                          actionData.action &&
                          handleOutputSelect(
                            actionData.action.tag,
                            Output.STDOUT,
                          ),
                        disabled: stdout ? !stdout.length : true,
                      },
                      {
                        children: Output.STDERR,
                        onClick: () =>
                          actionData.action &&
                          handleOutputSelect(
                            actionData.action.tag,
                            Output.STDERR,
                          ),
                        disabled:
                          stderr !== null && stderr ? !stderr.length : true,
                      },
                    ]}
                  />
                </div>
              </div>
            ) : null,
          // Sometimes the log gets returned with a date of "0001-01-01T00:00:00Z".
          completed:
            completedDate?.getFullYear() === 1 ||
            actionData.completed === undefined ||
            !actionData.completed ? (
              "Unknown"
            ) : (
              <RelativeDate datetime={actionData.completed} />
            ),
          sortData: {
            application: name ?? "",
            completed: completedDate?.getTime(),
            message: stdout && stderr !== null && stderr ? stdout + stderr : "",
            status: actionData.status ?? "",
          },
        });
      });
      rows.push(applicationRow);
    });
    return rows;
  }, [
    operations,
    modelStatusData,
    userName,
    modelName,
    actions,
    selectedOutput,
  ]);

  const columnData = useMemo(
    () => [
      {
        Header: "application",
        accessor: "application",
        sortType: tableSort.bind(null, "application"),
      },
      {
        Header: "operation id/name",
        accessor: "id",
        sortType: "basic",
      },
      {
        Header: "result",
        accessor: "status",
        sortType: tableSort.bind(null, "status"),
      },
      {
        Header: "action message",
        accessor: "message",
        sortType: tableSort.bind(null, "message"),
      },
      {
        Header: "completed",
        accessor: "completed",
        sortType: tableSort.bind(null, "completed"),
        sortInverted: true,
      },
    ],
    [],
  );

  const { Portal } = usePortal();

  const emptyMsg = `There are no action logs available yet for ${modelName}`;

  return (
    <div className="entity-details__action-logs">
      <PanelInlineErrors inlineErrors={inlineErrors} />
      {!fetchedOperations ? (
        <LoadingSpinner />
      ) : (
        <ModularTable
          emptyMsg={emptyMsg}
          columns={columnData}
          data={tableData}
          initialSortColumn="completed"
          initialSortDirection="ascending"
          sortable
        />
      )}
      <Portal>
        <FadeIn
          className="entity-details__payload-modal"
          isActive={Boolean(modalDetails)}
        >
          <ActionPayloadModal
            payload={modalDetails}
            onClose={() => setModalDetails(null)}
          />
        </FadeIn>
      </Portal>
    </div>
  );
}
