import { Button } from "@canonical/react-components";
import { useId, type FC } from "react";

import Panel from "components/Panel";
import { CharmsAndActionsPanelTestId } from "panels/CharmsAndActionsPanel";
import { testId } from "testing/utils";

import UpgradeModelPanelHeader from "../UpgradeModelPanelHeader";
import type { Version } from "../types";

import { Label } from "./types";

export type Props = {
  back: () => void;
  onRemovePanelQueryParams: () => void;
  version: Version;
};

const UpgradeModelController: FC<Props> = ({
  back,
  onRemovePanelQueryParams,
  version,
}) => {
  const titleId = useId();
  return (
    <Panel
      animateMount={false}
      drawer={
        <>
          <Button
            appearance="base"
            className="u-no-margin--bottom"
            onClick={onRemovePanelQueryParams}
            type="button"
          >
            {Label.CANCEL}
          </Button>
          <Button
            appearance="positive"
            className="u-no-margin--bottom"
            onClick={onRemovePanelQueryParams}
          >
            {Label.SUBMIT}
          </Button>
        </>
      }
      header={
        <UpgradeModelPanelHeader
          titleId={titleId}
          version={version.version}
          back={back}
        />
      }
      onRemovePanelQueryParams={onRemovePanelQueryParams}
      titleId={titleId}
      width="unset"
      {...testId(CharmsAndActionsPanelTestId.PANEL)}
    ></Panel>
  );
};

export default UpgradeModelController;
