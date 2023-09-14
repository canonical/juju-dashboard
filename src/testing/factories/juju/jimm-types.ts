export type CrossModelQuery = {
  "application-endpoints"?: Record<string, CrossModelQueryApplicationEndpoint>;
  applications?: Record<string, CrossModelQueryApplication>;
  controller?: CrossModelQueryController;
  machines?: Record<string, CrossModelQueryMachine>;
  model?: CrossModelQueryModel;
  offers?: Record<string, CrossModelQueryOffer>;
  storage?: Record<string, unknown>;
  [key: string]: unknown;
};

export type CrossModelQueryApplicationEndpoint = {
  "application-status"?: CrossModelQueryStatus;
  endpoints?: Record<string, CrossModelQueryEndpoint>;
  relations?: Record<string, string[]>;
  url?: string;
  [key: string]: unknown;
};

export type CrossModelQueryEndpoint = {
  interface?: string;
  role?: string;
  [key: string]: unknown;
};

export type CrossModelQueryApplication = {
  "application-status"?: CrossModelQueryStatus;
  base?: CrossModelQueryBase;
  charm?: string;
  "charm-channel"?: string;
  "charm-name"?: string;
  "charm-origin"?: string;
  "charm-rev"?: number;
  "charm-version"?: string;
  "endpoint-bindings"?: Record<string, string>;
  exposed?: boolean;
  relations?: Record<string, string[]>;
  "subordinate-to"?: string[];
  units?: Record<string, CrossModelQueryUnit>;
  [key: string]: unknown;
};

export type CrossModelQueryBase = {
  channel?: string;
  name?: string;
  [key: string]: unknown;
};

export type CrossModelQueryUnit = {
  "juju-status"?: CrossModelQueryStatus;
  machine?: string;
  "public-address"?: string;
  "workload-status"?: CrossModelQueryStatus;
  [key: string]: unknown;
};

export type CrossModelQueryStatus = {
  current?: string;
  message?: string;
  since?: string;
  [key: string]: unknown;
};

export type CrossModelQueryController = {
  timestamp?: string;
  [key: string]: unknown;
};

export type CrossModelQueryMachine = {
  base?: CrossModelQueryBase;
  constraints?: string;
  containers?: Record<string, CrossModelQueryContainer>;
  "dns-name"?: string;
  hardware?: string;
  "instance-id"?: string;
  "ip-addresses"?: string[];
  "juju-status"?: CrossModelQueryStatus;
  "machine-status"?: CrossModelQueryStatus;
  "modification-status"?: CrossModelQueryStatus;
  [key: string]: unknown;
};

export type CrossModelQueryContainer = {
  base?: CrossModelQueryBase;
  "instance-id"?: string;
  "juju-status"?: CrossModelQueryStatus;
  "machine-status"?: CrossModelQueryStatus;
  "modification-status"?: CrossModelQueryStatus;
  [key: string]: unknown;
};

export type CrossModelQueryModel = {
  cloud?: string;
  controller?: string;
  "model-status"?: CrossModelQueryStatus;
  name?: string;
  region?: string;
  sla?: string;
  type?: string;
  version?: string;
  [key: string]: unknown;
};

export type CrossModelQueryOffer = {
  application?: string;
  charm?: string;
  endpoints?: Record<string, CrossModelQueryEndpoint>;
  "total-connected-count"?: number;
  [key: string]: unknown;
};
