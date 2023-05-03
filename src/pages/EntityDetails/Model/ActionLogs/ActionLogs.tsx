import type {
  ActionResult,
  AdditionalProperties,
  OperationResult,
} from "@canonical/jujulib/dist/api/facades/action/ActionV7";
import {
  Button,
  CodeSnippet,
  CodeSnippetBlockAppearance,
  ContextualMenu,
  Modal,
  ModularTable,
  Spinner,
  Tooltip,
} from "@canonical/react-components";
import classnames from "classnames";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import type { Column } from "react-table";

import FadeIn from "animations/FadeIn";
import CharmIcon from "components/CharmIcon/CharmIcon";
import type { EntityDetailsRoute } from "components/Routes/Routes";
import Status from "components/Status";
import { copyToClipboard, formatFriendlyDateToNow } from "components/utils";
import { queryActionsList, queryOperationsList } from "juju/api";
import { getModelStatus, getModelUUID } from "store/juju/selectors";
import type { RootState } from "store/store";
import { useAppStore } from "store/store";
import urls from "urls";
import "./_action-logs.scss";

type Operations = OperationResult[];
type Actions = ActionResult[];

type TableRows = TableRow[];

type TableRow = {
  application: string;
  id: string;
  status: string;
  taskId: string;
  message: string;
  completed: string;
};

type ApplicationData = {
  charm: string;
};

export enum Label {
  OUTPUT = "Output",
}

export enum Output {
  ALL = "STDOUT/STDERR",
  STDERR = "STDERR",
  STDOUT = "STDOUT",
}

function generateLinkToApp(
  appName: string,
  userName: string,
  modelName: string
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
  modelName?: string
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
  payload: AdditionalProperties | null;
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
          Copy to clipboard
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

export default function ActionLogs() {
  const [operations, setOperations] = useState<Operations>([]);
  const [actions, setActions] = useState<Actions>([]);
  const [fetchedOperations, setFetchedOperations] = useState(false);
  const [modalDetails, setModalDetails] = useState<AdditionalProperties | null>(
    null
  );
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const [selectedOutput, setSelectedOutput] = useState<{
    [key: string]: Output;
  }>({});
  const appStore = useAppStore();
  const getModelUUIDMemo = useMemo(
    () => (modelName ? getModelUUID(modelName) : null),
    [modelName]
  );
  const modelUUID = useSelector((state: RootState) =>
    getModelUUIDMemo?.(state)
  );
  const modelStatusData = useSelector(getModelStatus(modelUUID));

  const applicationList = Object.keys(modelStatusData?.applications ?? {});

  useEffect(() => {
    async function fetchData() {
      if (modelUUID) {
        const operationList = await queryOperationsList(
          {
            applications: applicationList,
          },
          modelUUID,
          appStore.getState()
        );
        if (operationList?.results) {
          setOperations(operationList.results);
          const actionsTags = operationList.results
            .flatMap((operation: OperationResult) =>
              operation.actions?.map((action) => action.action.tag)
            )
            .filter((actionTag?: string): actionTag is string => !!actionTag)
            .map((actionTag: string) => ({ tag: actionTag }));
          const actionsList = await queryActionsList(
            { entities: actionsTags },
            modelUUID,
            appStore.getState()
          );
          if (actionsList) {
            setActions(actionsList.results);
          }
        }
        setFetchedOperations(true);
      }
    }
    fetchData();
    // XXX Temporarily disabled.
    // Used to stop it re-requesting every time state changes.
    // appStore and applicationList removed from dependency graph
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelUUID]);

  const tableData = useMemo(() => {
    const handleOutputSelect = (actionTag: string, output: Output) => {
      selectedOutput[actionTag] = output;
      setSelectedOutput({ ...selectedOutput });
    };

    const rows: TableRows = [];
    operations?.forEach((operationData) => {
      const operationId = operationData.operation.split("-")[1];
      // The action name is being defined like this because the action name is
      // only contained in the actions array and not on the operation level.
      // Even though at the current time an operation is the same action
      // performed across multiple units of the same application. I expect
      // that the CLI may gain this functionality in the future and we'll have
      // to update this code to display the correct action name.
      let actionName = "";
      operationData.actions?.forEach((actionData, index) => {
        actionName = actionData.action.name;
        const outputType = selectedOutput[actionData.action.tag] || Output.ALL;

        const actionFullDetails = actions.find(
          (action) => action.action.tag === actionData.action.tag
        );
        delete actionFullDetails?.output?.["return-code"];
        if (!actionFullDetails) return;
        const stdout = (actionFullDetails.log || []).map((m, i) => (
          <span className="action-logs__stdout" key={i}>
            {m.message}
          </span>
        ));
        const stderr =
          actionFullDetails.status === "failed"
            ? actionFullDetails.message
            : "";
        const StdOut = () => <span>{stdout}</span>;
        const StdErr = () => (
          <span className="action-logs__stderr">{stderr}</span>
        );
        const defaultRow: TableRow = {
          application: "-",
          id: "-",
          status: "-",
          taskId: "",
          message: "",
          completed: "",
        };
        let newData = {};
        const completedDate = new Date(actionData.completed);

        if (index === 0) {
          // If this is the first row then add the application row.
          // The reciever is in the format "unit-ceph-mon-0" to "ceph-mon"
          const parts = actionData.action.receiver.match(/unit-(.+)-\d+/);
          const appName = parts && parts[1];
          if (!appName) {
            console.error(
              "Unable to parse action receiver",
              actionData.action.receiver
            );
            return;
          }
          newData = {
            application: generateAppIcon(
              modelStatusData?.applications[appName],
              appName,
              userName,
              modelName
            ),
            id: `${operationId}/${actionName}`,
            status: <Status status={actionData.status} useIcon actionsLogs />,
          };
          rows.push({
            ...defaultRow,
            ...newData,
          });
        }
        newData = {
          application: (
            <>
              <span className="entity-details__unit-indent">└</span>
              <span>
                {actionData.action.receiver.replace(/unit-(.+)-(\d+)/, "$1/$2")}
              </span>
            </>
          ),
          id: "",
          status: <Status status={actionData.status} useIcon actionsLogs />,
          taskId: actionData.action.tag.split("-")[1],
          message: (
            <>
              {outputType === Output.STDOUT ? (
                <StdOut />
              ) : outputType === Output.STDERR ? (
                <StdErr />
              ) : (
                <>
                  <StdOut />
                  <StdErr />
                </>
              )}
            </>
          ),
          completed:
            // Sometimes the log gets returned with a date of "0001-01-01T00:00:00Z".
            completedDate.getFullYear() === 1 ? (
              "Unknown"
            ) : (
              <Tooltip
                message={completedDate.toLocaleString()}
                position="top-center"
              >
                {formatFriendlyDateToNow(actionData.completed)}
              </Tooltip>
            ),
          controls: (
            <div className="entity-details__action-buttons">
              <ContextualMenu
                hasToggleIcon
                toggleProps={{ dense: true }}
                toggleLabel={
                  outputType === Output.ALL ? Label.OUTPUT : outputType
                }
                links={[
                  {
                    children: Output.ALL,
                    onClick: () =>
                      handleOutputSelect(actionData.action.tag, Output.ALL),
                  },
                  {
                    children: Output.STDOUT,
                    onClick: () =>
                      handleOutputSelect(actionData.action.tag, Output.STDOUT),
                    disabled: !stdout.length,
                  },
                  {
                    children: Output.STDERR,
                    onClick: () =>
                      handleOutputSelect(actionData.action.tag, Output.STDERR),
                    disabled: !stderr.length,
                  },
                ]}
              />
              {Object.keys(actionFullDetails?.output ?? {}).length > 0 && (
                <Button
                  onClick={() => setModalDetails(actionFullDetails.output)}
                  data-testid="show-output"
                  dense
                >
                  Result
                </Button>
              )}
            </div>
          ),
        };

        rows.push({
          ...defaultRow,
          ...newData,
        });
      });
    });
    return rows;
  }, [
    operations,
    modelStatusData?.applications,
    userName,
    modelName,
    actions,
    selectedOutput,
  ]);

  const columnData: Column[] = useMemo(
    () => [
      {
        Header: "application",
        accessor: "application",
      },
      {
        Header: "operation id/name",
        accessor: "id",
      },
      {
        Header: "status",
        accessor: "status",
      },
      {
        Header: "task id",
        accessor: "taskId",
      },
      {
        Header: "action message",
        accessor: "message",
      },
      {
        Header: "completion time",
        accessor: "completed",
      },
      {
        accessor: "controls",
      },
    ],
    []
  );

  const emptyMsg = `There are no action logs available yet for ${modelName}`;

  return (
    <div
      className={classnames("entity-details__action-logs", {
        "entity-details__loading": !fetchedOperations,
      })}
    >
      {!fetchedOperations ? (
        <Spinner />
      ) : (
        <ModularTable
          emptyMsg={emptyMsg}
          columns={columnData}
          data={tableData}
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
