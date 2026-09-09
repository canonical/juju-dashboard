import { Accordion, Button } from "@canonical/react-components";
import type { FC } from "react";

import Panel from "components/Panel";
import { usePanelQueryParams } from "panels/hooks";
import { actions as jujuActions } from "store/juju";
import { getSelectedModelsForDestruction } from "store/juju/selectors";
import { pluralize } from "store/juju/utils/models";
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

  const modelWord = pluralize(selectedModels.length, "model");
  const { reviewedCount, removedCount, destroyableCount } =
    selectedModels.reduce(
      (acc, { reviewed, removed }) => {
        if (removed) {
          acc.removedCount++;
        } else {
          acc.destroyableCount++;
          if (reviewed) {
            acc.reviewedCount++;
          }
        }
        return acc;
      },
      { reviewedCount: 0, removedCount: 0, destroyableCount: 0 },
    );

  return (
    <Panel
      onRemovePanelQueryParams={handleClose}
      title={`Review ${selectedModels.length} ${modelWord}`}
      width="unset"
      contentClassName="no-indent u-no-padding--bottom"
      className="destroy-models-panel"
      drawer={
        <div className="destroy-models-panel__actions">
          <div className="u-align--left">
            {`${reviewedCount}/${destroyableCount} Reviewed`}
            {removedCount > 0 ? `, ${removedCount} Removed.` : null}
          </div>
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
              disabled={destroyableCount === 0}
              onClick={() => {
                // TODO: open confirmation dialog
              }}
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
        sections={selectedModels.map(({ modelUUID, modelName }, index) => ({
          key: `model-${index}`,
          title: <AccordionTitle modelUUID={modelUUID} modelName={modelName} />,
          content: <AccordionContent modelUUID={modelUUID} />,
        }))}
      />
    </Panel>
  );
};

export default DestroyModelsPanel;
