import { TSFixMe } from "types";

export interface ModelWatcherData {
  [uuid: string]: ModelData;
}

export type AllWatcherDelta = [DeltaEntity, DeltaType, Delta];

type DeltaEntity =
  | "action"
  | "application"
  | "charm"
  | "machine"
  | "model"
  | "relation";
type DeltaType = "add" | "change" | "remove";

// XXX Type different Delta types based on the values of DeltaEntity/DeltaType.
type Delta = TSFixMe;

interface ModelData {
  applications: Applications;
}

interface Applications {
  name: string;
}

interface MachineChangeDelta {
  addresses: AddressData | null;
  "agent-status": Status;
  "container-type": string; // xxx typically empty? What can this contain?
  "hardware-characteristics": HardwareCharacteristics | undefined;
  "has-vote": boolean;
  id: NumberAsString;
  "instance-id": string;
  "instance-status": Status;
  jobs: string[]; // xxx [ "JobHostUnits" ] what else can this be?
  life: Life;
  "model-uuid": string;
  series: string;
  "supported-containers": null; // xxx what are other valid values for this?
  "supported-containers-known": boolean;
  "wants-vote": boolean;
}

type IPAddress = string;
type NumberAsString = string;
type Life = "alive" | string; // xxx what other values for life are there?

interface AddressData {
  value: IPAddress;
  type: "ipv4" | string;
  scope: "public" | "local-cloud" | string;
}

interface Status {
  current: "allocating" | "pending" | "running" | string; // xxx what are the other statuses?
  message: string;
  since: string; // xxx 2021-07-26T20:29:24.018591937Z what date type is this?
  version: string; // xxx typically empty? What can this contain?
}

interface HardwareCharacteristics {
  arch: string;
  mem: number;
  "root-disk": number;
  "cpu-cores": number;
  "cpu-power": number;
  "availability-zone": string;
}
