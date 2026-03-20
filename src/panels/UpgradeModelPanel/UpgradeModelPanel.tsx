import type { FC } from "react";
import { useState } from "react";

import { usePanelQueryParams } from "panels/hooks";

import UpgradeModelController from "./UpgradeModelController";
import UpgradeModelVersion from "./UpgradeModelVersion";
import type { QueryParams } from "./types";

const UpgradeModelPanel: FC = () => {
  // TODO: this needs to be updated to store the chosen version as an object once the API has been implemented.
  const [version, setVersion] = useState<null | string>(null);
  const [restarted, setRestarted] = useState(false);
  const [_queryParams, _setQueryParams, handleRemovePanelQueryParams] =
    usePanelQueryParams<QueryParams>({
      panel: null,
      qualifier: null,
      modelName: null,
    });

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
          onRemovePanelQueryParams={handleRemovePanelQueryParams}
          version={version}
        />
      ) : (
        <UpgradeModelVersion
          onRemovePanelQueryParams={handleRemovePanelQueryParams}
          setVersion={setVersion}
          firstRender={!restarted}
        />
      )}
    </>
  );
};

export default UpgradeModelPanel;
