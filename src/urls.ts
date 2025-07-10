import { urls as generateReBACURLS } from "@canonical/rebac-admin";

import { argPath } from "utils";

export enum ModelTab {
  APPS = "apps",
  MACHINES = "machines",
  INTEGRATIONS = "integrations",
  LOGS = "logs",
  SECRETS = "secrets",
}

export type AppTab = "machines" | "units";
export type ModelsGroupedBy = "status" | "cloud" | "owner";

const urls = {
  index: "/",
  controllers: "/controllers",
  model: {
    index: argPath<{ userName: string; modelName: string }>(
      "/models/:userName/:modelName",
    ),
    tab: argPath<{
      userName: string;
      modelName: string;
      tab: ModelTab;
    }>("/models/:userName/:modelName?activeView=:tab"),
    app: {
      index: argPath<{ userName: string; modelName: string; appName: string }>(
        "/models/:userName/:modelName/app/:appName",
      ),
      tab: argPath<{
        userName: string;
        modelName: string;
        appName: string;
        tab: AppTab;
      }>("/models/:userName/:modelName/app/:appName?tableView=:tab"),
    },
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
  models: {
    index: "/models",
    group: argPath<{
      groupedby: ModelsGroupedBy;
    }>("/models?groupedby=:groupedby"),
  },
  logs: "/logs",
  permissions: "/permissions",
  search: "/search",
};

export const externalURLs = {
  addModel:
    "https://documentation.ubuntu.com/juju/latest/howto/manage-models/#heading--add-a-model",
  cliHelp:
    "https://documentation.ubuntu.com/juju/latest/reference/juju-web-cli/",
  cliHelpCommand: (command: string) =>
    `https://documentation.ubuntu.com/juju/latest/reference/juju-cli/list-of-juju-cli-commands/${command.replace(/^\//, "")}`,
  deployingApplication:
    "https://documentation.ubuntu.com/juju/latest/howto/manage-applications/#deploy-an-application",
  machine: "https://documentation.ubuntu.com/juju/latest/reference/machine/",
  manageAccess:
    "https://documentation.ubuntu.com/juju/latest/howto/manage-users/index.html#manage-access-at-the-controller-model-application-or-offer-level",
  modelAccess:
    "https://documentation.ubuntu.com/juju/latest/howto/manage-users/#heading--model-access",
  newIssue: "https://github.com/canonical/juju-dashboard/issues/new",
  troubleshootDeployment:
    "https://documentation.ubuntu.com/juju/latest/howto/manage-your-deployment/index.html#troubleshoot-your-deployment",
  upgradingThings:
    "https://documentation.ubuntu.com/juju/latest/reference/upgrading-things/",
};

export const rebacURLS = generateReBACURLS(urls.permissions);

export default urls;
