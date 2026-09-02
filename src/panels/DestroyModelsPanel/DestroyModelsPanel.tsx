import { Accordion, Button } from "@canonical/react-components";
import type { FC } from "react";

import Panel from "components/Panel";
import { usePanelQueryParams } from "panels/hooks";
import { actions as jujuActions } from "store/juju";
import { getSelectedModelsForDestruction } from "store/juju/selectors";
import { useAppDispatch, useAppSelector } from "store/store";

import AccordionContent from "./AccordionContent/AccordionContent";
import AccordionTitle from "./AccordionTitle/AccordionTitle";

const DestroyModelsPanel: FC = () => {
  const dispatch = useAppDispatch();
  const selectedModels = useAppSelector(getSelectedModelsForDestruction);
  const [, , handleRemovePanelQueryParams] = usePanelQueryParams<{
    panel: null | string;
  }>({ panel: null });

  const handleClose = (): void => {
    dispatch(jujuActions.clearSelectedModelsForDestruction());
    handleRemovePanelQueryParams();
  };

  const modelWord = selectedModels.length === 1 ? "model" : "models";

  return (
    <Panel
      onRemovePanelQueryParams={handleClose}
      title={`Review ${selectedModels.length} ${modelWord}`}
      width="unset"
      contentClassName="no-indent u-no-padding--bottom"
      className="destroy-models-panel"
      drawer={
        <div className="destroy-models-panel__actions">
          <div className="u-align--left">{`0/${selectedModels.length} reviewed`}</div>
          <span>
            <Button
              appearance="base"
              className="u-no-margin--bottom"
              type="button"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              appearance="negative"
              className="u-no-margin--bottom"
              type="submit"
              disabled
            >
              Complete review & destroy
            </Button>
          </span>
        </div>
      }
    >
      <div className="destroy-models-panel__review-warning">
        By destroying {selectedModels.length} {modelWord} you will also be
        destroying all applications, machines and storage within. Review before
        continuing
      </div>
      <Accordion
        className="destroy-models-panel__accordion"
        expanded="model-0"
        sections={selectedModels.map(
          ({ modelUUID, modelName, isController }, index) => ({
            key: `model-${index}`,
            title: (
              <AccordionTitle
                modelUUID={modelUUID}
                modelName={modelName}
                isController={isController}
              />
            ),
            content: (
              <AccordionContent
                modelUUID={modelUUID}
                isController={isController}
              />
            ),
          }),
        )}
      />
    </Panel>
  );
};

export default DestroyModelsPanel;
