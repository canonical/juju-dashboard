import { TSFixMe } from "@canonical/react-components";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import mergeWith from "lodash.mergewith";
import { ReactNode } from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import configureStore from "redux-mock-store";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";

import { jujuStateFactory, rootStateFactory } from "testing/factories";

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

type Props = {
  children?: ReactNode;
  type?: string;
  onApplicationsFilter?: (query: string) => void;
};

describe("Entity Details Container", () => {
  // TSFixMe factories need to use Juju types.
  function renderComponent({
    props,
    overrides,
  }: { props?: Props; overrides?: TSFixMe } = {}) {
    if (!overrides?.juju) {
      overrides = mergeWith(
        {
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
        },
        overrides ?? {}
      );
    }
    const mockState = rootStateFactory.withGeneralConfig().build(overrides);
    const store = mockStore(mockState);

    window.history.pushState({}, "", "/models/kirk@external/enterprise");
    render(
      <Provider store={store}>
        <BrowserRouter>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route
                path="/models/:userName/:modelName"
                element={
                  <EntityDetails
                    type={props?.type}
                    onApplicationsFilter={props?.onApplicationsFilter}
                  >
                    {props?.children}
                  </EntityDetails>
                }
              />
            </Routes>
          </QueryParamProvider>
        </BrowserRouter>
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
      overrides: {
        juju: jujuStateFactory.build(
          {},
          {
            transient: {
              models: [
                {
                  name: "enterprise",
                  owner: "kirk@external",
                  type: "kubernetes",
                },
              ],
            },
          }
        ),
      },
    });
    expect(screen.getByTestId("view-selector")).toHaveTextContent(
      /^ApplicationsIntegrationsAction Logs$/
    );
  });

  it("clicking the tabs changes the visible section", () => {
    renderComponent({ props: { type: "model" } });
    const viewSelector = screen.getByTestId("view-selector");
    const sections = [
      {
        text: "Applications",
        query: "apps",
      },
      {
        text: "Integrations",
        query: "integrations",
      },
      {
        text: "Action Logs",
        query: "action-logs",
      },
      {
        text: "Machines",
        query: "machines",
      },
    ];
    sections.forEach(async (section) => {
      const scrollIntoView = jest.fn();
      fireEvent.click(within(viewSelector).getByText(section.text), {
        target: {
          scrollIntoView,
        },
      });
      expect(scrollIntoView.mock.calls[0]).toEqual([
        {
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        },
      ]);
      expect(window.location.search).toEqual(`?activeView=${section.query}`);
    });
  });

  it("shows the supplied child", () => {
    const children = "Hello I am a child!";
    renderComponent({ props: { children } });
    expect(screen.getByText(children)).toBeInTheDocument();
  });

  it("shows the CLI in juju 2.9", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.queryByTestId("webcli")).toBeInTheDocument();
    });
  });

  it("does not show the webCLI in juju 2.8", async () => {
    renderComponent({
      overrides: {
        juju: jujuStateFactory.build(
          {},
          {
            transient: {
              models: [
                {
                  name: "enterprise",
                  owner: "kirk@external",
                  version: "2.8.7",
                },
              ],
            },
          }
        ),
      },
    });
    await waitFor(() => {
      expect(screen.queryByTestId("webcli")).not.toBeInTheDocument();
    });
  });

  it("shows the search & filter box in the apps tab", async () => {
    renderComponent({ props: { type: "model" } });
    expect(screen.getByTestId("filter-applications")).toBeInTheDocument();
  });

  it("does not show the search & filter box in the integrations tab", async () => {
    renderComponent({ props: { type: "model" } });
    const viewSelector = screen.getByTestId("view-selector");
    fireEvent.click(within(viewSelector).getByText("Integrations"), {
      target: {
        scrollIntoView: jest.fn(),
      },
    });
    expect(screen.queryByTestId("filter-applications")).not.toBeInTheDocument();
  });

  it("calls the onApplicationsFilter only when the user submit the input value", async () => {
    const onApplicationsFilter = jest.fn();
    renderComponent({
      props: { type: "model", onApplicationsFilter },
    });
    const input = screen.getByTestId("filter-applications");
    fireEvent.change(input, { target: { value: "test" } });
    expect(onApplicationsFilter).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    expect(onApplicationsFilter).toHaveBeenCalledWith("test");
  });
});
