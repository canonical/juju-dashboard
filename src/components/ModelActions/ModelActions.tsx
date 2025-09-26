import { ContextualMenu, usePortal } from "@canonical/react-components";
import type { FC } from "react";
import { Link } from "react-router";

import DestroyModelDialog from "components/DestroyModelDialog";
import { useCanConfigureModelWithUUID } from "hooks/useCanConfigureModel";
import useModelStatus from "hooks/useModelStatus";
import { useQueryParams } from "hooks/useQueryParams";
import { getIsJuju } from "store/general/selectors";
import { useAppSelector } from "store/store";
import { rebacURLS } from "urls";

import { Label, type Props } from "./types";

const ModelActions: FC<Props> = ({ modelName, modelUUID }: Props) => {
  const [_panelQs, setPanelQs] = useQueryParams<{
    model: null | string;
    panel: null | string;
  }>({
    model: null,
    panel: null,
  });
  const canConfigureModel = useCanConfigureModelWithUUID(false, modelUUID);
  const modelStatusData = useModelStatus(modelUUID);
  const isController = modelStatusData?.info?.["is-controller"];
  const isJuju = useAppSelector(getIsJuju);
  const {
    openPortal,
    closePortal,
    isOpen: showDestroyModel,
    Portal,
  } = usePortal();

  return (
    <>
      {showDestroyModel && (
        <Portal>
          <DestroyModelDialog
            modelName={modelName}
            modelUUID={modelUUID}
            closePortal={closePortal}
          />
        </Portal>
      )}
      <ContextualMenu
        hasToggleIcon
        toggleAppearance="base"
        toggleClassName="has-icon u-no-margin--bottom"
        links={[
          {
            children: Label.ACCESS,
            disabled: !canConfigureModel,
            ...(isJuju
              ? {
                  onClick: (event): void => {
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
          },
          {
            children: Label.DESTROY,
            disabled: isController ?? !canConfigureModel,
            onClick: (event: React.MouseEvent<HTMLButtonElement>): void => {
              event.stopPropagation();
              openPortal(event);
            },
          },
        ]}
      />
    </>
  );
};

export default ModelActions;
