import type { RemoteEndpoint } from "@canonical/jujulib/dist/api/facades/application/ApplicationV19";
import {
  ConfirmationModal,
  Icon,
  MainTable,
  RadioInput,
} from "@canonical/react-components";
import { useState } from "react";
import type { JSX } from "react";
import { useDispatch } from "react-redux";

import useModelDestructionData from "hooks/useModelDestructionData";
import { getWSControllerURL } from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import { useAppSelector } from "store/store";

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

  return (
    <ConfirmationModal
      title={
        <>
          Destroy model <b>{modelName}</b>
        </>
      }
      className="p-modal--min-width"
      confirmButtonLabel="Destroy model"
      confirmButtonDisabled={
        (destroyStorage === undefined && hasStorage) ||
        connectedOffers.length > 0
      }
      onConfirm={() => {
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
      }}
      close={closePortal}
    >
      {showInfoTable ? (
        <>
          By destroying model <b>{modelName}</b>, you will also be removing:
          <MainTable
            data-testid="model-status-info"
            headers={[{ content: "type" }, { content: "name" }]}
            rows={[
              ...(applications.length
                ? [
                    {
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
                          content: applications.map((app) => (
                            <div key={app}>{app}</div>
                          )),
                        },
                      ],
                    },
                  ]
                : []),
              ...(crossModelRelations.length
                ? [
                    {
                      columns: [
                        {
                          content: (
                            <>
                              <Icon name="get-link" className="icon" />
                              Cross-model relations (
                              {crossModelRelations.length})
                            </>
                          ),
                        },
                        {
                          content: (
                            <>
                              {crossModelRelations.map(
                                ({ name, endpoints }) => (
                                  <div key={name}>
                                    {name}{" "}
                                    {endpoints.map(
                                      (
                                        endpoint: RemoteEndpoint,
                                        index: number,
                                      ) => (
                                        <span key={index}>
                                          {endpoint.name}:{endpoint.interface}
                                        </span>
                                      ),
                                    )}
                                  </div>
                                ),
                              )}
                            </>
                          ),
                        },
                      ],
                    },
                  ]
                : []),
              ...(machines.length
                ? [
                    {
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
                          content: (
                            <div>
                              {machines.map((machine, index) =>
                                !index ? machine : `, ${machine}`,
                              )}
                            </div>
                          ),
                        },
                      ],
                    },
                  ]
                : []),
            ]}
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
          {connectedOffers.length ? (
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
                              (connectedOffer) =>
                                connectedOffer.applicationName,
                            )}
                          </>
                        ),
                      },
                      {
                        content: (
                          <>
                            <Icon name="get-link" className="icon" />
                            {connectedOffers.map(
                              (connectedOffer) => connectedOffer.offerName,
                            )}{" "}
                            {connectedOffers.map(
                              (connectedOffer) =>
                                `${connectedOffer.endpoint.name}:${connectedOffer.endpoint.interface}`,
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
