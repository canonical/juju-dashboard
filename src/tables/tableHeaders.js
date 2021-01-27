export const localApplicationTableHeaders = [
  { content: "local apps", sortKey: "local-apps" },
  { content: "status", sortKey: "status" },
  { content: "version", className: "u-align--right", sortKey: "version" },
  { content: "scale", className: "u-align--right", sortKey: "scale" },
  { content: "store", sortKey: "store" },
  { content: "rev", className: "u-align--right", sortKey: "rev" },
  { content: "os", sortKey: "os" },
  { content: "notes", sortKey: "notes" },
];

export const remoteApplicationTableHeaders = [
  { content: "remote apps", sortKey: "remote-apps" },
  { content: "status", sortKey: "status" },
  { content: "interface", sortKey: "interface" },
  { content: "offer url", sortKey: "offer-url" },
  { content: "store", sortKey: "store" },
];

export const unitTableHeaders = [
  { content: "unit", sortKey: "unit" },
  { content: "workload", sortKey: "workload" },
  { content: "agent", sortKey: "agent" },
  { content: "machine", className: "u-align--right", sortKey: "machine" },
  { content: "public address", sortKey: "publicAddress" },
  { content: "port", className: "u-align--right", sortKey: "port" },
  { content: "message", sortKey: "message" },
];

export const machineTableHeaders = [
  { content: "machine", sortKey: "machine" },
  { content: "apps", sortKey: "apps" },
  { content: "state", sortKey: "state" },
  { content: "az", sortKey: "az" },
  { content: "instance id", sortKey: "instanceId" },
  { content: "message", sortKey: "message" },
];

export const relationTableHeaders = [
  { content: "relation provider", sortKey: "provider" },
  { content: "requirer", sortKey: "requirer" },
  { content: "interface", sortKey: "interface" },
  { content: "type", sortKey: "type" },
  { content: "message", sortKey: "message" },
];

export const consumedTableHeaders = [
  { content: "consumed" },
  { content: "endpoint" },
  { content: "status" },
];

export const offersTableHeaders = [
  { content: "connected offers" },
  { content: "endpoints" },
  { content: "connections" },
];

export const appsOffersTableHeaders = [
  { content: "offers" },
  { content: "interface" },
  { content: "connection" },
  { content: "offer url" },
];

export const integrationLocalAppsHeaders = [
  { content: "local apps" },
  { content: "integration" },
];

export const integrationRemoteAppsHeaders = [
  { content: "remote apps" },
  { content: "integration" },
];
