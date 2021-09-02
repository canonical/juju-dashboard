import { render, screen } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { QueryParamProvider } from "use-query-params";
import { MemoryRouter, Route } from "react-router";

import { reduxStateFactory } from "testing/redux-factory";

import TestRoute from "components/Routes/TestRoute";

import EntityDetails from "./EntityDetails";

jest.mock("components/Topology/Topology", () => {
  const Topology = () => <div className="topology"></div>;
  return Topology;
});

const mockStore = configureStore([]);

describe("Entity Details Container", () => {
  function renderComponent({ type } = {}, mockFactoryData) {
    const mockState = reduxStateFactory().build(
      {},
      { transient: mockFactoryData }
    );
    const store = mockStore(mockState);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/kirk@external/enterprise"]}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <TestRoute path="/models/:userName/:modelName?">
              <EntityDetails type={type} />
            </TestRoute>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
  }

  it("should display the correct window title", () => {
    renderComponent();
    expect(document.title).toEqual("Model: enterprise | Juju Dashboard");
  });

  it("lists the correct tabs", () => {
    renderComponent({ type: "model" });
    expect(screen.getByTestId("view-selector").textContent).toBe(
      "ApplicationsIntegrationsAction LogsMachines"
    );
  });

  it("lists the correct tabs for kubernetes", () => {
    renderComponent(
      { type: "model" },
      {
        models: [
          { name: "enterprise", owner: "kirk@external", type: "kubernetes" },
        ],
      }
    );
    expect(screen.getByTestId("view-selector").textContent).toBe(
      "ApplicationsIntegrationsAction Logs"
    );
  });
});
