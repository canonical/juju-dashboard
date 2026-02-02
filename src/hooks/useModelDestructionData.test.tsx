import { renderHook } from "@testing-library/react";
import type { JSX, PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  applicationOfferStatusFactory,
  applicationStatusFactory,
  machineStatusFactory,
  remoteApplicationStatusFactory,
  unitStatusFactory,
} from "testing/factories/juju/ClientV7";
import { modelInfoFactory } from "testing/factories/juju/ModelManagerV9";
import {
  jujuStateFactory,
  modelDataFactory,
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
        modelData: {},
      }),
    });

    const { result } = renderHook(() => useModelDestructionData("abc123"), {
      wrapper: generateContainer(state, "*", "/models"),
    });

    expect(result.current.hasStorage).toBe(false);
    expect(result.current.applications).toEqual([]);
    expect(result.current.machines).toEqual([]);
    expect(result.current.crossModelRelations).toEqual([]);
    expect(result.current.connectedOffers).toEqual([]);
    expect(result.current.storageIDs).toEqual([]);
    expect(result.current.showInfoTable).toBe(false);
  });

  it("should correctly count applications and machines and set showInfoTable to true", () => {
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

    const { result } = renderHook(() => useModelDestructionData("abc123"), {
      wrapper: generateContainer(state, "*", "/models"),
    });

    expect(result.current.applications).toEqual(["easyrsa"]);
    expect(result.current.machines).toEqual(["0", "1"]);
    expect(result.current.showInfoTable).toBe(true);
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

    const { result } = renderHook(() => useModelDestructionData("abc123"), {
      wrapper: generateContainer(state, "*", "/models"),
    });

    expect(result.current.storageIDs).toEqual(["easyrsa/0"]);
    expect(result.current.hasStorage).toBe(true);
    expect(result.current.showInfoTable).toBe(true);
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

    const { result } = renderHook(() => useModelDestructionData("abc123"), {
      wrapper: generateContainer(state, "*", "/models"),
    });

    expect(result.current.crossModelRelations).toHaveLength(3);
    expect(result.current.showInfoTable).toBe(true);

    // Check Offer aggregation
    expect(result.current.crossModelRelations[0]).toEqual({
      name: "http",
      endpoints: [],
      isConnectedOffer: true,
    });
    expect(result.current.crossModelRelations[1]).toEqual({
      name: "nrpe",
      endpoints: [],
      isConnectedOffer: false,
    });

    // Check Remote Application aggregation
    expect(result.current.crossModelRelations[2]).toEqual({
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

    const { result } = renderHook(() => useModelDestructionData("abc123"), {
      wrapper: generateContainer(state, "*", "/models"),
    });

    expect(result.current.connectedOffers).toHaveLength(1);

    // Check one of the mapped results
    expect(result.current.connectedOffers[0]).toEqual({
      offerName: "db",
      applicationName: "etcd",
      endpoint: {
        name: "mockName",
        interface: "mockInterface",
      },
    });
  });
});
