import { Button } from "@canonical/react-components";
import { useId, type FC } from "react";

import Panel from "components/Panel";
import { CharmsAndActionsPanelTestId } from "panels/CharmsAndActionsPanel";
import { testId } from "testing/utils";

import UpgradeModelPanelHeader from "../UpgradeModelPanelHeader";

import { Label } from "./types";

export type Props = {
  back: () => void;
  onRemovePanelQueryParams: () => void;
  version: string;
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
        <Button appearance="positive" onClick={onRemovePanelQueryParams}>
          {Label.SUBMIT}
        </Button>
      }
      header={
        <UpgradeModelPanelHeader
          titleId={titleId}
          version={version}
          back={back}
        />
      }
      onRemovePanelQueryParams={onRemovePanelQueryParams}
      titleId={titleId}
      {...testId(CharmsAndActionsPanelTestId.PANEL)}
    ></Panel>
  );
};

export default UpgradeModelController;
