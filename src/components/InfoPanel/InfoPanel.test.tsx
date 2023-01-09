import { act, render, screen, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";

import { jujuStateFactory, rootStateFactory } from "testing/factories";

import InfoPanel from "./InfoPanel";

const mockStore = configureStore([]);

jest.mock("components/Topology/Topology", () => {
  const Topology = () => <div data-testid="topology"></div>;
  return Topology;
});

describe("Info Panel", () => {
  it("renders the topology", () => {
    const mockState = rootStateFactory.build({
      juju: jujuStateFactory.build(
        {},
        {
          transient: {
            models: [
              {
                name: "enterprise",
                owner: "kirk@external",
              },
            ],
          },
        }
      ),
    });
    const store = mockStore(mockState);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/kirk@external/enterprise"]}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route
                path="/models/:userName/:modelName"
                element={<InfoPanel />}
              />
            </Routes>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByTestId("topology")).toBeInTheDocument();
  });

  it("renders the expanded topology on click", async () => {
    const mockState = rootStateFactory.build({
      juju: jujuStateFactory.build(
        {},
        {
          transient: {
            models: [
              {
                name: "enterprise",
                owner: "kirk@external",
              },
            ],
          },
        }
      ),
    });
    const store = mockStore(mockState);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/kirk@external/enterprise"]}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route
                path="/models/:userName/:modelName"
                element={<InfoPanel />}
              />
            </Routes>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    act(() => screen.getByRole("button").click());
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
  });
});
