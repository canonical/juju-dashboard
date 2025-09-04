import {
  Button,
  Icon,
  Input,
  MainTable,
  Modal,
  RadioInput,
} from "@canonical/react-components";
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
}: Props) {
  const modelStatusData = useModelStatus(modelUUID);
  const dispatch = useDispatch();
  const wsControllerURL = useAppSelector(getWSControllerURL) ?? "";

  const applications = Object.keys(modelStatusData?.applications ?? {});
  const offers = Object.keys(modelStatusData?.offers ?? {});
  const machines = Object.keys(modelStatusData?.machines ?? {});
  const showInfoTable = applications.length || offers.length || machines.length;

  return (
    <Modal
      className="p-modal--min-width"
      close={closePortal}
      title={
        <>
          Destroy model <b>{modelName}</b>
        </>
      }
      buttonRow={
        <>
          <Button appearance="neutral" onClick={closePortal}>
            Cancel
          </Button>
          <Button
            appearance="negative"
            onClick={() => {
              dispatch(
                jujuActions.destroyModels({
                  models: [{ "model-tag": `model-${modelUUID}` }],
                  wsControllerURL,
                }),
              );
              closePortal();
            }}
          >
            Destroy Model
          </Button>
        </>
      }
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
              ...(offers.length
                ? [
                    {
                      columns: [
                        {
                          content: (
                            <>
                              <Icon name="get-link" className="icon" />
                              Cross-model relations ({offers.length})
                            </>
                          ),
                        },
                        {
                          content: offers.map((offer) => (
                            <div key={offer}>{offer}</div>
                          )),
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
          <hr />
        </>
      ) : null}
      {modelStatusData?.storage ? (
        <>
          <div>Model has attached storage</div>
          <RadioInput label="Destroy storage" />
          <RadioInput label="Detach storage" />
          <hr />
        </>
      ) : null}
      <div className="destroy-model-timeout">
        <Input type="checkbox" label="Timeout" />
        <Input type="number" placeholder="0" />
      </div>
    </Modal>
  );
}
