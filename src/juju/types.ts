// See https://github.com/juju/juju/blob/develop/apiserver/params/multiwatcher.go
// for the Juju types for the AllWatcher responses.

export interface ModelWatcherData {
  [uuid: string]: ModelData;
}

export type AllWatcherDelta =
  | ["action", "change", ActionChangeDelta]
  | ["unit", "change", UnitChangeDelta]
  | ["machine", "change", MachineChangeDelta]
  | ["model", "change", ModelChangeDelta]
  | ["relation", "change", RelationChangeDelta];

interface ModelData {
  applications: Applications;
}

interface Applications {
  name: string;
}

// Shared Types

type IPAddress = string;
type UnitId = string;
type NumberAsString = string;
type Life = "alive" | "dead" | "dying";
type ISO8601Date = string;
type DeprecatedString = string;
interface Status {
  // See https://github.com/juju/juju/blob/develop/core/status/status.go
  // For the possible status values for `current`.
  // Possible statuses differ by entity type.
  current: string;
  message: string;
  since: ISO8601Date;
  version: string;
  data: { [key: string]: any };
  err?: string;
}

// Delta Types

interface ActionChangeDelta {
  "model-uuid": string;
  id: NumberAsString;
  receiver: UnitId;
  name: string;
  status: "failed" | string; // xxx what are the other values?
  message: string;
  results: {
    Code: NumberAsString;
    Stderr: string;
    // xxx what other keys are possible?
  };
  enqueued: ISO8601Date;
  started: ISO8601Date;
  completed: ISO8601Date;
}

interface MachineChangeDelta {
  addresses: AddressData | null;
  "agent-status": MachineAgentStatus;
  "container-type": string; // xxx typically empty? What can this contain?
  "hardware-characteristics": HardwareCharacteristics | undefined;
  "has-vote": boolean;
  id: NumberAsString;
  "instance-id": string;
  "instance-status": MachineAgentStatus;
  jobs: string[]; // xxx [ "JobHostUnits" ] what else can this be?
  life: Life;
  "model-uuid": string;
  series: string;
  "supported-containers": null; // xxx what are other valid values for this?
  "supported-containers-known": boolean;
  "wants-vote": boolean;
}

interface MachineAgentStatus extends Status {
  current: "down" | "error" | "pending" | "started" | "stopped";
}

interface AddressData {
  value: IPAddress;
  type: "ipv4" | string;
  scope: "public" | "local-cloud" | "local-cloud" | "local-machine" | string;
}

interface HardwareCharacteristics {
  arch: string;
  mem: number;
  "root-disk": number;
  "cpu-cores": number;
  "cpu-power": number;
  "availability-zone": string;
}

interface ModelChangeDelta {
  "model-uuid": string;
  name: string;
  life: Life;
  owner: string;
  "controller-uuid": string;
  "is-controller": boolean;
  config: { [key: string]: string | boolean };
  status: ModelAgentStatus;
  constraints: { [key: string]: any };
  sla: {
    level: string;
    owner: string;
  };
}

interface ModelAgentStatus extends Status {
  current: "available" | "busy";
}

interface RelationChangeDelta {
  "model-uuid": string;
  key: string;
  id: number;
  endpoints: Endpoint[];
}

interface Endpoint {
  "application-name": string;
  relation: {
    name: string;
    role: "peer" | "requirer" | "provider";
    interface: string;
    optional: boolean;
    limit: number;
    scope: "global" | string; // xxx other possible values? "container"?
  };
}

interface UnitChangeDelta {
  "agent-status": UnitAgentStatus;
  "charm-url": string; // xxx will this no longer be populated with CH?
  "machine-id": NumberAsString;
  "model-uuid": string;
  "port-ranges": null; // xxx what do real values look like?
  "private-address": DeprecatedString;
  "public-address": DeprecatedString;
  "workload-status": WorkloadStatus;
  application: string;
  life: Life;
  name: string;
  ports: string[]; // xxx or is it an array of numbers?
  principal: string;
  series: string;
  subordinate: boolean;
}

interface UnitAgentStatus extends Status {
  current:
    | "allocating"
    | "executing"
    | "failed"
    | "idle"
    | "lost"
    | "rebooting";
}

interface WorkloadStatus extends Status {
  current:
    | "active"
    | "blocked"
    | "maintenance"
    | "terminated"
    | "unknown"
    | "unset"
    | "waiting";
}
