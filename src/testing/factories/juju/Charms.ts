import type { Charm } from "@canonical/jujulib/dist/api/facades/charms/CharmsV5";
import { Factory } from "fishery";

import type { ApplicationInfo } from "juju/types";

export const charmInfoFactory = Factory.define<Charm>(() => ({
  revision: 20,
  url: "ch:amd64/focal/postgresql-k8s-20",
  config: {},
  meta: {
    name: "postgresql-k8s",
    summary:
      "PostgreSQL is a powerful, open source object-relational database system. It has more than 15 years of active development and a proven architecture that has earned it a strong reputation for reliability, data integrity, and correctness. It is fully ACID compliant, has full support for foreign keys, joins, views, triggers, and stored procedures (in multiple languages). It includes most SQL:2008 data types, including INTEGER, NUMERIC, BOOLEAN, CHAR, VARCHAR, DATE, INTERVAL, and TIMESTAMP. It also supports storage of binary large objects, including pictures, sounds, or video. It has native programming interfaces for C/C++, Java, .Net, Perl, Python, Ruby, Tcl, ODBC, among others, and exceptional documentation (http://www.postgresql.org/docs/manuals/).\n  \nThis charm supports high availability PostgreSQL 12 in Kubernetes environments, using k8s services for load balancing and repmgrd to handle failover (https://repmgr.org).\n",
    description: "PostgreSQL charm for Kubernetes deployments.\n",
    subordinate: false,
    provides: {
      db: {
        name: "db",
        role: "provider",
        interface: "pgsql",
        optional: false,
        limit: 0,
        scope: "global",
      },
      "db-admin": {
        name: "db-admin",
        role: "provider",
        interface: "pgsql",
        optional: false,
        limit: 0,
        scope: "global",
      },
    },
    peers: {
      peer: {
        name: "peer",
        role: "peer",
        interface: "peer",
        optional: false,
        limit: 0,
        scope: "global",
      },
    },
    tags: ["databases", "k8s"],
    series: ["kubernetes"],
    storage: {
      logs: {
        name: "logs",
        description: "",
        type: "filesystem",
        shared: false,
        "read-only": false,
        "count-min": 1,
        "count-max": 1,
        "minimum-size": 0,
        location: "/var/log/postgresql",
      },
      pgdata: {
        name: "pgdata",
        description: "",
        type: "filesystem",
        shared: false,
        "read-only": false,
        "count-min": 1,
        "count-max": 1,
        "minimum-size": 0,
        location: "/srv",
      },
    },
    resources: {
      "postgresql-image": {
        name: "postgresql-image",
        type: "oci-image",
        path: "",
        description: "docker image for PostgreSQL",
      },
    },
    "min-juju-version": "2.9.0",
  },
  actions: { specs: [] },
  manifest: {
    bases: [
      {
        name: "ubuntu",
        channel: "20.04/stable",
        architectures: ["amd64"],
      },
    ],
  },
}));

export const charmApplicationFactory = Factory.define<ApplicationInfo>(() => ({
  "unit-count": 2,
  "model-uuid": "816d67b1-4942-4420-8be2-07df30f7a1ce",
  name: "db2",
  exposed: false,
  "charm-url": "ch:amd64/focal/postgresql-k8s-20",
  "owner-tag": "",
  life: "alive",
  "min-units": 0,
  constraints: {
    arch: "amd64",
  },
  subordinate: false,
  status: {
    current: "active",
    message: "",
    since: "2023-01-26T06:41:05.303171453Z",
    version: "",
  },
  "workload-version": "",
}));
