import { ModelTab } from "urls";

export const getTab = (key: string) => {
  switch (key) {
    case "applications":
    case "offers":
      return ModelTab.APPS;
    case "machines":
      return ModelTab.MACHINES;
    case "relations":
      return ModelTab.INTEGRATIONS;
    default:
      return;
  }
};
