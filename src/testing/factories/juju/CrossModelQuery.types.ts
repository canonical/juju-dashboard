export type CrossModelQuery = {
  "application-endpoints"?: Record<string, ApplicationEndpoint>;
  applications?: Record<string, Application>;
  controller?: {
    imestamp?: string;
    [key: string]: unknown;
  };
  machines?: Record<string, Machine>;
  model?: Model;
  offers?: Record<string, Offer>;
  storage?: Record<string, unknown>;
  [key: string]: unknown;
};

type ApplicationEndpoint = {
  "application-status"?: Status;
  endpoints?: Record<string, Endpoint>;
  relations?: Record<string, string[]>;
  url?: string;
  [key: string]: unknown;
};

type Endpoint = {
  interface?: string;
  role?: string;
  [key: string]: unknown;
};

export type Application = {
  "application-status"?: Status;
  base?: Base;
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
  units?: Record<string, Unit>;
  [key: string]: unknown;
};

type Base = {
  channel?: string;
  name?: string;
  [key: string]: unknown;
};

export type Unit = {
  "juju-status"?: Status;
  machine?: string;
  "public-address"?: string;
  "workload-status"?: Status;
  [key: string]: unknown;
};

type Status = {
  current?: string;
  message?: string;
  since?: string;
  [key: string]: unknown;
};

export type Machine = {
  base?: Base;
  constraints?: string;
  containers?: Record<string, Container>;
  "dns-name"?: string;
  hardware?: string;
  "instance-id"?: string;
  "ip-addresses"?: string[];
  "juju-status"?: Status;
  "machine-status"?: Status;
  "modification-status"?: Status;
  [key: string]: unknown;
};

type Container = {
  base?: Base;
  "instance-id"?: string;
  "juju-status"?: Status;
  "machine-status"?: Status;
  "modification-status"?: Status;
  [key: string]: unknown;
};

export type Model = {
  cloud?: string;
  controller?: string;
  "model-status"?: Status;
  name?: string;
  region?: string;
  sla?: string;
  type?: string;
  version?: string;
  [key: string]: unknown;
};

type Offer = {
  application?: string;
  charm?: string;
  endpoints?: Record<string, Endpoint>;
  "total-connected-count"?: number;
  [key: string]: unknown;
};
