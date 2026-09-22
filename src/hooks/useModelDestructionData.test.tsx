import { renderHook } from "@testing-library/react";
import type { JSX, PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router";

import { DestroyBlockedReason } from "store/juju/types";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  applicationOfferStatusFactory,
  applicationStatusFactory,
  machineStatusFactory,
  remoteApplicationStatusFactory,
  unitStatusFactory,
} from "testing/factories/juju/ClientV8";
import { modelInfoFactory } from "testing/factories/juju/ModelManagerV10";
import {
  jujuStateFactory,
  modelDataFactory,
  modelListInfoFactory,
} from "testing/factories/juju/juju";
import { createStore } from "testing/utils";

import useModelDestructionData from "./useModelDestructionData";

const generateContainer =
  (state: RootState, path: string, url: string) =>
  ({ children }: PropsWithChildren): JSX.Element => {
    window.happyDOM.setURL(url);
    const store = createStore(state);
    return (
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path={path} element={children} />
          </Routes>
        </BrowserRouter>
      </Provider>
    );
  };

describe("useModelDestructionData", () => {
  it("should return initial empty state when modelStatusData is null or empty", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            canConfigure: true,
          }),
        },
        modelData: {},
      }),
    });

    const { result } = renderHook(() => useModelDestructionData(["abc123"]), {
      wrapper: generateContainer(state, "*", "/models"),
    });

    expect(result.current["abc123"].hasStorage).toBe(false);
    expect(result.current["abc123"].applications).toEqual([]);
    expect(result.current["abc123"].machines).toEqual([]);
    expect(result.current["abc123"].crossModelRelations).toEqual([]);
    expect(result.current["abc123"].connectedOffers).toEqual([]);
    expect(result.current["abc123"].storageIDs).toEqual([]);

    expect(result.current["abc123"].unitCount).toBe(0);
    expect(result.current["abc123"].destroyBlockedReason).toBeNull();
  });

  it("should correctly count applications and machines", () => {
    const modelData = modelDataFactory.build({
      uuid: "abc123",
      info: modelInfoFactory.build({
        name: "test-model",
      }),
      applications: {
        easyrsa: applicationStatusFactory.build({
          units: {
            "easyrsa/0": unitStatusFactory.build(),
            "easyrsa/1": unitStatusFactory.build(),
            "easyrsa/3": unitStatusFactory.build(),
          },
        }),
      },
      machines: {
        "0": machineStatusFactory.build(),
        "1": machineStatusFactory.build(),
      },
    });
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelData,
        },
      }),
    });

    const { result } = renderHook(() => useModelDestructionData(["abc123"]), {
      wrapper: generateContainer(state, "*", "/models"),
    });

    expect(result.current["abc123"].applications).toEqual(["easyrsa"]);
    expect(result.current["abc123"].machines).toEqual(["0", "1"]);
  });

  it("should correctly extract storage IDs and set hasStorage to true", () => {
    const modelData = modelDataFactory.build({
      uuid: "abc123",
      info: modelInfoFactory.build({
        name: "test-model",
      }),
      storage: [
        {
          "storage-tag": "storage-easyrsa-0",
          kind: 0,
          "owner-tag": "admin",
          persistent: true,
          status: {
            info: "",
            since: "",
            status: "",
          },
        },
      ],
      applications: {
        easyrsa: applicationStatusFactory.build({
          units: {
            "easyrsa/0": unitStatusFactory.build(),
            "easyrsa/1": unitStatusFactory.build(),
            "easyrsa/3": unitStatusFactory.build(),
          },
        }),
      },
      machines: {
        "0": machineStatusFactory.build(),
        "1": machineStatusFactory.build(),
      },
    });
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelData,
        },
      }),
    });

    const { result } = renderHook(() => useModelDestructionData(["abc123"]), {
      wrapper: generateContainer(state, "*", "/models"),
    });

    expect(result.current["abc123"].storageIDs).toEqual(["easyrsa/0"]);
    expect(result.current["abc123"].hasStorage).toBe(true);
  });

  it("should correctly aggregate cross model relations from offers and remote applications", () => {
    const modelData = modelDataFactory.build({
      uuid: "abc123",
      info: modelInfoFactory.build({
        name: "test-model",
      }),
      offers: {
        http: applicationOfferStatusFactory.build({
          "total-connected-count": 2,
        }),
        nrpe: applicationOfferStatusFactory.build({
          "total-connected-count": undefined,
        }),
      },
      "remote-applications": {
        mysql: remoteApplicationStatusFactory.build(),
      },
      applications: {
        easyrsa: applicationStatusFactory.build({
          units: {
            "easyrsa/0": unitStatusFactory.build(),
          },
        }),
      },
      machines: {
        "0": machineStatusFactory.build(),
      },
    });
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelData,
        },
      }),
    });

    const { result } = renderHook(() => useModelDestructionData(["abc123"]), {
      wrapper: generateContainer(state, "*", "/models"),
    });

    expect(result.current["abc123"].crossModelRelations).toHaveLength(3);

    // Check Offer aggregation
    expect(result.current["abc123"].crossModelRelations[0]).toEqual({
      name: "http",
      endpoints: [],
      isConnectedOffer: true,
    });
    expect(result.current["abc123"].crossModelRelations[1]).toEqual({
      name: "nrpe",
      endpoints: [],
      isConnectedOffer: false,
    });

    // Check Remote Application aggregation
    expect(result.current["abc123"].crossModelRelations[2]).toEqual({
      name: "mysql",
      endpoints: [],
      isConnectedOffer: false,
    });
  });

  it("should generate connectedOffers list", () => {
    const modelData = modelDataFactory.build({
      uuid: "abc123",
      info: modelInfoFactory.build({
        name: "test-model",
      }),
      offers: {
        db: applicationOfferStatusFactory.build({
          "total-connected-count": 1,
          endpoints: {
            mockEndpoint: {
              interface: "mockInterface",
              name: "mockName",
            },
          },
        }),
        nrpe: applicationOfferStatusFactory.build({
          "total-connected-count": undefined,
          "application-name": "appName",
          endpoints: {
            mockEndpoint: {
              interface: "mockInterface2",
              name: "mockName2",
            },
          },
        }),
      },
    });
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelData,
        },
      }),
    });

    const { result } = renderHook(() => useModelDestructionData(["abc123"]), {
      wrapper: generateContainer(state, "*", "/models"),
    });

    expect(result.current["abc123"].connectedOffers).toHaveLength(1);

    // Check one of the mapped results
    expect(result.current["abc123"].connectedOffers[0]).toEqual({
      offerName: "db",
      applicationName: "etcd",
      endpoint: {
        name: "mockName",
        interface: "mockInterface",
      },
    });
  });

  it("should sum unit counts across all applications", () => {
    const modelData = modelDataFactory.build({
      uuid: "abc123",
      applications: {
        easyrsa: applicationStatusFactory.build({
          units: {
            "easyrsa/0": unitStatusFactory.build(),
            "easyrsa/1": unitStatusFactory.build(),
          },
        }),
        mysql: applicationStatusFactory.build({
          units: {
            "mysql/0": unitStatusFactory.build(),
          },
        }),
      },
    });
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: { abc123: modelData },
      }),
    });

    const { result } = renderHook(() => useModelDestructionData(["abc123"]), {
      wrapper: generateContainer(state, "*", "/models"),
    });
    expect(result.current["abc123"].unitCount).toBe(3);
  });

  it("should return unitCount of 0 when there are no applications", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: { abc123: modelDataFactory.build({ uuid: "abc123" }) },
      }),
    });

    const { result } = renderHook(() => useModelDestructionData(["abc123"]), {
      wrapper: generateContainer(state, "*", "/models"),
    });
    expect(result.current["abc123"].unitCount).toBe(0);
  });

  it("should return destroyBlockedReason as IS_CONTROLLER when model is a controller model", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelDataFactory.build({
            uuid: "abc123",
            info: modelInfoFactory.build({ "is-controller": true }),
          }),
        },
      }),
    });

    const { result } = renderHook(() => useModelDestructionData(["abc123"]), {
      wrapper: generateContainer(state, "*", "/models"),
    });
    expect(result.current["abc123"].destroyBlockedReason).toBe(
      DestroyBlockedReason.IS_CONTROLLER,
    );
  });

  it("should return destroyBlockedReason as NO_ACCESS when user cannot configure the model", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            canConfigure: false,
          }),
        },
        modelData: {
          abc123: modelDataFactory.build({
            uuid: "abc123",
            info: modelInfoFactory.build({ "is-controller": false }),
          }),
        },
      }),
    });

    const { result } = renderHook(() => useModelDestructionData(["abc123"]), {
      wrapper: generateContainer(state, "*", "/models"),
    });
    expect(result.current["abc123"].destroyBlockedReason).toBe(
      DestroyBlockedReason.NO_ACCESS,
    );
  });

  it("should return destroyBlockedReason as CONNECTED_OFFERS when there are offers with active connections", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            canConfigure: true,
          }),
        },
        modelData: {
          abc123: modelDataFactory.build({
            uuid: "abc123",
            info: modelInfoFactory.build({ "is-controller": false }),
            offers: {
              db: applicationOfferStatusFactory.build({
                "total-connected-count": 1,
              }),
            },
          }),
        },
      }),
    });

    const { result } = renderHook(() => useModelDestructionData(["abc123"]), {
      wrapper: generateContainer(state, "*", "/models"),
    });
    expect(result.current["abc123"].destroyBlockedReason).toBe(
      DestroyBlockedReason.CONNECTED_OFFERS,
    );
  });
});
