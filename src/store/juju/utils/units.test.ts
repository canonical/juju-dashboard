import {
  applicationStatusFactory,
  machineStatusFactory,
  unitStatusFactory,
} from "testing/factories/juju/ClientV8";

import {
  getAppMachines,
  getAppScale,
  getAppUnits,
  getMachineApps,
  getMachineUnits,
  getParentOrUnit,
  getParentUnit,
  getScale,
  getUnit,
  getUnitApp,
  getUnitMachine,
} from "./units";

describe("getAppScale", () => {
  it("handles no matching application", () => {
    const applications = {
      app2: applicationStatusFactory.build(),
    };
    expect(getAppScale("app1", applications)).toBe(0);
  });

  it("counts the number of units", () => {
    const applications = {
      app1: applicationStatusFactory.build({
        units: {
          "app1/0": unitStatusFactory.build(),
          "app1/1": unitStatusFactory.build(),
        },
      }),
      app2: applicationStatusFactory.build({
        units: {
          // This unit should not be counted.
          "app2/0": unitStatusFactory.build(),
        },
      }),
    };
    expect(getAppScale("app1", applications)).toBe(2);
  });

  it("calculates the number of units if it is a subordinate", () => {
    const applications = {
      app1: applicationStatusFactory.build({
        "subordinate-to": ["app2", "app3"],
      }),
      app2: applicationStatusFactory.build({
        units: {
          "app2/0": unitStatusFactory.build({
            subordinates: {
              "app1/0": unitStatusFactory.build(),
              // The app4 subordinates should not be counted.
              "app4/0": unitStatusFactory.build(),
            },
          }),
          "app2/1": unitStatusFactory.build({
            subordinates: {
              "app1/1": unitStatusFactory.build(),
              "app4/1": unitStatusFactory.build(),
            },
          }),
          "app2/2": unitStatusFactory.build({
            subordinates: {
              "app1/2": unitStatusFactory.build(),
              "app4/2": unitStatusFactory.build(),
            },
          }),
        },
      }),
      app3: applicationStatusFactory.build({
        units: {
          "app3/0": unitStatusFactory.build({
            subordinates: {
              "app1/3": unitStatusFactory.build(),
            },
          }),
        },
      }),
      app4: applicationStatusFactory.build({
        "subordinate-to": ["app2"],
      }),
    };
    expect(getAppScale("app1", applications)).toBe(4);
  });
});

describe("getScale", () => {
  it("calculates the number of units including subordinates", () => {
    const applications = {
      app1: applicationStatusFactory.build({
        // The scale will be calculated by the number of units in all parent apps.
        "subordinate-to": ["app2", "app6"],
      }),
      // This application should not be counted as its id is not in the list,
      // however app1's scale will be calculated from app2's units.
      app2: applicationStatusFactory.build({
        units: {
          "app2/0": unitStatusFactory.build({
            subordinates: {
              "app1/0": unitStatusFactory.build(),
              // The app4 subordinates should not be counted.
              "app4/0": unitStatusFactory.build(),
            },
          }),
          "app2/1": unitStatusFactory.build({
            subordinates: {
              "app1/1": unitStatusFactory.build(),
              "app4/1": unitStatusFactory.build(),
            },
          }),
          "app2/2": unitStatusFactory.build({
            subordinates: {
              "app1/2": unitStatusFactory.build(),
              "app4/2": unitStatusFactory.build(),
            },
          }),
        },
      }),
      // This application should not be counted as its id is not in the list.
      app3: applicationStatusFactory.build({
        units: {
          "app3/0": unitStatusFactory.build(),
        },
      }),
      // This application should not be counted as its id is not in the list.
      app4: applicationStatusFactory.build({
        "subordinate-to": ["app2"],
      }),
      app5: applicationStatusFactory.build({
        units: {
          "app5/0": unitStatusFactory.build(),
          "app5/1": unitStatusFactory.build(),
          "app5/2": unitStatusFactory.build(),
        },
      }),
      app6: applicationStatusFactory.build({
        units: {
          "app6/0": unitStatusFactory.build({
            subordinates: {
              "app1/3": unitStatusFactory.build(),
            },
          }),
          "app6/1": unitStatusFactory.build({
            subordinates: {
              "app1/4": unitStatusFactory.build(),
            },
          }),
        },
      }),
    };
    expect(getScale(["app1", "app5"], applications)).toBe(8);
  });

  it("does not calculate subordinate parents twice", () => {
    const applications = {
      app1: applicationStatusFactory.build({
        "subordinate-to": ["app2"],
      }),
      // This application should not be counted as its id is not in the list,
      // however app1's scale will be calculated from app2's units.
      app2: applicationStatusFactory.build({
        units: {
          "app2/0": unitStatusFactory.build({
            subordinates: {
              "app1/0": unitStatusFactory.build(),
              "app3/0": unitStatusFactory.build(),
            },
          }),
          "app2/1": unitStatusFactory.build({
            subordinates: {
              "app1/1": unitStatusFactory.build(),
              "app3/1": unitStatusFactory.build(),
            },
          }),
          "app2/2": unitStatusFactory.build({
            subordinates: {
              "app1/2": unitStatusFactory.build(),
              "app3/2": unitStatusFactory.build(),
            },
          }),
        },
      }),
      app3: applicationStatusFactory.build({
        "subordinate-to": ["app2"],
      }),
    };
    expect(getScale(["app1", "app3"], applications)).toBe(3);
  });

  it("calculates the number of units including subordinate parents", () => {
    const applications = {
      // app1's scale will be calculated from app2 and app6's units, but because app2 is also included
      // in the list of ids then it should not count those units twice. app6's units will be counted as
      // app6 is not included in the list.
      app1: applicationStatusFactory.build({
        "subordinate-to": ["app2", "app6"],
      }),
      app2: applicationStatusFactory.build({
        units: {
          "app2/0": unitStatusFactory.build({
            subordinates: {
              "app1/0": unitStatusFactory.build(),
              // The app4 subordinates should not be counted.
              "app4/0": unitStatusFactory.build(),
            },
          }),
          "app2/1": unitStatusFactory.build({
            subordinates: {
              "app1/1": unitStatusFactory.build(),
              "app4/1": unitStatusFactory.build(),
            },
          }),
          "app2/2": unitStatusFactory.build({
            subordinates: {
              "app1/2": unitStatusFactory.build(),
              "app4/2": unitStatusFactory.build(),
            },
          }),
        },
      }),
      // This application should not be counted as its id is not in the list.
      app3: applicationStatusFactory.build({
        units: {
          "app3/0": unitStatusFactory.build(),
        },
      }),
      // This application should not be counted as its id is not in the list.
      app4: applicationStatusFactory.build({
        "subordinate-to": ["app2"],
      }),
      app5: applicationStatusFactory.build({
        units: {
          "app5/0": unitStatusFactory.build(),
          "app5/1": unitStatusFactory.build(),
          "app5/2": unitStatusFactory.build(),
        },
      }),
      app6: applicationStatusFactory.build({
        units: {
          "app6/0": unitStatusFactory.build({
            subordinates: {
              "app1/3": unitStatusFactory.build(),
            },
          }),
          "app6/1": unitStatusFactory.build({
            subordinates: {
              "app1/4": unitStatusFactory.build(),
            },
          }),
        },
      }),
    };
    expect(getScale(["app1", "app2", "app4", "app5"], applications)).toBe(8);
  });
});

describe("getMachineApps", () => {
  it("gets applications on a machine", () => {
    const applications = {
      // This application should be included as its parent application is on the machine.
      app1: applicationStatusFactory.build({
        "subordinate-to": ["app2"],
      }),
      app2: applicationStatusFactory.build({
        units: {
          "app2/0": unitStatusFactory.build({
            machine: "0",
            subordinates: {
              "app1/0": unitStatusFactory.build(),
            },
          }),
          "app2/1": unitStatusFactory.build({
            machine: "1",
            subordinates: {
              "app1/1": unitStatusFactory.build(),
            },
          }),
        },
      }),
      app3: applicationStatusFactory.build({
        units: {
          "app3/0": unitStatusFactory.build({
            machine: "0",
          }),
          "app3/1": unitStatusFactory.build({
            machine: "1",
          }),
        },
      }),
      // This application should not be included as it has no units on the machine.
      app4: applicationStatusFactory.build({
        units: {
          "app4/0": unitStatusFactory.build({
            machine: "1",
          }),
          "app4/1": unitStatusFactory.build({
            machine: "2",
          }),
        },
      }),
    };
    expect(getMachineApps("0", applications)).toStrictEqual({
      app1: applications.app1,
      app2: applications.app2,
      app3: applications.app3,
    });
  });
});

describe("getMachineUnits", () => {
  it("gets units on a machine", () => {
    const applications = {
      // This application should be included as its parent application is on the machine.
      app1: applicationStatusFactory.build({
        "subordinate-to": ["app2"],
      }),
      app2: applicationStatusFactory.build({
        units: {
          "app2/0": unitStatusFactory.build({
            machine: "0",
            subordinates: {
              "app1/0": unitStatusFactory.build(),
            },
          }),
          "app2/1": unitStatusFactory.build({
            machine: "1",
            subordinates: {
              "app1/1": unitStatusFactory.build(),
            },
          }),
        },
      }),
      app3: applicationStatusFactory.build({
        units: {
          "app3/0": unitStatusFactory.build({
            machine: "0",
          }),
          "app3/1": unitStatusFactory.build({
            machine: "1",
          }),
        },
      }),
      // This application should not be included as it has no units on the machine.
      app4: applicationStatusFactory.build({
        units: {
          "app4/0": unitStatusFactory.build({
            machine: "1",
          }),
          "app4/1": unitStatusFactory.build({
            machine: "2",
          }),
        },
      }),
    };
    expect(getMachineUnits("0", applications)).toStrictEqual({
      "app1/0": applications.app2.units["app2/0"].subordinates["app1/0"],
      "app2/0": applications.app2.units["app2/0"],
      "app3/0": applications.app3.units["app3/0"],
    });
  });
});

describe("getParentUnit", () => {
  it("gets a subordinate's parent", () => {
    const applications = {
      app1: applicationStatusFactory.build({
        "subordinate-to": ["app2"],
      }),
      app2: applicationStatusFactory.build({
        units: {
          "app2/0": unitStatusFactory.build({
            machine: "0",
            subordinates: {
              "app1/0": unitStatusFactory.build(),
            },
          }),
          "app2/1": unitStatusFactory.build({
            machine: "1",
            subordinates: {
              "app1/1": unitStatusFactory.build(),
            },
          }),
        },
      }),
    };
    expect(getParentUnit("app1/0", applications)).toStrictEqual(
      applications.app2.units["app2/0"],
    );
  });

  it("returns null if it is not a subordinate", () => {
    const applications = {
      app1: applicationStatusFactory.build({
        "subordinate-to": ["app2"],
      }),
      app2: applicationStatusFactory.build({
        units: {
          "app2/0": unitStatusFactory.build({
            machine: "0",
            subordinates: {
              "app1/0": unitStatusFactory.build(),
            },
          }),
          "app2/1": unitStatusFactory.build({
            machine: "1",
            subordinates: {
              "app1/1": unitStatusFactory.build(),
            },
          }),
        },
      }),
    };
    expect(getParentUnit("app2/0", applications)).toBeNull();
  });
});

describe("getParentOrUnit", () => {
  it("gets a subordinate's parent", () => {
    const applications = {
      app1: applicationStatusFactory.build({
        "subordinate-to": ["app2"],
      }),
      app2: applicationStatusFactory.build({
        units: {
          "app2/0": unitStatusFactory.build({
            machine: "0",
            subordinates: {
              "app1/0": unitStatusFactory.build(),
            },
          }),
          "app2/1": unitStatusFactory.build({
            machine: "1",
            subordinates: {
              "app1/1": unitStatusFactory.build(),
            },
          }),
        },
      }),
    };
    expect(getParentOrUnit("app1/0", applications)).toStrictEqual(
      applications.app2.units["app2/0"],
    );
  });

  it("returns the unit if it is not a subordinate", () => {
    const applications = {
      app1: applicationStatusFactory.build({
        "subordinate-to": ["app2"],
      }),
      app2: applicationStatusFactory.build({
        units: {
          "app2/0": unitStatusFactory.build({
            machine: "0",
            subordinates: {
              "app1/0": unitStatusFactory.build(),
            },
          }),
          "app2/1": unitStatusFactory.build({
            machine: "1",
            subordinates: {
              "app1/1": unitStatusFactory.build(),
            },
          }),
        },
      }),
    };
    expect(getParentOrUnit("app2/0", applications)).toStrictEqual(
      applications.app2.units["app2/0"],
    );
  });
});

describe("getUnit", () => {
  it("gets a unit", () => {
    const applications = {
      app1: applicationStatusFactory.build({
        "subordinate-to": ["app2"],
      }),
      app2: applicationStatusFactory.build({
        units: {
          "app2/0": unitStatusFactory.build({
            machine: "0",
            subordinates: {
              "app1/0": unitStatusFactory.build(),
            },
          }),
          "app2/1": unitStatusFactory.build({
            machine: "1",
            subordinates: {
              "app1/1": unitStatusFactory.build(),
            },
          }),
        },
      }),
      app3: applicationStatusFactory.build({
        units: {
          "app3/0": unitStatusFactory.build(),
        },
      }),
    };
    expect(getUnit("app2/1", applications)).toStrictEqual(
      applications.app2.units["app2/1"],
    );
  });

  it("gets a unit for a subordinate application", () => {
    const applications = {
      app1: applicationStatusFactory.build({
        "subordinate-to": ["app2", "app3"],
      }),
      app2: applicationStatusFactory.build({
        units: {
          "app2/0": unitStatusFactory.build({
            machine: "0",
            subordinates: {
              "app1/0": unitStatusFactory.build(),
            },
          }),
          "app2/1": unitStatusFactory.build({
            machine: "1",
            subordinates: {
              "app1/1": unitStatusFactory.build(),
            },
          }),
        },
      }),
      app3: applicationStatusFactory.build({
        units: {
          "app3/0": unitStatusFactory.build({
            subordinates: {
              "app1/2": unitStatusFactory.build(),
            },
          }),
        },
      }),
      // This application should not be included.
      app4: applicationStatusFactory.build({
        units: {
          "app4/0": unitStatusFactory.build(),
        },
      }),
    };
    expect(getUnit("app1/1", applications)).toStrictEqual(
      applications.app2.units["app2/1"].subordinates["app1/1"],
    );
  });
});

describe("getUnitApp", () => {
  it("gets an application from the unit id", () => {
    const applications = {
      app1: applicationStatusFactory.build({
        "subordinate-to": ["app2"],
      }),
      app2: applicationStatusFactory.build({
        units: {
          "app2/0": unitStatusFactory.build({
            machine: "0",
            subordinates: {
              "app1/0": unitStatusFactory.build(),
            },
          }),
          "app2/1": unitStatusFactory.build({
            machine: "1",
            subordinates: {
              "app1/1": unitStatusFactory.build(),
            },
          }),
        },
      }),
      app3: applicationStatusFactory.build({
        units: {
          "app3/0": unitStatusFactory.build(),
        },
      }),
    };
    expect(getUnitApp("app2/1", applications)).toStrictEqual(applications.app2);
  });
});

describe("getUnitMachine", () => {
  it("gets a unit's machine", () => {
    const applications = {
      app1: applicationStatusFactory.build({
        "subordinate-to": ["app2"],
      }),
      app2: applicationStatusFactory.build({
        units: {
          "app2/0": unitStatusFactory.build({
            machine: "0",
            subordinates: {
              "app1/0": unitStatusFactory.build(),
            },
          }),
          "app2/1": unitStatusFactory.build({
            machine: "1",
            subordinates: {
              "app1/1": unitStatusFactory.build(),
            },
          }),
        },
      }),
      app3: applicationStatusFactory.build({
        units: {
          "app3/0": unitStatusFactory.build({
            machine: "2",
          }),
        },
      }),
    };
    const machines = {
      0: machineStatusFactory.build({ id: "0" }),
      1: machineStatusFactory.build({ id: "1" }),
      2: machineStatusFactory.build({ id: "2" }),
    };
    expect(getUnitMachine("app2/1", applications, machines)).toStrictEqual(
      machines["1"],
    );
  });

  it("gets a subordinate unit's machine", () => {
    const applications = {
      app1: applicationStatusFactory.build({
        "subordinate-to": ["app2", "app3"],
      }),
      app2: applicationStatusFactory.build({
        units: {
          "app2/0": unitStatusFactory.build({
            machine: "0",
            subordinates: {
              "app1/0": unitStatusFactory.build(),
            },
          }),
          "app2/1": unitStatusFactory.build({
            machine: "1",
            subordinates: {
              "app1/1": unitStatusFactory.build(),
            },
          }),
        },
      }),
      app3: applicationStatusFactory.build({
        units: {
          "app3/0": unitStatusFactory.build({
            machine: "2",
          }),
        },
      }),
      app4: applicationStatusFactory.build({
        units: {
          "app4/0": unitStatusFactory.build({
            machine: "3",
          }),
        },
      }),
    };
    const machines = {
      0: machineStatusFactory.build({ id: "0" }),
      1: machineStatusFactory.build({ id: "1" }),
      2: machineStatusFactory.build({ id: "2" }),
      3: machineStatusFactory.build({ id: "3" }),
    };
    expect(getUnitMachine("app1/1", applications, machines)).toStrictEqual(
      machines["1"],
    );
  });
});

describe("getAppMachines", () => {
  it("gets machines for an application", () => {
    const applications = {
      app1: applicationStatusFactory.build({
        "subordinate-to": ["app2"],
      }),
      app2: applicationStatusFactory.build({
        units: {
          "app2/0": unitStatusFactory.build({
            machine: "0",
            subordinates: {
              "app1/0": unitStatusFactory.build(),
            },
          }),
          "app2/1": unitStatusFactory.build({
            machine: "1",
            subordinates: {
              "app1/1": unitStatusFactory.build(),
            },
          }),
        },
      }),
      // This application's machines should not be included.
      app3: applicationStatusFactory.build({
        units: {
          "app3/0": unitStatusFactory.build({
            machine: "2",
          }),
        },
      }),
    };
    const machines = {
      0: machineStatusFactory.build({ id: "0" }),
      1: machineStatusFactory.build({ id: "1" }),
      2: machineStatusFactory.build({ id: "2" }),
    };
    expect(getAppMachines("app2", applications, machines)).toStrictEqual({
      0: machines["0"],
      1: machines["1"],
    });
  });

  it("gets machines for a subordinate application", () => {
    const applications = {
      app1: applicationStatusFactory.build({
        "subordinate-to": ["app2", "app3"],
      }),
      // This application's machines should be included as it is a parent to app1.
      app2: applicationStatusFactory.build({
        units: {
          "app2/0": unitStatusFactory.build({
            machine: "0",
            subordinates: {
              "app1/0": unitStatusFactory.build(),
            },
          }),
          "app2/1": unitStatusFactory.build({
            machine: "1",
            subordinates: {
              "app1/1": unitStatusFactory.build(),
            },
          }),
        },
      }),
      // This application's machines should be included as it is a parent to app1.
      app3: applicationStatusFactory.build({
        units: {
          "app3/0": unitStatusFactory.build({
            machine: "2",
          }),
        },
      }),
      // This application's machines should not be included.
      app4: applicationStatusFactory.build({
        units: {
          "app4/0": unitStatusFactory.build({
            machine: "3",
          }),
        },
      }),
    };
    const machines = {
      0: machineStatusFactory.build({ id: "0" }),
      1: machineStatusFactory.build({ id: "1" }),
      2: machineStatusFactory.build({ id: "2" }),
      3: machineStatusFactory.build({ id: "3" }),
    };
    expect(getAppMachines("app1", applications, machines)).toStrictEqual({
      0: machines["0"],
      1: machines["1"],
      2: machines["2"],
    });
  });
});

describe("getAppUnits", () => {
  it("gets units for an application", () => {
    const applications = {
      // This application's units should not be included.
      app1: applicationStatusFactory.build({
        "subordinate-to": ["app2"],
      }),
      app2: applicationStatusFactory.build({
        units: {
          "app2/0": unitStatusFactory.build({
            machine: "0",
            subordinates: {
              "app1/0": unitStatusFactory.build(),
            },
          }),
          "app2/1": unitStatusFactory.build({
            machine: "1",
            subordinates: {
              "app1/1": unitStatusFactory.build(),
            },
          }),
        },
      }),
      // This application's units should not be included.
      app3: applicationStatusFactory.build({
        units: {
          "app3/0": unitStatusFactory.build(),
        },
      }),
    };
    expect(getAppUnits("app2", applications)).toStrictEqual({
      "app2/0": applications.app2.units["app2/0"],
      "app2/1": applications.app2.units["app2/1"],
    });
  });

  it("gets units for a subordinate application", () => {
    const applications = {
      app1: applicationStatusFactory.build({
        "subordinate-to": ["app2", "app3"],
      }),
      app2: applicationStatusFactory.build({
        units: {
          "app2/0": unitStatusFactory.build({
            machine: "0",
            subordinates: {
              "app1/0": unitStatusFactory.build(),
            },
          }),
          "app2/1": unitStatusFactory.build({
            machine: "1",
            subordinates: {
              "app1/1": unitStatusFactory.build(),
            },
          }),
        },
      }),
      app3: applicationStatusFactory.build({
        units: {
          "app3/0": unitStatusFactory.build({
            subordinates: {
              "app1/2": unitStatusFactory.build(),
            },
          }),
        },
      }),
      // This application should not be included.
      app4: applicationStatusFactory.build({
        units: {
          "app4/0": unitStatusFactory.build(),
        },
      }),
    };
    expect(getAppUnits("app1", applications)).toStrictEqual({
      "app1/0": applications.app2.units["app2/0"].subordinates["app1/0"],
      "app1/1": applications.app2.units["app2/1"].subordinates["app1/1"],
      "app1/2": applications.app3.units["app3/0"].subordinates["app1/2"],
    });
  });
});
