import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

import type { RootState } from "store/store";
import { modelStatusInfoFactory } from "testing/factories/juju/ClientV6";
import {
  jujuStateFactory,
  modelDataFactory,
  modelDataApplicationFactory,
  modelDataStatusFactory,
  modelListInfoFactory,
  modelDataInfoFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";

import ModelsIndex, { Label, TestId } from "./ModelsIndex";

const mockStore = configureStore([]);

describe("Models Index page", () => {
  let state: RootState;

  beforeEach(() => {
    window.history.pushState({}, "", "/");
    state = rootStateFactory.withGeneralConfig().build({
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            wsControllerURL: "wss://jimm.jujucharms.com/api",
          }),
        },
        modelData: {
          abc123: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              "cloud-tag": "cloud-aws",
            }),
            model: modelStatusInfoFactory.build({
              "cloud-tag": "cloud-aws",
            }),
            applications: {
              easyrsa: modelDataApplicationFactory.build({
                status: modelDataStatusFactory.build({
                  status: "blocked",
                }),
              }),
            },
          }),
          def456: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              "cloud-tag": "cloud-gce",
            }),
            model: modelStatusInfoFactory.build({
              "cloud-tag": "cloud-gce",
            }),
            applications: {
              cockroachdb: modelDataApplicationFactory.build({
                status: modelDataStatusFactory.build({
                  status: "running",
                }),
              }),
            },
          }),
          ghi789: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              "cloud-tag": "cloud-aws",
            }),
            model: modelStatusInfoFactory.build({
              "cloud-tag": "cloud-aws",
            }),
            applications: {
              elasticsearch: modelDataApplicationFactory.build({
                status: modelDataStatusFactory.build({
                  status: "unknown",
                }),
              }),
            },
          }),
        },
        modelsLoaded: true,
      }),
    });
  });

  it("renders without crashing", () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ModelsIndex />
        </MemoryRouter>
      </Provider>
    );
    expect(document.querySelector(".header")).toBeInTheDocument();
    expect(screen.getAllByRole("grid")).toHaveLength(3);
    expect(document.querySelector(".chip-group")).toBeInTheDocument();
  });

  it("displays a spinner while loading models", () => {
    state.juju.modelsLoaded = false;
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ModelsIndex />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByTestId(TestId.LOADING)).toBeInTheDocument();
  });

  it("displays a message if there are no models", () => {
    state.juju.models = {};
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ModelsIndex />
        </MemoryRouter>
      </Provider>
    );
    expect(
      screen.getByRole("heading", { name: Label.NOT_FOUND })
    ).toBeInTheDocument();
  });

  it("displays correct grouping view", async () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ModelsIndex />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByRole("link", { name: "status" })).toHaveClass(
      "is-selected"
    );
    const ownerButton = screen.getByRole("link", { name: "owner" });
    await userEvent.click(ownerButton);
    expect(ownerButton).toHaveClass("is-selected");
    const searchParams = new URLSearchParams(window.location.search);
    expect(searchParams.get("groupedby")).toEqual("owner");
    expect(document.querySelector(".owners-group")).toBeInTheDocument();
  });

  it("should display the correct window title", () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ModelsIndex />
        </BrowserRouter>
      </Provider>
    );
    const pageTitle = document.title;
    expect(pageTitle).toEqual("Models | Juju Dashboard");
  });

  it("can filter models via the URL", () => {
    const params = new URLSearchParams({
      cloud: "aws",
    });
    window.history.pushState({}, "", `?${params.toString()}`);
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ModelsIndex />
        </BrowserRouter>
      </Provider>
    );
    // There should be two tables, one for each status:
    expect(screen.getAllByRole("grid")).toHaveLength(2);
    // There will be one extra row for each table header:
    expect(screen.getAllByRole("row")).toHaveLength(4);
    expect(screen.getAllByTestId("column-cloud")).toHaveLength(2);
    expect(screen.getAllByTestId("column-cloud")[0]).toHaveTextContent(
      "aws/us-east1"
    );
    expect(screen.getAllByTestId("column-cloud")[1]).toHaveTextContent(
      "aws/us-east1"
    );
  });

  it("can change model filters", async () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ModelsIndex />
        </BrowserRouter>
      </Provider>
    );
    // There should be three tables, one for each status:
    expect(screen.getAllByRole("grid")).toHaveLength(3);
    // There will be one extra row for each table header:
    expect(screen.getAllByRole("row")).toHaveLength(6);
    await userEvent.click(
      screen.getByRole("searchbox", { name: "Search and filter" })
    );
    await userEvent.click(screen.getByRole("button", { name: "CLOUD aws" }));
    // There should now be two tables, one for each status:
    expect(screen.getAllByRole("grid")).toHaveLength(2);
    // There will be one extra row for each table header:
    expect(screen.getAllByRole("row")).toHaveLength(4);
    expect(screen.getAllByTestId("column-cloud")).toHaveLength(2);
    expect(screen.getAllByTestId("column-cloud")[0]).toHaveTextContent(
      "aws/us-east1"
    );
    expect(screen.getAllByTestId("column-cloud")[1]).toHaveTextContent(
      "aws/us-east1"
    );
    const params = new URLSearchParams({
      cloud: "aws",
      owner: "",
      region: "",
      credential: "",
      custom: "",
    });
    expect(window.location.search).toBe(`?${params.toString()}`);
  });
});
