// See https://github.com/juju/juju/blob/develop/apiserver/params/multiwatcher.go
// for the Juju types for the AllWatcher responses.

export interface ActionData {
  [id: string]: ActionChangeDelta;
}

export interface ApplicationData {
  [appName: string]: ApplicationChangeDelta;
}

export interface MachineData {
  [key: string]: MachineChangeDelta;
}

export interface ModelCharmData {
  [charmURL: string]: CharmChangeDelta;
}

export interface ModelWatcherData {
  [uuid: string]: ModelData;
}

export interface RelationData {
  [key: string]: RelationChangeDelta;
}

export interface UnitData {
  [unitName: string]: UnitChangeDelta;
}

export type AllWatcherDelta =
  | ["action", "change", ActionChangeDelta]
  | ["application", "change", ApplicationChangeDelta]
  | ["charm", "change", CharmChangeDelta]
  | ["unit", "change", UnitChangeDelta]
  | ["unit", "remove", UnitChangeDelta]
  | ["machine", "change", MachineChangeDelta]
  | ["machine", "remove", MachineChangeDelta]
  | ["model", "change", ModelChangeDelta]
  | ["relation", "change", RelationChangeDelta];

export interface ModelData {
  actions: ActionData;
  applications: ApplicationData;
  charms: ModelCharmData;
  machines: MachineData;
  model: ModelInfo;
  relations: RelationData;
  units: UnitData;
}

export interface ModelInfo extends ModelChangeDelta {
  "cloud-tag": string;
  region: string;
  type: string;
  version: string;
}

// Shared Types

type IPAddress = string;
type UnitId = string;
type NumberAsString = string;
type Life = "alive" | "dead" | "dying" | "";
type ISO8601Date = string;
type DeprecatedString = string;
interface Status {
  // See https://github.com/juju/juju/blob/develop/core/status/status.go
  // For the possible status values for `current`.
  // Possible statuses differ by entity type.
  current: string;
  message: string;
  since?: ISO8601Date;
  version: string;
  data?: { [key: string]: any };
  err?: string;
}
type Config = { [key: string]: string | boolean };
type LXDProfile = {
  config?: Config;
  description?: string;
  devices?: { [key: string]: { [key: string]: string } };
} | null;

// Delta Types

interface ActionChangeDelta {
  "model-uuid": string;
  id: NumberAsString;
  receiver: UnitId;
  name: string;
  status: string;
  message: string;
  parameters?: { [key: string]: string };
  results?: {
    // Known values, add more as known.
    Code: NumberAsString;
    Stderr: string;
    [key: string]: string;
  };
  enqueued: ISO8601Date;
  started: ISO8601Date;
  completed: ISO8601Date;
}

interface ApplicationChangeDelta {
  "workload-version": string;
  "charm-url": string;
  "min-units": number;
  "model-uuid": string;
  "owner-tag": string;
  constraints: { [key: string]: string };
  exposed: boolean;
  life: Life;
  name: string;
  status: WorkloadStatus;
  subordinate: boolean;
}

interface CharmChangeDelta {
  "model-uuid": string;
  "charm-url": string;
  "charm-version": string;
  life: Life;
  profile: LXDProfile;
  config?: Config;
}

interface MachineChangeDelta {
  addresses: AddressData[] | null;
  "agent-status": MachineAgentStatus;
  "container-type": string;
  "hardware-characteristics"?: HardwareCharacteristics;
  "has-vote": boolean;
  id: NumberAsString;
  "instance-id": string;
  "instance-status": MachineAgentStatus;
  jobs: ["JobHostUnits"] | ["JobManageModel"];
  life: Life;
  "model-uuid": string;
  series: string;
  "supported-containers": ["none" | "lxd" | "kvm"] | null;
  "supported-containers-known": boolean;
  "wants-vote": boolean;
}

interface MachineAgentStatus extends Status {
  current: "down" | "error" | "pending" | "running" | "started" | "stopped";
}

interface AddressData {
  value: IPAddress;
  type: "ipv4" | "ipv6";
  scope: "public" | "local-cloud" | "local-fan" | "local-machine";
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
  config: Config;
  status: ModelAgentStatus;
  constraints: { [key: string]: any };
  sla: {
    level: string;
    owner: string;
  };
}

interface ModelAgentStatus extends Status {
  current: "available" | "busy" | "";
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
    scope: "global" | "container";
  };
}

interface UnitChangeDelta {
  "agent-status": UnitAgentStatus;
  "charm-url": string;
  "machine-id": NumberAsString;
  "model-uuid": string;
  "port-ranges":
    | {
        "from-port": number;
        "to-port": number;
        protocol: string;
      }[]
    | null;
  "private-address": DeprecatedString;
  "public-address": DeprecatedString;
  "workload-status": WorkloadStatus;
  application: string;
  life: Life;
  name: string;
  ports:
    | {
        protocol: string;
        number: number;
      }[]
    | [];
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
