import { rootStateFactory } from "testing/factories";
import { generalStateFactory } from "testing/factories/general";
import { modelStatusInfoFactory } from "testing/factories/juju/ClientV6";
import { modelUserInfoFactory } from "testing/factories/juju/ModelManagerV9";
import {
  controllerFactory,
  jujuStateFactory,
  modelDataFactory,
  modelDataInfoFactory,
} from "testing/factories/juju/juju";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import {
  applicationInfoFactory,
  machineChangeDeltaFactory,
  modelWatcherModelDataFactory,
  relationChangeDeltaFactory,
  unitChangeDeltaFactory,
} from "testing/factories/juju/model-watcher";

import {
  getActiveUser,
  getActiveUsers,
  getAllModelApplicationStatus,
  getControllerData,
  getExternalUsers,
  getExternalUsersInModel,
  getFilteredModelData,
  getModelAccess,
  getModelAnnotations,
  getModelApplications,
  getModelByUUID,
  getModelControllerDataByUUID,
  getModelData,
  getModelDataByUUID,
  getModelInfo,
  getModelList,
  getModelListLoaded,
  getModelMachines,
  getModelRelations,
  getModelUUIDFromList,
  getModelUnits,
  getModelWatcherDataByUUID,
  getUserDomains,
  getUserDomainsInModel,
  hasModels,
} from "./selectors";

describe("selectors", () => {
  it("getModelData", () => {
    const modelData = {
      "wss://example.com": {
        uuid: "abc123",
        annotations: undefined,
        applications: {},
        machines: {},
        model: {},
        offers: {},
        relations: [],
        "remote-applications": {},
      },
    };
    expect(
      getModelData(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelData,
          }),
        })
      )
    ).toStrictEqual(modelData);
  });

  it("getControllerData", () => {
    const controllers = {
      "wss://example.com": [
        {
          path: "/",
          uuid: "abc123",
          version: "1",
        },
      ],
    };
    expect(
      getControllerData(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            controllers,
          }),
        })
      )
    ).toStrictEqual(controllers);
  });

  it("getModelWatcherDataByUUID", () => {
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build(),
    };
    expect(
      getModelWatcherDataByUUID("abc123")(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelWatcherData,
          }),
        })
      )
    ).toStrictEqual(modelWatcherData.abc123);
  });

  it("getModelInfo", () => {
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build(),
    };
    expect(
      getModelInfo("abc123")(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelWatcherData,
          }),
        })
      )
    ).toStrictEqual(modelWatcherData.abc123.model);
  });

  it("getModelUUID", () => {
    expect(
      getModelUUIDFromList(
        "a model",
        "eggman@external"
      )(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            models: {
              abc123: modelListInfoFactory.build({
                uuid: "abc123",
                name: "a model",
                ownerTag: "user-eggman@external",
              }),
            },
          }),
        })
      )
    ).toStrictEqual("abc123");
  });

  it("getModelAnnotations", () => {
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        annotations: {
          "ceph-mon": {
            "gui-x": "818",
            "gui-y": "563",
          },
        },
      }),
    };
    expect(
      getModelAnnotations("abc123")(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelWatcherData,
          }),
        })
      )
    ).toStrictEqual(modelWatcherData.abc123.annotations);
  });

  it("getModelApplications", () => {
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        applications: {
          "ceph-mon": applicationInfoFactory.build(),
        },
      }),
    };
    expect(
      getModelApplications("abc123")(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelWatcherData,
          }),
        })
      )
    ).toStrictEqual(modelWatcherData.abc123.applications);
  });

  it("getModelList", () => {
    const models = {
      abc123: modelListInfoFactory.build({
        wsControllerURL: "wss://example.com/api",
      }),
    };
    expect(
      getModelList(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            models,
          }),
        })
      )
    ).toStrictEqual(models);
  });

  it("getModelByUUID", () => {
    const models = {
      abc123: modelListInfoFactory.build({
        wsControllerURL: "wss://example.com/api",
      }),
    };
    expect(
      getModelByUUID(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            models,
          }),
        }),
        "abc123"
      )
    ).toStrictEqual(models.abc123);
  });

  it("getModelDataByUUID", () => {
    const modelData = {
      abc123: modelDataFactory.build(),
    };
    expect(
      getModelDataByUUID(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelData,
          }),
        }),
        "abc123"
      )
    ).toStrictEqual(modelData.abc123);
  });

  it("getModelAccess for a user with access to a model", () => {
    expect(
      getModelAccess(
        rootStateFactory.build({
          general: generalStateFactory.build({
            controllerConnections: {
              "wss://example.com/api": {
                user: {
                  "display-name": "eggman",
                  identity: "user-eggman@external",
                  "controller-access": "",
                  "model-access": "",
                },
              },
            },
          }),
          juju: jujuStateFactory.build({
            modelData: {
              abc123: modelDataFactory.build({
                info: modelDataInfoFactory.build({
                  users: [
                    modelUserInfoFactory.build({
                      user: "eggman@external",
                      access: "read",
                    }),
                  ],
                }),
              }),
            },
            models: {
              abc123: modelListInfoFactory.build({
                wsControllerURL: "wss://example.com/api",
              }),
            },
          }),
        }),
        "abc123"
      )
    ).toBe("read");
  });

  it("getModelAccess for a user with access to a controller", () => {
    expect(
      getModelAccess(
        rootStateFactory.build({
          general: generalStateFactory.build({
            controllerConnections: {
              "wss://example.com/api": {
                user: {
                  "display-name": "eggman",
                  identity: "user-eggman@external",
                  "controller-access": "superuser",
                  "model-access": "",
                },
              },
            },
          }),
          juju: jujuStateFactory.build({
            modelData: {
              abc123: modelDataFactory.build({
                info: modelDataInfoFactory.build({
                  users: [],
                }),
              }),
            },
            models: {
              abc123: modelListInfoFactory.build({
                wsControllerURL: "wss://example.com/api",
              }),
            },
          }),
        }),
        "abc123"
      )
    ).toBe("superuser");
  });

  it("getModelControllerDataByUUID", () => {
    const controllers = {
      "wss://example.com/api": [controllerFactory.build({ uuid: "abc123" })],
      "wss://test.com/api": [controllerFactory.build({ uuid: "def456" })],
    };
    expect(
      getModelControllerDataByUUID("def456")(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            controllers,
          }),
        })
      )
    ).toStrictEqual({
      ...controllerFactory.build({ uuid: "def456" }),
      url: "wss://test.com/api",
    });
  });

  it("getModelListLoaded", () => {
    expect(
      getModelListLoaded(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelsLoaded: true,
          }),
        })
      )
    ).toBe(true);
  });

  it("getModelUnits", () => {
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        units: {
          "ceph-mon/0": unitChangeDeltaFactory.build(),
        },
      }),
    };
    expect(
      getModelUnits("abc123")(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelWatcherData,
          }),
        })
      )
    ).toStrictEqual(modelWatcherData.abc123.units);
  });

  it("getModelRelations", () => {
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        relations: {
          "wordpress:db mysql:db": relationChangeDeltaFactory.build(),
        },
      }),
    };
    expect(
      getModelRelations("abc123")(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelWatcherData,
          }),
        })
      )
    ).toStrictEqual(modelWatcherData.abc123.relations);
  });

  it("getModelMachines", () => {
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        machines: { "0": machineChangeDeltaFactory.build() },
      }),
    };
    expect(
      getModelMachines("abc123")(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelWatcherData,
          }),
        })
      )
    ).toStrictEqual(modelWatcherData.abc123.machines);
  });

  it("getAllModelApplicationStatus", () => {
    const modelWatcherData = {
      abc123: modelWatcherModelDataFactory.build({
        units: {
          "ceph-mon/0": {
            "agent-status": {
              current: "idle",
              message: "",
              since: "2021-08-13T19:34:41.247417373Z",
              version: "2.8.7",
            },
            "workload-status": {
              current: "blocked",
              message:
                "Insufficient peer units to bootstrap cluster (require 3)",
              since: "2021-08-13T19:34:37.747827227Z",
              version: "",
            },
            application: "ceph-mon",
          },
        },
      }),
    };
    expect(
      getAllModelApplicationStatus("abc123")(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            modelWatcherData,
          }),
        })
      )
    ).toStrictEqual({ "ceph-mon": "blocked" });
  });

  it("hasModels", () => {
    expect(
      hasModels(
        rootStateFactory.build({
          juju: jujuStateFactory.build({
            models: {
              abc123: modelListInfoFactory.build(),
            },
          }),
        })
      )
    ).toBe(true);
  });

  it("getActiveUser", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.build({
        controllerConnections: {
          "wss://example.com/api": {
            user: {
              "display-name": "eggman",
              identity: "user-eggman@external",
              "controller-access": "",
              "model-access": "",
            },
          },
        },
      }),
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            wsControllerURL: "wss://example.com/api",
          }),
        },
      }),
    });
    expect(getActiveUser(state, "abc123")).toStrictEqual("eggman@external");
  });

  it("getActiveUsers", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.build({
        controllerConnections: {
          "wss://example.com/api": {
            user: {
              "display-name": "eggman",
              identity: "user-eggman@external",
              "controller-access": "",
              "model-access": "",
            },
          },
          "wss://test.com/api": {
            user: {
              "display-name": "spaceman",
              identity: "user-spaceman@external",
              "controller-access": "",
              "model-access": "",
            },
          },
        },
      }),
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            wsControllerURL: "wss://example.com/api",
          }),
          def456: modelListInfoFactory.build({
            wsControllerURL: "wss://test.com/api",
          }),
        },
      }),
    });
    expect(getActiveUsers(state)).toStrictEqual({
      abc123: "eggman@external",
      def456: "spaceman@external",
    });
  });

  it("getExternalUsers", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              users: [
                modelUserInfoFactory.build({ user: "eggman@external" }),
                modelUserInfoFactory.build({ user: "spaceman@domain" }),
                modelUserInfoFactory.build({ user: "frogman" }),
              ],
            }),
          }),
          def456: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              users: [
                modelUserInfoFactory.build({ user: "other@model2" }),
                modelUserInfoFactory.build({ user: "other2@anothermodel2" }),
                modelUserInfoFactory.build({ user: "other3" }),
              ],
            }),
          }),
        },
      }),
    });
    expect(getExternalUsers(state)).toStrictEqual([
      "eggman@external",
      "spaceman@domain",
      "other@model2",
      "other2@anothermodel2",
    ]);
  });

  it("getExternalUsersInModel", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              users: [
                modelUserInfoFactory.build({ user: "eggman@external" }),
                modelUserInfoFactory.build({ user: "spaceman@domain" }),
                modelUserInfoFactory.build({ user: "frogman" }),
              ],
            }),
          }),
          def456: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              users: [modelUserInfoFactory.build({ user: "other@model2" })],
            }),
          }),
        },
      }),
    });
    expect(getExternalUsersInModel(state, "abc123")).toStrictEqual([
      "eggman@external",
      "spaceman@domain",
    ]);
  });

  it("getUserDomains", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              users: [
                modelUserInfoFactory.build({ user: "eggman@external" }),
                modelUserInfoFactory.build({ user: "spaceman@domain" }),
                modelUserInfoFactory.build({ user: "frogman" }),
              ],
            }),
          }),
          def456: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              users: [
                modelUserInfoFactory.build({ user: "other@model2" }),
                modelUserInfoFactory.build({ user: "other2@external" }),
              ],
            }),
          }),
        },
      }),
    });
    expect(getUserDomains(state)).toStrictEqual([
      "external",
      "domain",
      "model2",
    ]);
  });

  it("getUserDomainsInModel", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              users: [
                modelUserInfoFactory.build({ user: "eggman@external" }),
                modelUserInfoFactory.build({ user: "spaceman@domain" }),
                modelUserInfoFactory.build({ user: "frogman" }),
                modelUserInfoFactory.build({ user: "fireman@external" }),
              ],
            }),
          }),
          def456: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              users: [modelUserInfoFactory.build({ user: "other@model2" })],
            }),
          }),
        },
      }),
    });
    expect(getUserDomainsInModel(state, "abc123")).toStrictEqual([
      "external",
      "domain",
    ]);
  });

  describe("getFilteredModelData", () => {
    it("filters by cloud", () => {
      const modelData = {
        abc123: modelDataFactory.build({
          model: modelStatusInfoFactory.build({
            "cloud-tag": "cloud-aws",
          }),
        }),
        def456: modelDataFactory.build({
          model: modelStatusInfoFactory.build({
            "cloud-tag": "cloud-google",
          }),
        }),
        ghi789: modelDataFactory.build({
          model: modelStatusInfoFactory.build({
            "cloud-tag": "cloud-azure",
          }),
        }),
      };
      const state = rootStateFactory.build({
        juju: jujuStateFactory.build({
          modelData,
        }),
      });
      expect(
        getFilteredModelData({ cloud: ["aws", "google"] })(state)
      ).toStrictEqual({
        abc123: modelData.abc123,
        def456: modelData.def456,
      });
    });

    it("filters by credential", () => {
      const modelData = {
        abc123: modelDataFactory.build({
          info: modelDataInfoFactory.build({
            "cloud-credential-tag": "cloudcred-google_eggman@external_juju",
          }),
        }),
        def456: modelDataFactory.build({
          info: modelDataInfoFactory.build({
            "cloud-credential-tag": "cloudcred-google_spaceman@external_juju",
          }),
        }),
        ghi789: modelDataFactory.build({
          info: modelDataInfoFactory.build({
            "cloud-credential-tag": "cloudcred-google_eggman_juju",
          }),
        }),
      };
      const state = rootStateFactory.build({
        juju: jujuStateFactory.build({
          modelData,
        }),
      });
      expect(
        getFilteredModelData({ credential: ["eggman", "eggman@external"] })(
          state
        )
      ).toStrictEqual({
        abc123: modelData.abc123,
        ghi789: modelData.ghi789,
      });
    });

    it("filters by region", () => {
      const modelData = {
        abc123: modelDataFactory.build({
          model: modelStatusInfoFactory.build({
            region: "east",
          }),
        }),
        def456: modelDataFactory.build({
          model: modelStatusInfoFactory.build({
            region: "west",
          }),
        }),
        ghi789: modelDataFactory.build({
          model: modelStatusInfoFactory.build({
            region: "north",
          }),
        }),
      };
      const state = rootStateFactory.build({
        juju: jujuStateFactory.build({
          modelData,
        }),
      });
      expect(
        getFilteredModelData({ region: ["west", "north"] })(state)
      ).toStrictEqual({
        def456: modelData.def456,
        ghi789: modelData.ghi789,
      });
    });

    it("filters by owner", () => {
      const modelData = {
        abc123: modelDataFactory.build({
          info: modelDataInfoFactory.build({
            "owner-tag": "user-eggman@external",
          }),
        }),
        def456: modelDataFactory.build({
          info: modelDataInfoFactory.build({
            "owner-tag": "user-spaceman@external",
          }),
        }),
        ghi789: modelDataFactory.build({
          info: modelDataInfoFactory.build({
            "owner-tag": "user-eggman",
          }),
        }),
      };
      const state = rootStateFactory.build({
        juju: jujuStateFactory.build({
          modelData,
        }),
      });
      expect(
        getFilteredModelData({ owner: ["eggman", "eggman@external"] })(state)
      ).toStrictEqual({
        abc123: modelData.abc123,
        ghi789: modelData.ghi789,
      });
    });

    it("filters by custom", () => {
      const modelData = {
        a1: modelDataFactory.build({
          model: modelStatusInfoFactory.build({
            name: "matches",
          }),
        }),
        b2: modelDataFactory.build({
          model: modelStatusInfoFactory.build({
            "cloud-tag": "matches",
          }),
        }),
        c3: modelDataFactory.build({
          info: modelDataInfoFactory.build({
            "cloud-credential-tag": "cloudcred-google_matches_juju",
          }),
        }),
        d4: modelDataFactory.build({
          model: modelStatusInfoFactory.build({
            region: "matches",
          }),
        }),
        e5: modelDataFactory.build({
          info: modelDataInfoFactory.build({
            "owner-tag": "user-matches",
          }),
        }),
        f6: modelDataFactory.build({
          model: modelStatusInfoFactory.build({
            name: "not this one!",
          }),
        }),
      };
      const state = rootStateFactory.build({
        juju: jujuStateFactory.build({
          modelData,
        }),
      });
      expect(getFilteredModelData({ custom: ["match"] })(state)).toStrictEqual({
        a1: modelData.a1,
        b2: modelData.b2,
        c3: modelData.c3,
        d4: modelData.d4,
        e5: modelData.e5,
      });
    });
  });
});
