import {
  applicationOfferStatusFactory,
  applicationStatusFactory,
  unitStatusFactory,
} from "testing/factories/juju/ClientV8";
import {
  detailedStatusFactory,
  machineStatusFactory,
} from "testing/factories/juju/ClientV8";
import { modelDataFactory } from "testing/factories/juju/juju";

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
      etcd: applicationStatusFactory.build({
        units: {
          "etcd/1": unitStatusFactory.build({
            "agent-status": detailedStatusFactory.build({
              status: "idle",
            }),
          }),
          "etcd/2": unitStatusFactory.build({
            "agent-status": detailedStatusFactory.build({
              status: "allocating",
            }),
          }),
          "etcd/3": unitStatusFactory.build({
            "agent-status": detailedStatusFactory.build({
              status: "idle",
            }),
          }),
          "etcd/4": unitStatusFactory.build({
            "agent-status": detailedStatusFactory.build({
              status: undefined,
            }),
          }),
        },
      }),
      mysql: applicationStatusFactory.build({
        units: {
          "mysql/1": unitStatusFactory.build({
            "agent-status": detailedStatusFactory.build({
              status: "idle",
            }),
          }),
        },
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
      0: machineStatusFactory.build({
        id: "0",
        "agent-status": detailedStatusFactory.build({
          status: "pending",
        }),
      }),
      1: machineStatusFactory.build({
        id: "1",
        "agent-status": detailedStatusFactory.build({
          status: "pending",
        }),
      }),
      2: machineStatusFactory.build({
        id: "2",
        "agent-status": detailedStatusFactory.build({
          status: "pending",
        }),
      }),
      3: machineStatusFactory.build({
        id: "3",
        "agent-status": detailedStatusFactory.build({
          status: "error",
        }),
      }),
      4: machineStatusFactory.build({
        id: "4",
        "agent-status": detailedStatusFactory.build({
          status: undefined,
        }),
      }),
    };
    const units = {
      etcd: applicationStatusFactory.build({
        units: {
          "etcd/1": unitStatusFactory.build({
            machine: "0",
          }),
          "etcd/2": unitStatusFactory.build({
            machine: "1",
          }),
          "etcd/3": unitStatusFactory.build({
            machine: "3",
          }),
          "etcd/4": unitStatusFactory.build({
            machine: "4",
          }),
        },
      }),
      mysql: applicationStatusFactory.build({
        units: {
          "mysql/1": unitStatusFactory.build({
            machine: "2",
          }),
        },
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
