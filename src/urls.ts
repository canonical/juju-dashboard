import { argPath } from "utils";

export type ModelTab = "apps" | "machines" | "integrations" | "action-logs";

const urls = {
  index: "/",
  controllers: "/controllers",
  model: {
    index: argPath<{ userName: string; modelName: string }>(
      "/models/:userName/:modelName"
    ),
    tab: argPath<{
      userName: string;
      modelName: string;
      tab: ModelTab;
    }>("/models/:userName/:modelName?activeView=:tab"),
    app: argPath<{ userName: string; modelName: string; appName: string }>(
      "/models/:userName/:modelName/app/:appName"
    ),
    machine: argPath<{
      userName: string;
      modelName: string;
      machineId: string;
    }>("/models/:userName/:modelName/machine/:machineId"),
    unit: argPath<{
      userName: string;
      modelName: string;
      appName: string;
      unitId: string;
    }>("/models/:userName/:modelName/app/:appName/unit/:unitId"),
  },
  models: "/models",
  settings: "/settings",
};

export default urls;
