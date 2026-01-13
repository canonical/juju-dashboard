import type {
  DetailedStatus,
  RelationStatus,
  MachineStatus,
} from "@canonical/jujulib/dist/api/facades/client/ClientV7";
import { Factory } from "fishery";

export const detailedStatusFactory = Factory.define<DetailedStatus>(() => ({
  data: {},
  info: "ready",
  kind: "",
  life: "",
  since: "2023-02-26T23:40:27.575528717Z",
  status: "active",
  version: "",
}));

export const relationStatusFactory = Factory.define<RelationStatus>(() => ({
  endpoints: [
    {
      application: "wordpress",
      name: "db",
      subordinate: false,
      role: "requirer",
    },
    {
      application: "mysql",
      name: "db",
      subordinate: false,
      role: "provider",
    },
  ],
  key: "wordpress:db mysql:db",
  id: 0,
  interface: "mysql",
  scope: "global",
  status: detailedStatusFactory.build(),
}));

export const machineStatusFactory = Factory.define<MachineStatus>(() => ({
  "agent-status": detailedStatusFactory.build(),
  "instance-status": detailedStatusFactory.build(),
  "modification-status": detailedStatusFactory.build(),
  "dns-name": "1.2.3.4",
  "instance-id": "juju-123-0",
  "display-name": "",
  base: {
    name: "ubuntu",
    channel: "24.04/stable",
  },
  id: "0",
  containers: {},
  constraints: "arch=amd64",
  hardware:
    "arch=amd64 cores=0 mem=0M availability-zone=danger virt-type=container",
  jobs: [],
  "has-vote": false,
  "wants-vote": false,
}));
