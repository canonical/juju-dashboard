export enum ResourceType {
  APPLICATION = "Application",
  MODEL = "Model",
  MACHINE = "Machine",
  CROSS_MODEL_RELATION = "Cross model relation",
  STORAGE = "Attached storage",
}

export const resourceIconMap: Record<ResourceType, string> = {
  [ResourceType.APPLICATION]: "applications",
  [ResourceType.MODEL]: "models",
  [ResourceType.MACHINE]: "machines",
  [ResourceType.CROSS_MODEL_RELATION]: "get-link",
  [ResourceType.STORAGE]: "storage",
};

export type Props = {
  resourceType: ResourceType;
  resources: string[];
};
