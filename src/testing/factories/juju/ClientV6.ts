import type { ModelStatusInfo } from "@canonical/jujulib/dist/api/facades/client/ClientV6";
import type { FullStatus } from "@canonical/jujulib/dist/api/facades/client/ClientV6";
import type {
  ApplicationOfferStatus,
  DetailedStatus,
  RemoteApplicationStatus,
} from "@canonical/jujulib/dist/api/facades/client/ClientV6";
import { Factory } from "fishery";

import { modelDataStatusFactory } from "./juju";

export const modelStatusInfoFactory = Factory.define<ModelStatusInfo>(() => ({
  name: "sub-test",
  type: "iaas",
  "cloud-tag": "cloud-google",
  region: "us-east1",
  version: "2.6.10",
  "available-version": "",
  "model-status": modelDataStatusFactory.build(),
  "meter-status": {
    color: "",
    message: "",
  },
  sla: "unsupported",
}));

export const fullStatusFactory = Factory.define<FullStatus>(() => ({
  "controller-timestamp": "1999-11-15T18:31:36Z",
  "remote-applications": {},
  actions: {},
  annotations: {},
  applications: {},
  branches: {},
  charms: {},
  machines: {},
  model: modelStatusInfoFactory.build(),
  offers: {},
  relations: [],
  units: {},
}));

export const applicationOfferStatusFactory =
  Factory.define<ApplicationOfferStatus>(() => ({
    "active-connected-count": 1,
    "application-name": "etcd",
    charm: "ch:etcd",
    endpoints: {},
    "offer-name": "db",
    "total-connected-count": 2,
  }));

export const detailedStatusFactory = Factory.define<DetailedStatus>(() => ({
  data: {},
  info: "ready",
  kind: "",
  life: "",
  since: "2023-02-26T23:40:27.575528717Z",
  status: "active",
  version: "",
}));

export const remoteApplicationStatusFactory =
  Factory.define<RemoteApplicationStatus>(() => ({
    endpoints: [],
    life: "",
    "offer-name": "mysql",
    "offer-url": "juju-controller:admin/cmr.mysql",
    relations: {},
    status: detailedStatusFactory.build(),
  }));
