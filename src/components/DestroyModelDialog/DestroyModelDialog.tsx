import type { RemoteEndpoint } from "@canonical/jujulib/dist/api/facades/application/ApplicationV19";
import {
  ConfirmationModal,
  Icon,
  MainTable,
  RadioInput,
} from "@canonical/react-components";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { useState, useMemo } from "react";
import type { JSX } from "react";
import { useDispatch } from "react-redux";

import useModelDestructionData from "hooks/useModelDestructionData";
import { getWSControllerURL } from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import { useAppSelector } from "store/store";

// Helper to render the Applications
const ApplicationsRow = (applications: string[]): MainTableRow | null => {
  if (!applications.length) {
    return null;
  }
  return {
    columns: [
      {
        content: (
          <>
            <Icon name="applications" className="icon" />
            Applications ({applications.length})
          </>
        ),
      },
      {
        content: applications.map((app) => <div key={app}>{app}</div>),
      },
    ],
  };
};

// Helper to render the Cross-Model Relations
const CrossModelRelationsRow = (
  crossModelRelations: { name: string; endpoints: RemoteEndpoint[] }[],
): MainTableRow | null => {
  if (!crossModelRelations.length) {
    return null;
  }
  return {
    columns: [
      {
        content: (
          <>
            <Icon name="get-link" className="icon" />
            Cross-model relations ({crossModelRelations.length})
          </>
        ),
      },
      {
        content: (
          <>
            {crossModelRelations.map(({ name, endpoints }) => (
              <div key={name}>
                {name}{" "}
                {endpoints.map((endpoint: RemoteEndpoint, index: number) => (
                  <span key={index}>
                    {endpoint.name}:{endpoint.interface}
                  </span>
                ))}
              </div>
            ))}
          </>
        ),
      },
    ],
  };
};

// Helper to render the Machines
const MachinesRow = (machines: string[]): MainTableRow | null => {
  if (!machines.length) {
    return null;
  }
  return {
    columns: [
      {
        content: (
          <>
            <Icon name="machines" className="icon" />
            Machines ({machines.length})
          </>
        ),
      },
      {
        content: <div>{machines.join(", ")}</div>,
      },
    ],
  };
};

type Props = {
  modelName: string;
  modelUUID: string;
  closePortal: () => void;
};

export default function DestroyModelDialog({
  modelName,
  modelUUID,
  closePortal,
}: Props): JSX.Element {
  const {
    hasStorage,
    applications,
    machines,
    crossModelRelations,
    connectedOffers,
    showInfoTable,
    storageIDs,
  } = useModelDestructionData(modelUUID);

  const dispatch = useDispatch();
  const wsControllerURL = useAppSelector(getWSControllerURL) ?? "";
  const [destroyStorage, setDestroyStorage] = useState<boolean | undefined>();

  const infoTableRows = useMemo(() => {
    return [
      ApplicationsRow(applications),
      CrossModelRelationsRow(crossModelRelations),
      MachinesRow(machines),
    ].filter((row): row is Exclude<typeof row, null> => row !== null);
  }, [applications, crossModelRelations, machines]);

  // Determine the disabled state based on storage and connected offers
  const isConfirmDisabled =
    (destroyStorage === undefined && hasStorage) || connectedOffers.length > 0;

  const handleConfirm = (): void => {
    dispatch(
      jujuActions.destroyModels({
        modelParams: [
          {
            "model-tag": `model-${modelUUID}`,
            "destroy-storage": destroyStorage,
          },
        ],
        models: [modelName],
        wsControllerURL,
      }),
    );
    closePortal();
  };

  return (
    <ConfirmationModal
      title={
        <>
          Destroy model <b>{modelName}</b>
        </>
      }
      data-testid="destroy-model-dialog"
      className="p-modal--min-width"
      confirmButtonLabel="Destroy model"
      confirmButtonDisabled={isConfirmDisabled}
      onConfirm={handleConfirm}
      close={closePortal}
    >
      {showInfoTable ? (
        <>
          By destroying model <b>{modelName}</b>, you will also be removing:
          <MainTable
            data-testid="model-status-info"
            headers={[{ content: "type" }, { content: "name" }]}
            rows={infoTableRows}
            className="p-main-table destroy-model-table"
          />
          {hasStorage ? (
            <>
              <hr />
              <div>
                Model has attached storage <b>{storageIDs.join(", ")}</b>
              </div>
              <RadioInput
                label="Destroy storage"
                checked={destroyStorage}
                onChange={() => {
                  setDestroyStorage(true);
                }}
              />
              <RadioInput
                label="Detach storage"
                checked={destroyStorage === false}
                onChange={() => {
                  setDestroyStorage(false);
                }}
              />
            </>
          ) : null}
          {connectedOffers.length > 0 ? (
            <>
              <hr />
              <div>Model has offers that need to be removed manually:</div>
              <MainTable
                className="p-main-table destroy-model-table"
                headers={[{ content: "application" }, { content: "offer" }]}
                rows={[
                  {
                    columns: [
                      {
                        content: (
                          <>
                            <Icon name="applications" className="icon" />
                            {connectedOffers.map(
                              ({ applicationName }) => applicationName,
                            )}
                          </>
                        ),
                      },
                      {
                        content: (
                          <>
                            <Icon name="get-link" className="icon" />
                            {connectedOffers.map(
                              ({ offerName, endpoint }) =>
                                `${offerName} ${endpoint.name}:${endpoint.interface}`,
                            )}
                          </>
                        ),
                      },
                    ],
                  },
                ]}
              />
            </>
          ) : null}
        </>
      ) : (
        <div>
          Do you want to destroy the empty model <b>{modelName}</b>?
        </div>
      )}
    </ConfirmationModal>
  );
}
