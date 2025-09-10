import { ModelTab } from "urls";

export const getTab = (
  key: "applications" | "machines" | "offers" | "relations",
) => {
  switch (key) {
    case "applications":
    case "offers":
      return ModelTab.APPS;
    case "machines":
      return ModelTab.MACHINES;
    case "relations":
      return ModelTab.INTEGRATIONS;
    default:
      throw new Error(`unknown tab: ${key}`);
  }
};
