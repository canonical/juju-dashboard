import type { MainTableHeader } from "@canonical/react-components/dist/components/MainTable/MainTable";

import Status from "components/Status";
import type { Controllers, ModelData } from "store/juju/types";
import {
  extractCloudName,
  extractCredentialName,
} from "store/juju/utils/models";

export const getCloudName = (model: ModelData): string =>
  extractCloudName(model.model["cloud-tag"]);

export const getRegion = (model: ModelData): string | undefined =>
  model.model.region;

export const getCredential = (model: ModelData): string =>
  extractCredentialName(model.info?.["cloud-credential-tag"]);

export const getControllerUUID = (model: ModelData): string | undefined =>
  model.info?.["controller-uuid"];

export const getControllerName = (
  model: ModelData,
  controllers?: Controllers | null,
): string | undefined => {
  const controllerUUID = getControllerUUID(model);
  let controllerName: null | string = null;
  Object.entries(controllers ?? {}).some(
    (controller) =>
      !!controller[1].some((controllerData) => {
        if (
          "uuid" in controllerData &&
          controllerUUID === controllerData.uuid
        ) {
          controllerName =
            "name" in controllerData
              ? (controllerData.name ?? null)
              : controllerData.path;
        }
        return Boolean(controllerName);
      }),
  );
  return controllerName ?? controllerUUID;
};

export const getLastUpdated = (model: ModelData): string | undefined => {
  // .slice(2) here will make the year 2 characters instead of 4
  // e.g. 2021-01-01 becomes 21-01-01
  return model.info?.status?.since?.split("T")[0].slice(2);
};

/**
  Returns the model cloud and region data formatted as {cloud}/{region}.
  @param model The model data
  @returns The formatted cloud and region data.
*/
export function generateCloudAndRegion(model: ModelData): string {
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
  options: null | TableHeaderOptions = null,
): MainTableHeader[] => {
  const rows = [
    {
      content:
        options !== null && Boolean(options.showHeaderStatus) ? (
          <Status status={label} count={count} />
        ) : (
          `${label} (${count})`
        ),
      sortKey: "name",
    },
    { content: "", sortKey: "summary" }, // The unit/machines/apps counts
    options !== null && Boolean(options?.showOwner)
      ? { content: "Owner", sortKey: "owner" }
      : null,
    options !== null && Boolean(options?.showStatus)
      ? { content: "Status", sortKey: "status" }
      : null,
    options !== null && Boolean(options?.showCloud)
      ? { content: "Cloud/Region", sortKey: "cloud" }
      : { content: "Region", sortKey: "region" },
    { content: "Credential", sortKey: "credential" },
    { content: "Controller", sortKey: "controller" },
    {
      content: "Last Updated",
      sortKey: "lastUpdated",
      className: "u-align--right",
    },
    {
      content: "Actions",
      sortKey: "actions",
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
