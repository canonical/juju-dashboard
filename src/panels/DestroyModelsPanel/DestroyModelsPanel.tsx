import { Accordion, Button, usePortal } from "@canonical/react-components";
import type { FC } from "react";

import BulkDestroyModelDialog from "components/BulkDestroyModelDialog/BulkDestroyModelDialog";
import DestroyModelDialog from "components/DestroyModelDialog";
import Panel from "components/Panel";
import { usePanelQueryParams } from "panels/hooks";
import { actions as jujuActions } from "store/juju";
import { getSelectedModelsForDestruction } from "store/juju/selectors";
import { pluralize } from "store/juju/utils/models";
import { useAppDispatch, useAppSelector } from "store/store";
import { formatBulkDestructionData } from "utils/formatBulkDestructionData";

import AccordionContent from "./AccordionContent/AccordionContent";
import AccordionTitle from "./AccordionTitle/AccordionTitle";
import { Label } from "./types";

const DestroyModelsPanel: FC = () => {
  const dispatch = useAppDispatch();
  const selectedModels = useAppSelector(getSelectedModelsForDestruction);
  const [, , handleRemovePanelQueryParams] = usePanelQueryParams<{
    panel: null | string;
  }>({ panel: null });
  const {
    openPortal,
    closePortal,
    isOpen: showDestroyDialog,
    Portal,
  } = usePortal();

  const handleClose = (): void => {
    dispatch(jujuActions.clearSelectedModelsForDestruction());
    handleRemovePanelQueryParams();
  };

  const modelWord = pluralize(selectedModels.length, "model");
  const { destroyable, skipped, reviewed } =
    formatBulkDestructionData(selectedModels);

  return (
    <>
      {showDestroyDialog && (
        <Portal>
          {destroyable.length === 1 ? (
            <DestroyModelDialog
              modelName={destroyable[0].modelName}
              modelUUID={destroyable[0].modelUUID}
              closePortal={closePortal}
              afterConfirmClicked={handleClose}
              cancelButtonLabel="Back to review"
            />
          ) : (
            <BulkDestroyModelDialog
              closePortal={closePortal}
              afterConfirmClicked={handleClose}
            />
          )}
        </Portal>
      )}
      <Panel
        onRemovePanelQueryParams={handleClose}
        checkCanClose={() => !showDestroyDialog}
        title={`Review ${selectedModels.length} ${modelWord}`}
        width="unset"
        contentClassName="no-indent u-no-padding--bottom"
        className="destroy-models-panel"
        drawer={
          <div className="destroy-models-panel__actions">
            <div className="u-align--left">
              {`${reviewed.length}/${destroyable.length} Reviewed`}
              {skipped.length > 0 ? `, ${skipped.length} Skipped.` : null}
            </div>
            <span>
              <Button
                appearance="base"
                className="u-no-margin--bottom"
                type="button"
                onClick={handleClose}
              >
                {Label.CANCEL}
              </Button>
              <Button
                appearance="negative"
                className="u-no-margin--bottom"
                type="submit"
                disabled={destroyable.length === 0}
                onClick={openPortal}
              >
                {Label.COMPLETE_REVIEW_DESTROY}
              </Button>
            </span>
          </div>
        }
      >
        <div className="destroy-models-panel__review-warning">
          By destroying {selectedModels.length} {modelWord} you will also be
          destroying all applications, machines and storage within. Review
          before continuing
        </div>
        <Accordion
          className="destroy-models-panel__accordion"
          expanded="model-0"
          sections={selectedModels.map(({ modelUUID, modelName }, index) => ({
            key: `model-${index}`,
            title: (
              <AccordionTitle modelUUID={modelUUID} modelName={modelName} />
            ),
            content: <AccordionContent modelUUID={modelUUID} />,
          }))}
        />
      </Panel>
    </>
  );
};

export default DestroyModelsPanel;
