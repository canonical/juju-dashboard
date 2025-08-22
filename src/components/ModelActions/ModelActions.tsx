import { ContextualMenu } from "@canonical/react-components";
import { useDispatch } from "react-redux";
import { Link } from "react-router";

import useCanConfigureModel from "hooks/useCanConfigureModel";
import { useQueryParams } from "hooks/useQueryParams";
import { getIsJuju, getWSControllerURL } from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import { useAppSelector } from "store/store";
import { rebacURLS } from "urls";

import type { Props } from "./types";

const ModelActions = ({ modelName, modelUUID, activeUser }: Props) => {
  const [, setPanelQs] = useQueryParams<{
    model: string | null;
    panel: string | null;
  }>({
    model: null,
    panel: null,
  });
  const canConfigureModel = useCanConfigureModel(false, modelName, activeUser);
  const wsControllerURL = useAppSelector(getWSControllerURL) ?? "";
  const isJuju = useAppSelector(getIsJuju);
  const dispatch = useDispatch();

  return (
    <ContextualMenu
      // toggle={<Icon name="menu" />}
      hasToggleIcon
      links={[
        canConfigureModel
          ? {
              children: "Manage access",
              className: "model-access",
              ...(isJuju
                ? {
                    onClick: (event) => {
                      event.stopPropagation();
                      setPanelQs(
                        {
                          model: modelName,
                          panel: "share-model",
                        },
                        { replace: true },
                      );
                    },
                  }
                : {
                    element: Link,
                    to: rebacURLS.groups.index,
                  }),
            }
          : {},
        !isJuju
          ? {
              children: "Upgrade model",
              className: "model-upgrade",
              onClick: (event) => {
                event.stopPropagation();
                dispatch(
                  jujuActions.fetchMigrationTargets({
                    modelTag: `model-${modelUUID}`,
                    wsControllerURL,
                  }),
                );
                setPanelQs(
                  {
                    model: modelName,
                    panel: "migrate-model",
                  },
                  { replace: true },
                );
              },
            }
          : {},
      ]}
    />
  );
};

export default ModelActions;
