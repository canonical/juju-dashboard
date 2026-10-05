import type { ModelDestructionData } from "hooks/useModelDestructionData";

export const isModelEmpty = (data: ModelDestructionData): boolean =>
  data.applications.length === 0 &&
  data.machines.length === 0 &&
  data.crossModelRelations.length === 0;
