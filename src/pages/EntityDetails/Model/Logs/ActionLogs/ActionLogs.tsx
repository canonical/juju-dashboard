import type {
  ActionResult,
  OperationResult,
} from "@canonical/jujulib/dist/api/facades/action/ActionV7";
import {
  Button,
  CodeSnippet,
  CodeSnippetBlockAppearance,
  ContextualMenu,
  Icon,
  Modal,
  ModularTable,
} from "@canonical/react-components";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import type { Column, Row } from "react-table";

import FadeIn from "animations/FadeIn";
import CharmIcon from "components/CharmIcon/CharmIcon";
import LoadingSpinner from "components/LoadingSpinner/LoadingSpinner";
import RelativeDate from "components/RelativeDate";
import type { EntityDetailsRoute } from "components/Routes/Routes";
import Status from "components/Status";
import { copyToClipboard } from "components/utils";
import useInlineErrors from "hooks/useInlineErrors";
import { queryActionsList, queryOperationsList } from "juju/api";
import PanelInlineErrors from "panels/PanelInlineErrors";
import { getModelStatus, getModelUUID } from "store/juju/selectors";
import type { ModelData } from "store/juju/types";
import type { RootState } from "store/store";
import { useAppStore } from "store/store";
import urls from "urls";
import "./_action-logs.scss";

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

export enum Label {
  OUTPUT = "Output",
  COPY = "Copy to clipboard",
  FETCH_ERROR = "Error while trying to fetch data.",
}

export enum Output {
  ALL = "STDOUT/STDERR",
  STDERR = "STDERR",
  STDOUT = "STDOUT",
}

enum InlineErrors {
  FETCH = "fetch",
}

function generateLinkToApp(
  appName: string,
  userName: string,
  modelName: string,
) {
  return (
    <Link to={urls.model.app.index({ userName, modelName, appName })}>
      {appName}
    </Link>
  );
}

function generateAppIcon(
  application: ApplicationData | undefined,
  appName: string,
  userName?: string,
  modelName?: string,
) {
  // If the user has executed actions with an application and then removed
  // that application it'll no longer be in the model data so in this
  // case we need to fail gracefully.
  if (application && userName && modelName) {
    return (
      <>
        <CharmIcon name={appName} charmId={application.charm} />
        {generateLinkToApp(appName, userName, modelName)}
      </>
    );
  }
  return <>{appName}</>;
}

function ActionPayloadModal(props: {
  payload: ActionResult["output"] | null;
  onClose: () => void;
}) {
  if (!props.payload) return <></>;
  const json = JSON.stringify(props.payload, null, 2);
  return (
    <Modal
      close={props.onClose}
      title="Action result payload"
      buttonRow={
        <Button appearance="neutral" onClick={() => copyToClipboard(json)}>
          {Label.COPY}
        </Button>
      }
      data-testid="action-payload-modal"
    >
      <CodeSnippet
        blocks={[
          {
            appearance: CodeSnippetBlockAppearance.NUMBERED,
            wrapLines: true,
            code: json,
          },
        ]}
      />
    </Modal>
  );
}

const compare = (a: string | number, b: string | number) =>
  a === b ? 0 : a > b ? 1 : -1;

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
  const operationId = operationData.operation.split("-")[1];
  // The receiver is in the format "unit-ceph-mon-0" to "ceph-mon"
  const parts = actionData.action?.receiver.match(/unit-(.+)-\d+/);
  const appName = parts && parts[1];
  if (!appName) {
    // Not shown in UI. Logged for debugging purposes.
    console.error(
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
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const [selectedOutput, setSelectedOutput] = useState<{
    [key: string]: Output;
  }>({});
  const appStore = useAppStore();
  const getModelUUIDMemo = useMemo(
    () => (modelName ? getModelUUID(modelName) : null),
    [modelName],
  );
  const modelUUID = useSelector((state: RootState) =>
    getModelUUIDMemo?.(state),
  );
  const modelStatusData = useSelector(getModelStatus(modelUUID));

  const applicationList = Object.keys(modelStatusData?.applications ?? {});

  const fetchData = useCallback(async () => {
    try {
      if (modelUUID) {
        const operationList = await queryOperationsList(
          {
            applications: applicationList,
          },
          modelUUID,
          appStore.getState(),
        );
        if (operationList?.results) {
          setOperations(operationList.results);
          const actionsTags = operationList.results
            .flatMap((operation: OperationResult) =>
              operation.actions?.map((action) => action.action?.tag),
            )
            .filter((actionTag?: string): actionTag is string => !!actionTag)
            .map((actionTag: string) => ({ tag: actionTag }));
          const actionsList = await queryActionsList(
            { entities: actionsTags },
            modelUUID,
            appStore.getState(),
          );
          if (actionsList?.results) {
            setActions(actionsList.results);
          }
        }
      }
      setInlineErrors(InlineErrors.FETCH, null);
    } catch (error) {
      setInlineErrors(InlineErrors.FETCH, Label.FETCH_ERROR);
      console.error(Label.FETCH_ERROR, error);
    } finally {
      setFetchedOperations(true);
    }
  }, [appStore, applicationList, modelUUID, setInlineErrors]);

  useEffect(() => {
    void fetchData();
    // XXX Temporarily disabled.
    // Used to stop it re-requesting every time state changes.
    // appStore and applicationList removed from dependency graph
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelUUID]);

  const tableData = useMemo(() => {
    const handleOutputSelect = (actionTag: string, output: Output) => {
      setSelectedOutput((previousSelected) => ({
        ...previousSelected,
        [actionTag]: output,
      }));
    };

    const rows: TableRows = [];
    operations?.forEach((operationData) => {
      if (!operationData.actions?.length || !userName || !modelName) {
        return;
      }
      // Retrieve the application details from the first action:
      const applicationRow = generateApplicationRow(
        operationData.actions[0],
        operationData,
        modelStatusData,
        userName,
        modelName,
      );
      if (!applicationRow) {
        return;
      }
      operationData.actions?.forEach((actionData) => {
        const outputType =
          (actionData.action && selectedOutput[actionData.action.tag]) ||
          Output.ALL;
        const actionFullDetails = actions.find(
          (action) =>
            action.action && action.action.tag === actionData.action?.tag,
        );
        delete actionFullDetails?.output?.["return-code"];
        if (!actionFullDetails) return;
        const log = actionFullDetails.log;
        const hasStdout = log && log.length > 0;
        const hasSterr =
          actionFullDetails.status === "failed" && !!actionFullDetails.message;
        const stdout = hasStdout
          ? log.map((m, i) => (
              <span className="action-logs__stdout" key={i}>
                {m.message}
              </span>
            ))
          : [];
        const stderr = hasSterr ? actionFullDetails.message : "";
        const completedDate = actionData.completed
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
                        disabled: !stdout?.length,
                      },
                      {
                        children: Output.STDERR,
                        onClick: () =>
                          actionData.action &&
                          handleOutputSelect(
                            actionData.action.tag,
                            Output.STDERR,
                          ),
                        disabled: !stderr?.length,
                      },
                    ]}
                  />
                </div>
              </div>
            ) : null,
          // Sometimes the log gets returned with a date of "0001-01-01T00:00:00Z".
          completed:
            completedDate?.getFullYear() === 1 || !actionData.completed ? (
              "Unknown"
            ) : (
              <RelativeDate datetime={actionData.completed} />
            ),
          sortData: {
            application: name ?? "",
            completed: completedDate?.getTime(),
            message: stdout && stderr ? stdout + stderr : "",
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

  const columnData: Column<RowCells>[] = useMemo(
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
      <FadeIn isActive={Boolean(modalDetails)}>
        <ActionPayloadModal
          payload={modalDetails}
          onClose={() => setModalDetails(null)}
        />
      </FadeIn>
    </div>
  );
}
