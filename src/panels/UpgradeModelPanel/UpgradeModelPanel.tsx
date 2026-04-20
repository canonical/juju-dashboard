import type { FC } from "react";
import { useEffect, useState } from "react";

import type { VersionElem } from "juju/jimm/JIMMV4";
import { usePanelQueryParams } from "panels/hooks";
import { getWSControllerURL } from "store/general/selectors";
import { getModelUUIDFromList } from "store/juju/selectors";
import jimmSupportedVersions from "store/middleware/source/jimm-supported-versions";
import modelMigrationTargets from "store/middleware/source/migration-targets";
import { useAppDispatch, useAppSelector } from "store/store";

import UpgradeModelController from "./UpgradeModelController";
import UpgradeModelVersion from "./UpgradeModelVersion";
import type { QueryParams } from "./types";

const UpgradeModelPanel: FC = () => {
  const dispatch = useAppDispatch();
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const [version, setVersion] = useState<null | VersionElem>(null);
  const [restarted, setRestarted] = useState(false);
  const [
    { qualifier, modelName },
    _setQueryParams,
    handleRemovePanelQueryParams,
  ] = usePanelQueryParams<QueryParams>({
    panel: null,
    qualifier: null,
    modelName: null,
  });
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, qualifier),
  );

  useEffect(() => {
    if (wsControllerURL) {
      dispatch(jimmSupportedVersions.actions.start({ wsControllerURL }));
      if (modelUUID) {
        dispatch(
          modelMigrationTargets.actions.start({ modelUUID, wsControllerURL }),
        );
      }
    }
    return (): void => {
      if (wsControllerURL) {
        dispatch(jimmSupportedVersions.actions.stop({ wsControllerURL }));
        if (modelUUID) {
          dispatch(
            modelMigrationTargets.actions.stop({ modelUUID, wsControllerURL }),
          );
        }
      }
    };
  }, [dispatch, modelUUID, wsControllerURL]);

  return (
    <>
      {version ? (
        <UpgradeModelController
          back={() => {
            // Record whether the first step is being shown for a second time, so that it can
            // disable the panel from animating into view.
            setRestarted(true);
            setVersion(null);
          }}
          modelName={modelName}
          onRemovePanelQueryParams={handleRemovePanelQueryParams}
          version={version}
          qualifier={qualifier}
        />
      ) : (
        <UpgradeModelVersion
          onRemovePanelQueryParams={handleRemovePanelQueryParams}
          setVersion={setVersion}
          firstRender={!restarted}
          qualifier={qualifier}
          modelName={modelName}
        />
      )}
    </>
  );
};

export default UpgradeModelPanel;
