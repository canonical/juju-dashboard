import type {
  DetailedStatus,
  RelationStatus,
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
