import cloneDeep from "clone-deep";
import type { ReactNode } from "react";

export type Header = HeaderRow[];

type HeaderRow = {
  content: ReactNode | string;
  sortKey?: string;
  className?: string;
};

export const generateLocalApplicationTableHeaders = (
  multipleApps = true,
): Header => [
  { content: `local app${multipleApps ? "s" : ""}`, sortKey: "local-apps" },
  { content: "status", sortKey: "status" },
  { content: "version", sortKey: "version" },
  { content: "scale", className: "u-align--right", sortKey: "scale" },
  { content: "store", sortKey: "store" },
  { content: "rev", className: "u-align--right", sortKey: "rev" },
  { content: "message", sortKey: "message" },
];

export const remoteApplicationTableHeaders: Header = [
  { content: "remote apps", sortKey: "remote-apps" },
  { content: "status", sortKey: "status" },
  { content: "interface", sortKey: "interface" },
  { content: "offer url", sortKey: "offer-url" },
  { content: "store", sortKey: "store" },
];

export const unitTableHeaders: Header = [
  { content: "unit", sortKey: "unit" },
  { content: "workload", sortKey: "workload" },
  { content: "agent", sortKey: "agent" },
  { content: "machine", className: "u-align--right", sortKey: "machine" },
  { content: "public address", sortKey: "publicAddress" },
  { content: "ports", className: "u-align--right", sortKey: "ports" },
  { content: "message", sortKey: "message" },
];

export const generateSelectableUnitTableHeaders = (
  selectContent: HeaderRow | null,
  removeMachines: boolean,
): Header => {
  let headers = cloneDeep(unitTableHeaders);
  if (removeMachines) {
    headers = headers.filter((header) => !(header.sortKey === "machine"));
  }
  if (selectContent) {
    headers.splice(0, 0, selectContent);
  }
  return headers;
};

export const machineTableHeaders: Header = [
  { content: "machine", sortKey: "machine" },
  { content: "apps", sortKey: "apps" },
  {
    className: "p-table__cell--icon-placeholder",
    content: "state",
    sortKey: "state",
  },
  { content: "az", sortKey: "az" },
  { content: "instance id", sortKey: "instanceId" },
  { content: "message", sortKey: "message" },
];

export const relationTableHeaders: Header = [
  { content: "relation provider", sortKey: "provider" },
  { content: "requirer", sortKey: "requirer" },
  { content: "interface", sortKey: "interface" },
  { content: "type", sortKey: "type" },
];

export const consumedTableHeaders: Header = [
  { content: "consumed" },
  { content: "endpoint" },
  { content: "status" },
];

export const offersTableHeaders: Header = [
  { content: "connected offers" },
  { content: "endpoints" },
  { content: "connections" },
];

export const appsOffersTableHeaders: Header = [
  { content: "offers" },
  { content: "interface" },
  { content: "connection" },
  { content: "offer url" },
];
