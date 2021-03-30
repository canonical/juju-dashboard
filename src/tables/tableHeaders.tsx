import type { ReactNode } from "react";

type Header = HeaderRow[];

type HeaderRow = {
  content: string | ReactNode;
  sortKey?: string;
  className?: string;
};

export const localApplicationTableHeaders: Header = [
  { content: "local apps", sortKey: "local-apps" },
  { content: "status", sortKey: "status" },
  { content: "version", className: "u-align--right", sortKey: "version" },
  { content: "scale", className: "u-align--right", sortKey: "scale" },
  { content: "store", sortKey: "store" },
  { content: "rev", className: "u-align--right", sortKey: "rev" },
  { content: "os", sortKey: "os" },
  { content: "notes", sortKey: "notes" },
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
  { content: "port", className: "u-align--right", sortKey: "port" },
  { content: "message", sortKey: "message" },
];

export const machineTableHeaders: Header = [
  { content: "machine", sortKey: "machine" },
  { content: "apps", sortKey: "apps" },
  { content: "state", sortKey: "state" },
  { content: "az", sortKey: "az" },
  { content: "instance id", sortKey: "instanceId" },
  { content: "message", sortKey: "message" },
];

export const relationTableHeaders: Header = [
  { content: "relation provider", sortKey: "provider" },
  { content: "requirer", sortKey: "requirer" },
  { content: "interface", sortKey: "interface" },
  { content: "type", sortKey: "type" },
  { content: "message", sortKey: "message" },
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
