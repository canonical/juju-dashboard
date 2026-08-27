import type { MainTableHeader } from "@canonical/react-components/dist/components/MainTable/MainTable";

import Status from "components/Status";
import type { ModelData } from "store/juju/types";
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

export const getLastUpdated = (
  model: ModelData,
): [string | undefined, string | undefined] => {
  // .slice(2) here will make the year 2 characters instead of 4
  // e.g. 2021-01-01 becomes 21-01-01
  const lastUpdated = model.info?.status?.since;
  return [lastUpdated, lastUpdated?.split("T")[0].slice(2)];
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

export enum SortKey {
  CLOUD = "cloud",
  CONTROLLER = "controller",
  CREDENTIAL = "credential",
  LAST_UPDATED = "lastUpdated",
  NAME = "name",
  OWNER = "owner",
  REGION = "region",
  STATUS = "status",
  SUMMARY = "summary",
}

/**
    Generates the table headers for the supplied table label.
    @param label The title of the table.
    @param count The number of elements in the status.
    @returns The headers for the table.
  */
export const generateTableHeaders = (
  label: string,
  count: number,
  options?: TableHeaderOptions,
): MainTableHeader[] => {
  const rows = [
    {
      content: options?.showHeaderStatus ? (
        <Status status={label} count={count} />
      ) : (
        `${label} (${count})`
      ),
      sortKey: SortKey.NAME,
    },
    { content: "", sortKey: SortKey.SUMMARY }, // The unit/machines/apps counts
    options?.showOwner ? { content: "Owner", sortKey: SortKey.OWNER } : null,
    options?.showStatus ? { content: "Status", sortKey: SortKey.STATUS } : null,
    options?.showCloud
      ? { content: "Cloud/Region", sortKey: SortKey.CLOUD }
      : { content: "Region", sortKey: SortKey.REGION },
    { content: "Credential", sortKey: SortKey.CREDENTIAL },
    { content: "Controller", sortKey: SortKey.CONTROLLER },
    {
      content: "Last Updated",
      sortKey: SortKey.LAST_UPDATED,
      className: "u-align--right",
    },
    {
      content: "Actions",
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
