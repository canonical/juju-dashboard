import { act, render, screen, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { jujuStateFactory, rootStateFactory } from "testing/factories";
import {
  applicationInfoFactory,
  modelWatcherModelDataFactory,
  modelWatcherModelInfoFactory,
} from "testing/factories/juju/model-watcher";

import { modelListInfoFactory } from "testing/factories/juju/juju";
import { RootState } from "store/store";

import InfoPanel from "./InfoPanel";

const mockStore = configureStore([]);

jest.mock("components/Topology/Topology", () => {
  const Topology = () => <div data-testid="topology"></div>;
  return Topology;
});

describe("Info Panel", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            name: "enterprise",
            ownerTag: "user-kirk@external",
          }),
        },
        modelWatcherData: {
          abc123: modelWatcherModelDataFactory.build({
            applications: {
              "ceph-mon": applicationInfoFactory.build(),
            },
            model: modelWatcherModelInfoFactory.build({
              name: "enterprise",
              owner: "kirk@external",
            }),
          }),
        },
      }),
    });
  });

  it("renders the topology", () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/kirk@external/enterprise"]}>
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={<InfoPanel />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByTestId("topology")).toBeInTheDocument();
  });

  it("renders the expanded topology on click", async () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/kirk@external/enterprise"]}>
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={<InfoPanel />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    act(() => screen.getByRole("button").click());
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
  });
});
