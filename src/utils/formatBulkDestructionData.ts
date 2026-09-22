import type { ModelSelectionParams } from "store/juju/types";

type BulkDestructionData = {
  destroyable: ModelSelectionParams[];
  skipped: ModelSelectionParams[];
  reviewed: ModelSelectionParams[];
};

export const formatBulkDestructionData = (
  selectedModels: ModelSelectionParams[],
): BulkDestructionData =>
  selectedModels.reduce<BulkDestructionData>(
    (acc, model) => {
      if (model.skipped) {
        acc.skipped.push(model);
      } else {
        acc.destroyable.push(model);
        if (model.reviewed) {
          acc.reviewed.push(model);
        }
      }
      return acc;
    },
    { destroyable: [], skipped: [], reviewed: [] },
  );
