import {
  ConfirmationModal,
  Icon,
  MainTable,
  RadioInput,
} from "@canonical/react-components";
import { useState } from "react";
import type { JSX } from "react";
import { useDispatch } from "react-redux";

import useModelStatus from "hooks/useModelStatus";
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
  const modelStatusData = useModelStatus(modelUUID);
  const dispatch = useDispatch();
  const wsControllerURL = useAppSelector(getWSControllerURL) ?? "";
  const [destroyStorage, setDestroyStorage] = useState<boolean | undefined>();

  const applications = Object.keys(modelStatusData?.applications ?? {});
  const machines = Object.keys(modelStatusData?.machines ?? {});
  const offers = modelStatusData?.offers;
  const remoteApplications = modelStatusData?.["remote-applications"];
  const crossModelRelations = Object.keys(offers ?? {}).map((offer) => ({
    name: offer,
    type: "offer",
  }));
  const connectedOffers = Object.entries(offers ?? {}).filter(
    ([offer, data]) => (data["total-connected-count"] > 0 ? offer : null),
  );
  if (remoteApplications) {
    crossModelRelations.push(
      ...Object.keys(remoteApplications).map((remoteApp) => ({
        name: remoteApp,
        type: "remoteApp",
      })),
    );
  }

  const showInfoTable =
    applications.length || machines.length || crossModelRelations;

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
        (destroyStorage === undefined &&
          modelStatusData?.storage !== undefined) ||
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
              ...(crossModelRelations
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
                              {crossModelRelations.map(({ name, type }) => (
                                <div key={name}>
                                  {type === "offer" ? (
                                    <>
                                      {name}{" "}
                                      {
                                        modelStatusData?.offers[name].endpoints[
                                          "db"
                                        ].name
                                      }
                                      :
                                      {
                                        modelStatusData?.offers[name].endpoints[
                                          "db"
                                        ].interface
                                      }
                                    </>
                                  ) : (
                                    <>
                                      {name}{" "}
                                      {
                                        modelStatusData?.[
                                          "remote-applications"
                                        ][name].endpoints[0].name
                                      }
                                      :
                                      {
                                        modelStatusData?.[
                                          "remote-applications"
                                        ][name].endpoints[0].interface
                                      }
                                    </>
                                  )}
                                </div>
                              ))}
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
          {modelStatusData?.storage !== undefined ? (
            <>
              <hr />
              <div>Model has attached storage</div>
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
              <div>
                Model has cross-model relations that need to be removed
                manually:
              </div>
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
                                connectedOffer[1]["application-name"],
                            )}
                          </>
                        ),
                      },
                      {
                        content: (
                          <>
                            <Icon name="get-link" className="icon" />
                            {connectedOffers.map(
                              (connectedOffer) => connectedOffer[0],
                            )}{" "}
                            {connectedOffers.map(
                              (connectedOffer) =>
                                `${connectedOffer[1].endpoints["db"].name}:${connectedOffer[1].endpoints["db"].interface}`,
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
