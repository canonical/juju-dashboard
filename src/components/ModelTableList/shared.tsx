import type { MainTableHeader } from "@canonical/react-components/dist/components/MainTable/MainTable";

import Status from "components/Status";
import type { Controllers, ModelData } from "store/juju/types";
import {
  extractCloudName,
  extractCredentialName,
} from "store/juju/utils/models";

export const getCloudName = (model: ModelData) =>
  extractCloudName(model.model["cloud-tag"]);

export const getRegion = (model: ModelData) => model.model.region;

export const getCredential = (model: ModelData) =>
  extractCredentialName(model.info?.["cloud-credential-tag"]);

export const getControllerUUID = (model: ModelData) =>
  model.info?.["controller-uuid"];

export const getControllerName = (
  model: ModelData,
  controllers?: Controllers | null
) => {
  const controllerUUID = getControllerUUID(model);
  let controllerName: string | null = null;
  Object.entries(controllers ?? {}).some(
    (controller) =>
      !!controller[1].some((controller) => {
        if ("uuid" in controller && controllerUUID === controller.uuid) {
          controllerName =
            "name" in controller ? controller.name ?? null : controller.path;
        }
        return !!controllerName;
      })
  );
  return controllerName ?? controllerUUID;
};

export const getLastUpdated = (model: ModelData) => {
  // .slice(2) here will make the year 2 characters instead of 4
  // e.g. 2021-01-01 becomes 21-01-01
  return model.info?.status?.since?.split("T")[0].slice(2);
};

/**
  Returns the model cloud and region data formatted as {cloud}/{region}.
  @param model The model data
  @returns The formatted cloud and region data.
*/
export function generateCloudAndRegion(model: ModelData) {
  return `${getCloudName(model)}/${getRegion(model)}`;
}

export type TableHeaderOptions = {
  showCloud?: boolean;
  showOwner?: boolean;
  showStatus?: boolean;
  showHeaderStatus?: boolean;
};

/**
    Generates the table headers for the supplied table label.
    @param label The title of the table.
    @param count The number of elements in the status.
    @returns The headers for the table.
  */
export const generateTableHeaders = (
  label: string,
  count: number,
  options?: TableHeaderOptions
) => {
  const rows = [
    {
      content: options?.showHeaderStatus ? (
        <Status status={label} count={count} />
      ) : (
        `${label} (${count})`
      ),
      sortKey: "name",
    },
    { content: "", sortKey: "summary" }, // The unit/machines/apps counts
    options?.showOwner ? { content: "Owner", sortKey: "owner" } : null,
    options?.showStatus ? { content: "Status", sortKey: "status" } : null,
    options?.showCloud
      ? { content: "Cloud/Region", sortKey: "cloud" }
      : { content: "Region", sortKey: "region" },
    { content: "Credential", sortKey: "credential" },
    { content: "Controller", sortKey: "controller" },
    {
      content: "Last Updated",
      sortKey: "lastUpdated",
      className: "u-align--right",
    },
  ];
  // Remove any null headers that aren't being shown.
  return rows.reduce<MainTableHeader[]>((headers, row) => {
    if (row) {
      headers.push(row);
    }
    return headers;
  }, []);
};
