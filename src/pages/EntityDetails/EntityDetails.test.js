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

jest.mock("components/WebCLI/WebCLI", () => {
  const WebCLI = () => <div className="webcli" data-testid="webcli"></div>;
  return WebCLI;
});

const mockStore = configureStore([]);

describe("Entity Details Container", () => {
  function renderComponent({ props, overrides, transient } = {}) {
    const mockState = reduxStateFactory().build(overrides, { transient });
    const store = mockStore(mockState);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/kirk@external/enterprise"]}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <TestRoute path="/models/:userName/:modelName?">
              <EntityDetails type={props?.type}>
                {props?.children}
              </EntityDetails>
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

  it("should show a spinner if waiting on data", () => {
    renderComponent({
      overrides: {
        juju: {
          models: null,
          modelWatcherData: null,
        },
      },
    });
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("lists the correct tabs", () => {
    renderComponent({ props: { type: "model" } });
    expect(screen.getByTestId("view-selector")).toHaveTextContent(
      /^ApplicationsIntegrationsAction LogsMachines$/
    );
  });

  it("lists the correct tabs for kubernetes", () => {
    renderComponent({
      props: { type: "model" },
      transient: {
        models: [
          { name: "enterprise", owner: "kirk@external", type: "kubernetes" },
        ],
      },
    });
    expect(screen.getByTestId("view-selector")).toHaveTextContent(
      /^ApplicationsIntegrationsAction Logs$/
    );
  });

  it("shows the supplied child", () => {
    const children = "Hello I am a child!";
    renderComponent({ props: { children } });
    expect(screen.getByText(children)).toBeInTheDocument();
  });

  it("shows the CLI in juju 2.9", () => {
    renderComponent();
    expect(screen.queryByTestId("webcli")).toBeInTheDocument();
  });

  it("does not show the webCLI in juju 2.8", () => {
    renderComponent({
      transient: {
        models: [
          { name: "enterprise", owner: "kirk@external", version: "2.8.7" },
        ],
      },
    });
    expect(screen.queryByTestId("webcli")).not.toBeInTheDocument();
  });
});
