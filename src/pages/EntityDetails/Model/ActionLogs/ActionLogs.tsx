import classnames from "classnames";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";

import {
  ContextualMenu,
  ModularTable,
  Spinner,
  Tooltip,
} from "@canonical/react-components";

import { getModelStatus, getModelUUID } from "app/selectors";
import {
  generateIconImg,
  generateStatusElement,
  formatFriendlyDateToNow,
} from "app/utils/utils";
import { queryActionsList, queryOperationsList } from "juju/api";

import type { EntityDetailsRoute } from "components/Routes/Routes";
import { useAppStore } from "store/store";
import { TSFixMe } from "types";
import "./_action-logs.scss";

type ApplicationList = { [key: string]: any };

type Operations = Operation[];
type Actions = Action[];

type Operation = {
  operation: string;
  actions: Action[];
};

type TableRows = TableRow[];

type TableRow = {
  application: string;
  id: string;
  status: string;
  taskId: string;
  message: string;
  completed: string;
};

// https://github.com/juju/js-libjuju/blob/master/api/facades/action-v7.ts#L29
type Action = {
  action: ActionData;
  completed: string;
  enqueued: string;
  error: Error;
  log: ActionMessage[];
  message: string;
  output: AdditionalProperties;
  started: string;
  status: string;
};

type ActionMessage = {
  message: string;
  timestamp: string;
};

type ActionData = {
  "execution-group"?: string;
  name: string;
  parallel?: boolean;
  parameters?: AdditionalProperties;
  receiver: string;
  tag: string;
};

// custom entries that are set with `event.set_results`
type AdditionalProperties = {
  [key: string]: any;
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
    <Link to={`/models/${userName}/${modelName}/app/${appName}`}>
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
        {generateIconImg(appName, application.charm)}
        {generateLinkToApp(appName, userName, modelName)}
      </>
    );
  }
  return <>{appName}</>;
}

export default function ActionLogs() {
  const [operations, setOperations] = useState<Operations>([]);
  const [actions, setActions] = useState<Actions>([]);
  const [fetchedOperations, setFetchedOperations] = useState(false);
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const [selectedOutput, setSelectedOutput] = useState<{
    [key: string]: Output;
  }>({});
  const appStore = useAppStore();
  const getModelUUIDMemo = useMemo(
    () => (modelName ? getModelUUID(modelName) : null),
    [modelName]
  );
  // Selectors.js is not typescript yet and it complains about the return value
  // of getModelUUID. TSFixMe
  const modelUUID = useSelector(getModelUUIDMemo as (state: TSFixMe) => string);
  const modelStatusData = useSelector(
    getModelStatus(modelUUID) as (state: TSFixMe) => {
      applications: ApplicationList;
    }
  );

  const applicationList = Object.keys(modelStatusData?.applications ?? {});

  useEffect(() => {
    async function fetchData() {
      const operationList = await queryOperationsList(
        {
          applications: applicationList,
        },
        modelUUID,
        appStore.getState()
      );
      setOperations(operationList.results);
      const actionsTags = operationList.results
        ?.flatMap((operation: Operation) =>
          operation.actions.map((action) => action.action.tag)
        )
        .map((actionTag: string) => ({ tag: actionTag }));
      const actionsList = await queryActionsList(
        { entities: actionsTags },
        modelUUID,
        appStore.getState()
      );
      setActions(actionsList.results);
      setFetchedOperations(true);
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
    operations &&
      operations.forEach((operationData) => {
        const operationId = operationData.operation.split("-")[1];
        // The action name is being defined like this because the action name is
        // only contained in the actions array and not on the operation level.
        // Even though at the current time an operation is the same action
        // performed across multiple units of the same application. I expect
        // that the CLI may gain this functionality in the future and we'll have
        // to update this code to display the correct action name.
        let actionName = "";
        operationData.actions.forEach((actionData, index) => {
          actionName = actionData.action.name;
          const outputType =
            selectedOutput[actionData.action.tag] || Output.ALL;

          const actionFullDetails = actions.find(
            (action) => action.action.tag === actionData.action.tag
          );
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
          let defaultRow: TableRow = {
            application: "-",
            id: "-",
            status: "-",
            taskId: "",
            message: "",
            completed: "",
          };
          let newData = {};
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
                modelStatusData.applications[appName],
                appName,
                userName,
                modelName
              ),
              id: `${operationId}/${actionName}`,
              status: generateStatusElement(
                actionData.status,
                undefined,
                true,
                true
              ),
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
                  {actionData.action.receiver.replace(
                    /unit-(.+)-(\d+)/,
                    "$1/$2"
                  )}
                </span>
              </>
            ),
            id: "",
            status: generateStatusElement(
              actionData.status,
              undefined,
              true,
              true
            ),
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
            completed: (
              <Tooltip
                message={new Date(actionData.completed).toLocaleString()}
                position="top-center"
              >
                {formatFriendlyDateToNow(actionData.completed)}
              </Tooltip>
            ),
            controls: (
              <>
                <ContextualMenu
                  hasToggleIcon
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
                        handleOutputSelect(
                          actionData.action.tag,
                          Output.STDOUT
                        ),
                      disabled: !stdout.length,
                    },
                    {
                      children: Output.STDERR,
                      onClick: () =>
                        handleOutputSelect(
                          actionData.action.tag,
                          Output.STDERR
                        ),
                      disabled: !stderr.length,
                    },
                  ]}
                />
              </>
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

  const columnData = useMemo(
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
    </div>
  );
}
