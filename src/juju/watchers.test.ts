import type { MachineChangeDelta, UnitChangeDelta } from "juju/types";
import {
  actionChangeDeltaFactory,
  annotationChangeDeltaFactory,
  applicationChangeDeltaFactory,
  charmChangeDeltaFactory,
  machineChangeDeltaFactory,
  modelWatcherModelDataFactory,
  relationChangeDeltaFactory,
  unitChangeDeltaFactory,
} from "testing/factories/juju/model-watcher";
import { modelWatcherModelInfoFactory } from "testing/factories/juju/model-watcher";

import type { CharmChangeDelta } from "./types";
import { DeltaChangeTypes, DeltaEntityTypes } from "./types";
import { generateModelWatcherBase, processDeltas } from "./watchers";

describe("Watchers", () => {
  it("handles no data", async () => {
    expect(processDeltas()).toBeUndefined();
    expect(processDeltas({})).toBeUndefined();
    expect(processDeltas(undefined, [])).toBeUndefined();
  });

  it("adds models if they don't already exist", async () => {
    expect(
      processDeltas({}, [
        [
          DeltaEntityTypes.ACTION,
          DeltaChangeTypes.CHANGE,
          actionChangeDeltaFactory.build({ "model-uuid": "abc123" }),
        ],
      ]),
    ).toMatchObject({
      abc123: generateModelWatcherBase(),
    });
  });

  it("processes action deltas", async () => {
    const original = actionChangeDeltaFactory.build({ "model-uuid": "abc123" });
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        actions: {
          "0": original,
        },
      }),
    };
    const changed = {
      ...original,
      name: "new-name",
    };
    const changedModels = processDeltas(modelWatcherData, [
      [DeltaEntityTypes.ACTION, DeltaChangeTypes.CHANGE, changed],
    ]);
    expect(changedModels?.abc123.actions).toMatchObject({
      "0": changed,
    });
  });

  it("processes annotation deltas", async () => {
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        annotations: {
          etcd: {
            "gui-x": "10",
            "gui-y": "20",
          },
        },
      }),
    };
    const changed = { "gui-x": "100", "gui-y": "200" };
    const changedModels = processDeltas(modelWatcherData, [
      [
        DeltaEntityTypes.ANNOTATION,
        DeltaChangeTypes.CHANGE,
        annotationChangeDeltaFactory.build({
          "model-uuid": "abc123",
          tag: "application-ceph",
          annotations: changed,
        }),
      ],
    ]);
    expect(changedModels?.abc123.annotations).toMatchObject({
      ceph: changed,
    });
  });

  it("processes application deltas", async () => {
    const original = applicationChangeDeltaFactory.build({
      "model-uuid": "abc123",
      name: "ceph",
    });
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        applications: {
          ceph: original,
        },
      }),
    };
    const changed = {
      ...original,
      "owner-tag": "user-spaceman",
    };
    const changedModels = processDeltas(modelWatcherData, [
      [DeltaEntityTypes.APPLICATION, DeltaChangeTypes.CHANGE, changed],
    ]);
    expect(changedModels?.abc123.applications).toMatchObject({
      ceph: {
        ...changed,
        "unit-count": 0,
      },
    });
  });

  it("processes charm change deltas", async () => {
    const original = charmChangeDeltaFactory.build({
      "model-uuid": "abc123",
      "charm-url": "ch:amd64/focal/ceph-44",
    });
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        charms: {
          "ch:amd64/focal/ceph-44": original,
        },
      }),
    };
    const changed: CharmChangeDelta = {
      ...original,
      life: "dead",
    };
    const changedModels = processDeltas(modelWatcherData, [
      [DeltaEntityTypes.CHARM, DeltaChangeTypes.CHANGE, changed],
    ]);
    expect(changedModels?.abc123.charms).toMatchObject({
      "ch:amd64/focal/ceph-44": changed,
    });
  });

  it("processes charm remove deltas", async () => {
    const original = charmChangeDeltaFactory.build({
      "model-uuid": "abc123",
      "charm-url": "ch:amd64/focal/ceph-44",
    });
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        charms: {
          "ch:amd64/focal/ceph-44": original,
        },
      }),
    };
    const changedModels = processDeltas(modelWatcherData, [
      [DeltaEntityTypes.CHARM, DeltaChangeTypes.REMOVE, original],
    ]);
    expect(changedModels?.abc123.charms).toMatchObject({});
  });

  it("processes machine change deltas", async () => {
    const original = machineChangeDeltaFactory.build({
      "model-uuid": "abc123",
      id: "0",
    });
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        machines: {
          "0": original,
        },
      }),
    };
    const changed: MachineChangeDelta = {
      ...original,
      life: "dead",
    };
    const changedModels = processDeltas(modelWatcherData, [
      [DeltaEntityTypes.MACHINE, DeltaChangeTypes.CHANGE, changed],
    ]);
    expect(changedModels?.abc123.machines).toMatchObject({
      "0": changed,
    });
  });

  it("processes machine remove deltas", async () => {
    const original = machineChangeDeltaFactory.build({
      "model-uuid": "abc123",
      id: "0",
    });
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        machines: {
          "0": original,
        },
      }),
    };
    const changedModels = processDeltas(modelWatcherData, [
      [DeltaEntityTypes.MACHINE, DeltaChangeTypes.REMOVE, original],
    ]);
    expect(changedModels?.abc123.machines).toMatchObject({});
  });

  it("processes model change deltas", async () => {
    const original = modelWatcherModelInfoFactory.build({
      "model-uuid": "abc123",
      name: "test-model",
    });
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        model: original,
      }),
    };
    const changed = {
      ...original,
      name: "changed-model",
    };
    const changedModels = processDeltas(modelWatcherData, [
      [DeltaEntityTypes.MODEL, DeltaChangeTypes.CHANGE, changed],
    ]);
    expect(changedModels?.abc123.model).toMatchObject(changed);
  });

  it("processes relation change deltas", async () => {
    const original = relationChangeDeltaFactory.build({
      "model-uuid": "abc123",
      key: "ceph:db",
      id: 0,
    });
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        relations: {
          "ceph:db": original,
        },
      }),
    };
    const changed = {
      ...original,
      id: 1,
    };
    const changedModels = processDeltas(modelWatcherData, [
      [DeltaEntityTypes.RELATION, DeltaChangeTypes.CHANGE, changed],
    ]);
    expect(changedModels?.abc123.relations).toMatchObject({
      "ceph:db": changed,
    });
  });

  it("processes relation remove deltas", async () => {
    const original = relationChangeDeltaFactory.build({
      "model-uuid": "abc123",
      key: "ceph:db",
      id: 0,
    });
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        relations: {
          "ceph:db": original,
        },
      }),
    };
    const changedModels = processDeltas(modelWatcherData, [
      [DeltaEntityTypes.RELATION, DeltaChangeTypes.REMOVE, original],
    ]);
    expect(changedModels?.abc123.relations).toMatchObject({});
  });

  it("processes unit change deltas", async () => {
    const original = unitChangeDeltaFactory.build({
      "model-uuid": "abc123",
      life: "alive",
      name: "ceph/0",
    });
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        units: {
          "ceph/0": original,
        },
      }),
    };
    const changed: UnitChangeDelta = {
      ...original,
      life: "dead",
    };
    const changedModels = processDeltas(modelWatcherData, [
      [DeltaEntityTypes.UNIT, DeltaChangeTypes.CHANGE, changed],
    ]);
    expect(changedModels?.abc123.units).toMatchObject({
      "ceph/0": changed,
    });
  });

  it("processes unit remove deltas", async () => {
    const original = unitChangeDeltaFactory.build({
      "model-uuid": "abc123",
      life: "alive",
      name: "ceph/0",
    });
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        units: {
          "ceph/0": original,
        },
      }),
    };
    const changedModels = processDeltas(modelWatcherData, [
      [DeltaEntityTypes.UNIT, DeltaChangeTypes.REMOVE, original],
    ]);
    expect(changedModels?.abc123.units).toMatchObject({});
  });

  it("increases the app's unit count when processing unit change deltas for new apps", async () => {
    const original = unitChangeDeltaFactory.build({
      "model-uuid": "abc123",
      name: "ceph/0",
    });
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        applications: {
          ceph: {
            ...applicationChangeDeltaFactory.build({
              "model-uuid": "abc123",
              name: "ceph",
            }),
            "unit-count": 0,
          },
        },
        units: {},
      }),
    };
    const changedModels = processDeltas(modelWatcherData, [
      [DeltaEntityTypes.UNIT, DeltaChangeTypes.CHANGE, original],
    ]);
    expect(changedModels?.abc123.applications.ceph["unit-count"]).toBe(1);
  });

  it("doesn't change the app's unit count when processing unit change deltas for existing apps", async () => {
    const original = unitChangeDeltaFactory.build({
      "model-uuid": "abc123",
      name: "ceph/0",
    });
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        applications: {
          ceph: {
            ...applicationChangeDeltaFactory.build({
              "model-uuid": "abc123",
              name: "ceph",
            }),
            "unit-count": 1,
          },
        },
        units: {
          "ceph/0": original,
        },
      }),
    };
    const changedModels = processDeltas(modelWatcherData, [
      [DeltaEntityTypes.UNIT, DeltaChangeTypes.CHANGE, original],
    ]);
    expect(changedModels?.abc123.applications.ceph["unit-count"]).toBe(1);
  });

  it("decreases the app's unit count when processing unit remove deltas", async () => {
    const original = unitChangeDeltaFactory.build({
      "model-uuid": "abc123",
      name: "ceph/0",
    });
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        applications: {
          ceph: {
            ...applicationChangeDeltaFactory.build({
              "model-uuid": "abc123",
              name: "ceph",
            }),
            "unit-count": 1,
          },
        },
        units: {
          "ceph/0": original,
        },
      }),
    };
    const changedModels = processDeltas(modelWatcherData, [
      [DeltaEntityTypes.UNIT, DeltaChangeTypes.REMOVE, original],
    ]);
    expect(changedModels?.abc123.applications.ceph["unit-count"]).toBe(1);
  });

  it("adds missing apps when adding the unit count when processing unit deltas", async () => {
    const original = unitChangeDeltaFactory.build({
      "model-uuid": "abc123",
      name: "ceph/0",
    });
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        applications: {},
        units: {},
      }),
    };
    const changedModels = processDeltas(modelWatcherData, [
      [DeltaEntityTypes.UNIT, DeltaChangeTypes.CHANGE, original],
    ]);
    expect(changedModels?.abc123.applications).toMatchObject({
      ceph: {
        "unit-count": 1,
      },
    });
  });
});
