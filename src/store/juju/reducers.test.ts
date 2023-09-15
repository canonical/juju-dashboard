import { DeltaChangeTypes, DeltaEntityTypes } from "juju/types";
import {
  charmInfoFactory,
  charmApplicationFactory,
} from "testing/factories/juju/Charms";
import { fullStatusFactory } from "testing/factories/juju/ClientV6";
import { modelInfoFactory } from "testing/factories/juju/ModelManagerV9";
import {
  controllerFactory,
  jujuStateFactory,
  modelDataFactory,
  modelListInfoFactory,
  crossModelQueryStateFactory,
} from "testing/factories/juju/juju";
import {
  modelWatcherModelDataFactory,
  modelWatcherModelInfoFactory,
} from "testing/factories/juju/model-watcher";

import { actions, reducer } from "./slice";

const status = fullStatusFactory.build({
  model: {
    "available-version": "",
    "cloud-tag": "",
    "meter-status": {
      color: "",
      message: "",
    },
    "model-status": {
      data: {},
      info: "",
      kind: "",
      life: "",
      since: "",
      status: "",
      version: "",
    },
    name: "",
    sla: "",
    type: "",
    version: "",
    region: "west",
  },
});

const model = modelDataFactory.build({
  uuid: "abc123",
  applications: status.applications,
  machines: status.machines,
  model: status.model,
  offers: status.offers,
  relations: status.relations,
  "remote-applications": status["remote-applications"],
});

describe("reducers", () => {
  it("default", () => {
    expect(reducer(undefined, { type: "" })).toStrictEqual(
      jujuStateFactory.build()
    );
  });

  it("updateModelList", () => {
    const state = jujuStateFactory.build({ modelsLoaded: false });
    expect(
      reducer(
        state,
        actions.updateModelList({
          models: {
            "user-models": [
              {
                model: {
                  uuid: "abc123",
                  name: "a model",
                  "owner-tag": "user-eggman@external",
                  type: "model",
                },
                "last-connection": "today",
              },
            ],
          },
          wsControllerURL: "wss://example.com",
        })
      )
    ).toStrictEqual({
      ...state,
      models: {
        abc123: modelListInfoFactory.build({
          uuid: "abc123",
          name: "a model",
          ownerTag: "user-eggman@external",
          type: "model",
          wsControllerURL: "wss://example.com",
        }),
      },
      modelsLoaded: true,
    });
  });

  it("updateModelStatus", () => {
    const updatedModel = {
      ...model,
      uuid: "abc123",
    };
    delete updatedModel.info;
    const state = jujuStateFactory.build();
    expect(
      reducer(
        state,
        actions.updateModelStatus({
          modelUUID: "abc123",
          status,
          wsControllerURL: "wss://example.com",
        })
      )
    ).toStrictEqual({
      ...state,
      modelData: {
        abc123: updatedModel,
      },
    });
  });

  it("updateModelInfo", () => {
    const state = jujuStateFactory.build({
      modelData: {
        abc123: model,
      },
    });
    const modelInfo = {
      results: [
        {
          error: {
            code: "",
            message: "",
          },
          result: modelInfoFactory.build(),
        },
      ],
    };
    expect(
      reducer(
        state,
        actions.updateModelInfo({
          modelInfo,
          wsControllerURL: "wss://example.com",
        })
      )
    ).toStrictEqual({
      ...state,
      modelData: {
        abc123: {
          ...model,
          info: modelInfo.results[0].result,
        },
      },
    });
  });

  it("clearModelData", () => {
    const state = jujuStateFactory.build({
      modelData: {
        abc123: model,
      },
      models: {
        abc123: modelListInfoFactory.build(),
      },
      modelsLoaded: true,
    });
    expect(reducer(state, actions.clearModelData())).toStrictEqual(
      jujuStateFactory.build({ modelsLoaded: false })
    );
  });

  it("fetchCrossModelQuery", () => {
    const state = jujuStateFactory.build({
      crossModelQuery: crossModelQueryStateFactory.build({ loading: false }),
    });
    expect(
      reducer(
        state,
        actions.fetchCrossModelQuery({
          wsControllerURL: "wss://example.com",
          query: ".",
        })
      )
    ).toStrictEqual({
      ...state,
      crossModelQuery: crossModelQueryStateFactory.build({ loading: true }),
    });
  });

  it("updateCrossModelQuery", () => {
    const state = jujuStateFactory.build({
      crossModelQuery: crossModelQueryStateFactory.build({
        results: null,
        errors: null,
        loaded: false,
        loading: true,
      }),
    });
    const results = { mockResultKey: ["mockResultValue"] };
    const errors = { mockErrorKey: ["mockErrorValue"] };
    expect(
      reducer(state, actions.updateCrossModelQuery({ results, errors }))
    ).toStrictEqual({
      ...state,
      crossModelQuery: crossModelQueryStateFactory.build({
        results,
        errors,
        loaded: true,
        loading: false,
      }),
    });
  });

  it("clearCrossModelQuery", () => {
    const results = { mockResultKey: ["mockResultValue"] };
    const errors = { mockErrorKey: ["mockErrorValue"] };
    const state = jujuStateFactory.build({
      crossModelQuery: crossModelQueryStateFactory.build({
        results,
        errors,
        loaded: true,
        loading: true,
      }),
    });
    expect(reducer(state, actions.clearCrossModelQuery())).toStrictEqual({
      ...state,
      crossModelQuery: crossModelQueryStateFactory.build({
        results: null,
        errors: null,
        loaded: false,
        loading: false,
      }),
    });
  });

  it("clearControllerData", () => {
    const state = jujuStateFactory.build({
      controllers: {
        "wss://example.com": [controllerFactory.build()],
      },
    });
    expect(reducer(state, actions.clearControllerData())).toStrictEqual({
      ...state,
      controllers: {},
    });
  });

  it("updateControllerList", () => {
    const state = jujuStateFactory.build();
    const controllers = [controllerFactory.build()];
    expect(
      reducer(
        state,
        actions.updateControllerList({
          controllers,
          wsControllerURL: "wss://example.com",
        })
      )
    ).toStrictEqual({
      ...state,
      controllers: {
        "wss://example.com": controllers,
      },
    });
  });

  it("populateMissingAllWatcherData", () => {
    const state = jujuStateFactory.build({
      modelWatcherData: { abc123: modelWatcherModelDataFactory.build() },
    });
    expect(
      reducer(
        state,
        actions.populateMissingAllWatcherData({
          status,
          uuid: "abc123",
        })
      )
    ).toStrictEqual({
      ...state,
      modelWatcherData: {
        abc123: modelWatcherModelDataFactory.build({
          ...state.modelWatcherData?.abc123,
          model: modelWatcherModelInfoFactory.build({
            ...state.modelWatcherData?.abc123.model,
            cloud: status.model["cloud-tag"],
            type: status.model.type,
            "cloud-region": status.model.region,
            version: status.model.version,
          }),
        }),
      },
    });
  });

  it("processAllWatcherDeltas", () => {
    const state = jujuStateFactory.build({
      modelWatcherData: {
        abc123: modelWatcherModelDataFactory.build({
          annotations: {
            "ceph-mon": {
              "gui-x": "818",
              "gui-y": "563",
            },
          },
        }),
      },
    });
    expect(state.modelWatcherData?.abc123.annotations).toStrictEqual({
      "ceph-mon": {
        "gui-x": "818",
        "gui-y": "563",
      },
    });
    const reducedState = reducer(
      state,
      actions.processAllWatcherDeltas([
        [
          DeltaEntityTypes.ANNOTATION,
          DeltaChangeTypes.CHANGE,
          {
            "model-uuid": "abc123",
            tag: "application-etcd",
            annotations: { new: "changed" },
          },
        ],
      ])
    );
    expect(reducedState.modelWatcherData?.abc123.annotations).toStrictEqual({
      etcd: {
        new: "changed",
      },
      "ceph-mon": {
        "gui-x": "818",
        "gui-y": "563",
      },
    });
  });

  it("updateCharms", () => {
    const state = jujuStateFactory.build({
      charms: [
        charmInfoFactory.build({ url: "ch:mysql" }),
        charmInfoFactory.build({ url: "ch:ceph" }),
      ],
    });
    const charms = [
      charmInfoFactory.build({ url: "ch:postgres" }),
      charmInfoFactory.build({ url: "ch:ceph" }),
    ];
    expect(
      reducer(
        state,
        actions.updateCharms({
          charms,
          wsControllerURL: "wss://test.example.com",
        })
      )
    ).toStrictEqual({
      ...state,
      charms: [
        charmInfoFactory.build({ url: "ch:mysql" }),
        charmInfoFactory.build({ url: "ch:ceph" }),
        charmInfoFactory.build({ url: "ch:postgres" }),
      ],
    });
  });

  it("updateSelectedApplications", () => {
    const state = jujuStateFactory.build({
      selectedApplications: [
        charmApplicationFactory.build({ "charm-url": "ch:mysql" }),
      ],
    });
    const selectedApplications = [
      charmApplicationFactory.build({ "charm-url": "ch:ceph" }),
    ];
    expect(
      reducer(
        state,
        actions.updateSelectedApplications({
          selectedApplications,
        })
      )
    ).toStrictEqual({
      ...state,
      selectedApplications,
    });
  });
});
