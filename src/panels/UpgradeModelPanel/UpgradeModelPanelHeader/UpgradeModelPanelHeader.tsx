import { Button } from "@canonical/react-components";
import type { JSX } from "react";

import { usePanelQueryParams } from "panels/hooks";
import { getModelDataByUUID, getModelUUIDFromList } from "store/juju/selectors";
import { useAppSelector } from "store/store";
import { externalURLs } from "urls";

import type { QueryParams } from "../types";

import { Label } from "./types";

type Props = {
  back?: () => void;
  titleId: string;
  version?: string;
};

const UpgradeModelPanelHeader = ({
  back,
  titleId,
  version,
}: Props): JSX.Element => {
  const [{ modelName, qualifier }, _setQueryParams] =
    usePanelQueryParams<QueryParams>({
      panel: null,
      qualifier: null,
      modelName: null,
    });
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, qualifier),
  );
  const model = useAppSelector((state) => getModelDataByUUID(state, modelUUID));

  return (
    <div className="p-panel__header is-sticky u-flex-column">
      {back ? (
        <div>
          <Button
            appearance="link"
            className="u-no-margin--bottom"
            onClick={back}
          >
            &lt; {Label.BACK}
          </Button>
        </div>
      ) : null}
      <h4 className="p-panel__title u-no-padding" id={titleId}>
        {version && model ? (
          <>
            Upgrade {modelName} {model.model.version} &rarr; {version}
          </>
        ) : (
          Label.TITLE
        )}
      </h4>
      <div>
        <a
          href={externalURLs.modelUpgrade}
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn about model upgrades
        </a>
      </div>
    </div>
  );
};

export default UpgradeModelPanelHeader;
