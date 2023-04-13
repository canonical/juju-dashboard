import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

import type { RootState } from "store/store";
import {
  jujuStateFactory,
  modelDataFactory,
  modelDataApplicationFactory,
  modelDataStatusFactory,
  modelListInfoFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";

import ModelsIndex, { Label, TestId } from "./ModelsIndex";

const mockStore = configureStore([]);

describe("Models Index page", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.withGeneralConfig().build({
      juju: jujuStateFactory.build({
        models: {
          abc124: modelListInfoFactory.build(),
        },
        modelData: {
          abc123: modelDataFactory.build({
            applications: {
              easyrsa: modelDataApplicationFactory.build({
                status: modelDataStatusFactory.build({
                  status: "blocked",
                }),
              }),
            },
          }),
          def456: modelDataFactory.build({
            applications: {
              cockroachdb: modelDataApplicationFactory.build({
                status: modelDataStatusFactory.build({
                  status: "running",
                }),
              }),
            },
          }),
          ghi789: modelDataFactory.build({
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
});
