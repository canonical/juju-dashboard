import { ContextualMenu, Icon, usePortal } from "@canonical/react-components";
import type { FC } from "react";
import { Link } from "react-router";

import DestroyModelDialog from "components/DestroyModelDialog";
import { useCanConfigureModelWithUUID } from "hooks/useCanConfigureModel";
import useModelStatus from "hooks/useModelStatus";
import { useQueryParams } from "hooks/useQueryParams";
import { useIsJIMMAdmin } from "juju/api-hooks/permissions";
import { getIsJuju } from "store/general/selectors";
import { useAppSelector } from "store/store";
import { testId } from "testing/utils";
import { rebacURLS } from "urls";

import { Label, TestId, type Props } from "./types";

const ModelActions: FC<Props> = ({
  modelName,
  modelUUID,
  redirectOnDestroy,
  position,
  qualifier,
}: Props) => {
  const [_panelQs, setPanelQs] = useQueryParams<{
    model: null | string;
    modelName: null | string;
    panel: null | string;
    qualifier: null | string;
  }>({
    model: null,
    modelName: null,
    panel: null,
    qualifier: null,
  });
  const canConfigureModel = useCanConfigureModelWithUUID(false, modelUUID);
  const modelStatusData = useModelStatus(modelUUID);
  const isController = modelStatusData?.info?.["is-controller"];
  const isJuju = useAppSelector(getIsJuju);
  const { permitted: isJIMMControllerAdmin } = useIsJIMMAdmin();
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
            redirectOnDestroy={redirectOnDestroy}
          />
        </Portal>
      )}
      <ContextualMenu
        {...testId(TestId.MENU)}
        toggleAppearance="base"
        toggleClassName="u-no-margin--bottom is-dense"
        toggleLabel={
          <Icon
            name="contextual-menu"
            className="p-contextual-menu__indicator"
          />
        }
        toggleProps={{
          hasIcon: true,
          "aria-label": Label.TOGGLE,
        }}
        links={[
          ...(isJuju
            ? []
            : [
                {
                  children: Label.UPGRADE,
                  disabled: !isJIMMControllerAdmin,
                  onClick: (
                    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
                  ): void => {
                    event.stopPropagation();
                    setPanelQs(
                      {
                        modelName,
                        panel: "upgrade-model",
                        qualifier,
                      },
                      { replace: true },
                    );
                  },
                },
              ]),
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
            disabled: isController || !canConfigureModel,
            onClick: (event: React.MouseEvent<HTMLButtonElement>): void => {
              event.stopPropagation();
              openPortal(event);
            },
          },
        ]}
        position={position}
      />
    </>
  );
};

export default ModelActions;
