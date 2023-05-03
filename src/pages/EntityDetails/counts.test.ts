import { applicationOfferStatusFactory } from "testing/factories/juju/ClientV6";
import { modelDataFactory } from "testing/factories/juju/juju";
import {
  machineAgentStatusFactory,
  machineChangeDeltaFactory,
  unitChangeDeltaFactory,
} from "testing/factories/juju/model-watcher";
import { unitAgentStatusFactory } from "testing/factories/juju/model-watcher";

import {
  generateMachineCounts,
  generateUnitCounts,
  incrementCounts,
  renderCounts,
} from "./counts";

describe("incrementCounts", () => {
  it("increments a count", () => {
    expect(incrementCounts("ready", { ready: 1, waiting: 1 })).toMatchObject({
      ready: 2,
      waiting: 1,
    });
  });

  it("adds new counts", () => {
    expect(incrementCounts("ready", { waiting: 1 })).toMatchObject({
      ready: 1,
      waiting: 1,
    });
  });
});

describe("generateUnitCounts", () => {
  it("gets unit status counts", () => {
    const units = {
      "etcd/1": unitChangeDeltaFactory.build({
        application: "etcd",
        "agent-status": unitAgentStatusFactory.build({
          current: "idle",
        }),
      }),
      "mysql/1": unitChangeDeltaFactory.build({
        application: "mysql",
        "agent-status": unitAgentStatusFactory.build({
          current: "idle",
        }),
      }),
      "etcd/2": unitChangeDeltaFactory.build({
        application: "etcd",
        "agent-status": unitAgentStatusFactory.build({
          current: "allocating",
        }),
      }),
      "etcd/3": unitChangeDeltaFactory.build({
        application: "etcd",
        "agent-status": unitAgentStatusFactory.build({
          current: "idle",
        }),
      }),
      "etcd/4": unitChangeDeltaFactory.build({
        application: "etcd",
        "agent-status": unitAgentStatusFactory.build({
          current: undefined,
        }),
      }),
    };
    expect(generateUnitCounts(units, "etcd")).toMatchObject({
      allocating: 1,
      idle: 2,
    });
  });

  it("handles null data", () => {
    expect(generateUnitCounts(null)).toMatchObject({});
  });
});

describe("generateMachineCounts", () => {
  it("gets machine status counts", () => {
    const machines = {
      0: machineChangeDeltaFactory.build({
        id: "0",
        "agent-status": machineAgentStatusFactory.build({
          current: "pending",
        }),
      }),
      1: machineChangeDeltaFactory.build({
        id: "1",
        "agent-status": machineAgentStatusFactory.build({
          current: "pending",
        }),
      }),
      2: machineChangeDeltaFactory.build({
        id: "2",
        "agent-status": machineAgentStatusFactory.build({
          current: "pending",
        }),
      }),
      3: machineChangeDeltaFactory.build({
        id: "3",
        "agent-status": machineAgentStatusFactory.build({
          current: "error",
        }),
      }),
      4: machineChangeDeltaFactory.build({
        id: "4",
        "agent-status": machineAgentStatusFactory.build({
          current: undefined,
        }),
      }),
    };
    const units = {
      "etcd/1": unitChangeDeltaFactory.build({
        application: "etcd",
        "machine-id": "0",
      }),
      "mysql/1": unitChangeDeltaFactory.build({
        application: "mysql",
        "machine-id": "2",
      }),
      "etcd/2": unitChangeDeltaFactory.build({
        application: "etcd",
        "machine-id": "1",
      }),
      "etcd/3": unitChangeDeltaFactory.build({
        application: "etcd",
        "machine-id": "3",
      }),
      "etcd/4": unitChangeDeltaFactory.build({
        application: "etcd",
        "machine-id": "4",
      }),
    };
    expect(generateMachineCounts(machines, units, "etcd")).toMatchObject({
      error: 1,
      pending: 2,
    });
  });

  it("handles null data", () => {
    expect(generateMachineCounts(null, null)).toMatchObject({});
  });
});

describe("renderCounts", () => {
  it("handles no model data", () => {
    expect(renderCounts("relations")).toBeNull();
  });

  it("can generate a count for local apps", () => {
    const modelData = modelDataFactory.build({
      applications: {
        etcd: {
          status: { status: "ready" },
        },
        mysql: {
          status: { status: "ready" },
        },
        postgresql: {
          status: { status: "error" },
        },
      },
    });
    expect(renderCounts("localApps", modelData)).toMatchObject({
      error: 1,
      ready: 2,
    });
  });

  it("handles no applications when generating the local apps count", () => {
    const modelData = modelDataFactory.build({
      applications: undefined,
    });
    expect(renderCounts("localApps", modelData)).toBeUndefined();
  });

  it("can generate a count for offers", () => {
    const modelData = modelDataFactory.build({
      offers: {
        db: applicationOfferStatusFactory.build({ "total-connected-count": 3 }),
        http: applicationOfferStatusFactory.build({
          "total-connected-count": 2,
        }),
        nrpe: applicationOfferStatusFactory.build({
          "total-connected-count": undefined,
        }),
      },
    });
    expect(renderCounts("offers", modelData)).toMatchObject({
      joined: 5,
    });
  });

  it("can generate a count for remote apps", () => {
    const modelData = modelDataFactory.build({
      "remote-applications": {
        etcd: {
          status: { status: "ready" },
        },
        mysql: {
          status: { status: "ready" },
        },
        postgresql: {
          status: { status: "error" },
        },
      },
    });
    expect(renderCounts("remoteApps", modelData)).toMatchObject({
      error: 1,
      ready: 2,
    });
  });

  it("can handle requesting a localApps count", () => {
    expect(renderCounts("relations", modelDataFactory.build())).toBeNull();
  });
});
