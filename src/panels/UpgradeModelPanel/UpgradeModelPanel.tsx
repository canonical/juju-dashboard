import type { FC } from "react";
import { useState } from "react";

import useModelMigrationData from "hooks/useModelMigrationData";
import type { VersionElem } from "juju/jimm/JIMMV4";
import { usePanelQueryParams } from "panels/hooks";

import UpgradeModelController from "./UpgradeModelController";
import UpgradeModelVersion from "./UpgradeModelVersion";
import type { QueryParams } from "./types";

const UpgradeModelPanel: FC = () => {
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
  useModelMigrationData(modelName, qualifier);

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
