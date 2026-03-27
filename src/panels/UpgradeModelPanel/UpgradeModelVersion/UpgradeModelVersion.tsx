import { Button } from "@canonical/react-components";
import { useId, type FC } from "react";

import Panel from "components/Panel";
import { testId } from "testing/utils";

import UpgradeModelPanelHeader from "../UpgradeModelPanelHeader";
import { UpgradeModelPanelTestId } from "../index";

import { Label } from "./types";

type Props = {
  onRemovePanelQueryParams: () => void;
  setVersion: (version: string) => void;
  firstRender: boolean;
};

const UpgradeModelVersion: FC<Props> = ({
  onRemovePanelQueryParams,
  setVersion,
  firstRender,
}) => {
  const titleId = useId();
  return (
    <Panel
      animateMount={firstRender}
      drawer={
        <Button
          onClick={() => {
            setVersion("4.5.6");
          }}
        >
          {Label.SUBMIT}
        </Button>
      }
      header={<UpgradeModelPanelHeader titleId={titleId} />}
      onRemovePanelQueryParams={onRemovePanelQueryParams}
      titleId={titleId}
      {...testId(UpgradeModelPanelTestId.PANEL)}
    ></Panel>
  );
};

export default UpgradeModelVersion;
