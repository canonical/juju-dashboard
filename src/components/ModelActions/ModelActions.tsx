import type { ContextualMenuDropdownProps } from "@canonical/react-components";
import { Button, Tooltip } from "@canonical/react-components";
import {
  ContextualMenu,
  Icon,
  Spinner,
  usePortal,
} from "@canonical/react-components";
import type { ReactNode } from "react";
import { useState, type FC } from "react";
import { Link } from "react-router";

import DestroyModelDialog from "components/DestroyModelDialog";
import useCanAccessReBACAdmin from "hooks/useCanAccessReBACAdmin";
import { useCanConfigureModelWithUUID } from "hooks/useCanConfigureModel";
import useModelMigrationData from "hooks/useModelMigrationData";
import useModelStatus from "hooks/useModelStatus";
import type { SetParams } from "hooks/useQueryParams";
import { useQueryParams } from "hooks/useQueryParams";
import { useIsJIMMAdmin } from "juju/api-hooks/permissions";
import { getIsJuju } from "store/general/selectors";
import {
  getModelUpgradeDataLoaded,
  getModelUpgradeVersions,
  getHighestSupportedVersion,
  getNextSupportedVersion,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";
import { testId } from "testing/utils";
import { rebacURLS } from "urls";

import { Label, TestId, type Props } from "./types";

type QueryParams = {
  model: null | string;
  modelName: null | string;
  panel: null | string;
  qualifier: null | string;
};

const generateLinks = (
  canConfigureModel: boolean,
  isController: boolean | undefined,
  isJIMMControllerAdmin: boolean,
  isJuju: boolean | undefined,
  modelName: null | string,
  openPortal: (
    event?: React.SyntheticEvent<HTMLElement, Event> | undefined,
  ) => void,
  qualifier: null | string,
  setPanelQs: SetParams<QueryParams>,
  hasUpgrades: boolean,
  upgradeDataLoaded: boolean,
  rebacAllowed: boolean,
  isLatest: boolean,
  nextVersion: string | undefined,
  handleClose: NonNullable<ContextualMenuDropdownProps["handleClose"]>,
): React.JSX.Element => {
  const upgradeButton: ReactNode = isJuju ? null : (
    <Button
      className="p-contextual-menu__link"
      disabled={!isJIMMControllerAdmin || !hasUpgrades}
      role="menuitem"
      onClick={(event) => {
        event.stopPropagation();
        handleClose(event);
        setPanelQs(
          {
            modelName,
            panel: "upgrade-model",
            qualifier,
          },
          { replace: true },
        );
      }}
    >
      {Label.UPGRADE}
      {upgradeDataLoaded ? null : <Spinner className="u-sh1" />}
    </Button>
  );
  let upgradeTooltip: null | string = null;
  if (upgradeDataLoaded && !hasUpgrades) {
    if (isLatest) {
      upgradeTooltip = Label.UPGRADE_LATEST;
    } else if (nextVersion) {
      upgradeTooltip = `No upgrade available. Bootstrap a controller >=${nextVersion} version first, to enable upgrades.`;
    }
  }
  return (
    <>
      {upgradeTooltip ? (
        <Tooltip message={upgradeTooltip}>{upgradeButton}</Tooltip>
      ) : (
        upgradeButton
      )}
      <Button
        className="p-contextual-menu__link"
        disabled={!canConfigureModel || (!isJuju && !rebacAllowed)}
        role="menuitem"
        {...(isJuju
          ? {
              onClick: (
                event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
              ): void => {
                event.stopPropagation();
                handleClose(event);
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
            })}
      >
        {Label.ACCESS}
      </Button>
      <Button
        className="p-contextual-menu__link"
        disabled={isController || !canConfigureModel}
        role="menuitem"
        onClick={(event) => {
          event.stopPropagation();
          handleClose(event);
          openPortal(event);
        }}
      >
        {Label.DESTROY}
      </Button>
    </>
  );
};

const ModelActions: FC<Props> = ({
  modelName,
  modelUUID,
  redirectOnDestroy,
  position,
  qualifier,
}: Props) => {
  const [fetchUpgrades, setFetchUpgrades] = useState(false);
  const [_panelQs, setPanelQs] = useQueryParams<QueryParams>({
    model: null,
    modelName: null,
    panel: null,
    qualifier: null,
  });
  const canConfigureModel = useCanConfigureModelWithUUID(false, modelUUID);
  const modelStatusData = useModelStatus(modelUUID);
  const isController = modelStatusData?.info?.["is-controller"];
  const isJuju = useAppSelector(getIsJuju);
  const upgrades = useAppSelector((state) =>
    getModelUpgradeVersions(state, modelUUID),
  );
  const modelVersion = modelStatusData?.model.version;
  const nextVersion = useAppSelector((state) =>
    getNextSupportedVersion(state, modelVersion),
  );
  const highestVersion = useAppSelector(getHighestSupportedVersion);
  const isLatest =
    !!highestVersion?.version && highestVersion.version === modelVersion;
  const upgradeDataLoaded = useAppSelector((state) =>
    getModelUpgradeDataLoaded(state, modelUUID),
  );
  const hasUpgrades = !!upgrades.length;
  const rebacAllowed = useCanAccessReBACAdmin();
  const { permitted: isJIMMControllerAdmin } = useIsJIMMAdmin();
  const {
    openPortal,
    closePortal,
    isOpen: showDestroyModel,
    Portal,
  } = usePortal();
  useModelMigrationData(modelName, qualifier, fetchUpgrades);

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
        onToggleMenu={setFetchUpgrades}
        children={(handleClose) =>
          generateLinks(
            canConfigureModel,
            isController,
            isJIMMControllerAdmin,
            isJuju,
            modelName,
            openPortal,
            qualifier,
            setPanelQs,
            hasUpgrades,
            upgradeDataLoaded,
            rebacAllowed,
            isLatest,
            nextVersion?.version,
            handleClose,
          )
        }
        position={position}
      />
    </>
  );
};

export default ModelActions;
