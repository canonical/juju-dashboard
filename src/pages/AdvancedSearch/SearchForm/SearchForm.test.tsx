import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as componentUtils from "components/utils";
import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { generalStateFactory, configFactory } from "testing/factories/general";
import { crossModelQueryFactory } from "testing/factories/juju/jimm";
import { renderComponent } from "testing/utils";

import SearchForm, { Label, QUERY_HISTORY_KEY } from "./SearchForm";

jest.mock("components/utils", () => ({
  ...jest.requireActual("components/utils"),
  copyToClipboard: jest.fn(),
}));

describe("SearchForm", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.withGeneralConfig().build({
      general: generalStateFactory.build({
        controllerConnections: {
          "wss://controller.example.com": { controllerTag: "controller" },
        },
        config: configFactory.build({
          controllerAPIEndpoint: "wss://controller.example.com",
        }),
      }),
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should initialise the form with the query from the URL", async () => {
    renderComponent(<SearchForm />, { state, url: "/?q=.applications" });
    expect(screen.getByRole("textbox")).toHaveTextContent(".applications");
  });

  it("performs a search if there is a query in the URL", async () => {
    const { store } = renderComponent(<SearchForm />, {
      state,
      url: "/?q=.applications",
    });
    const action = jujuActions.fetchCrossModelQuery({
      query: ".applications",
      wsControllerURL: "wss://controller.example.com",
    });
    expect(
      store.getActions().find((dispatch) => dispatch.type === action.type),
    ).toMatchObject(action);
  });

  it("submits the form if enter is pressed in the input", async () => {
    renderComponent(<SearchForm />, { state });
    await userEvent.type(screen.getByRole("textbox"), ".applications{Enter}");
    expect(window.location.search).toBe("?q=.applications");
  });

  it("should store the query in local storage when submitting the form", async () => {
    renderComponent(<SearchForm />, { state });
    await userEvent.type(screen.getByRole("textbox"), ".applications");
    await userEvent.click(screen.getByRole("button", { name: Label.SEARCH }));
    expect(window.localStorage.getItem(QUERY_HISTORY_KEY)).toBe(
      JSON.stringify([".applications"]),
    );
  });

  it("should move duplicate queries to the top in local storage", async () => {
    renderComponent(<SearchForm />, { state });
    await userEvent.type(screen.getByRole("textbox"), ".applications{Enter}");
    await userEvent.clear(screen.getByRole("textbox"));
    await userEvent.type(screen.getByRole("textbox"), ".machines{Enter}");
    expect(window.localStorage.getItem(QUERY_HISTORY_KEY)).toBe(
      JSON.stringify([".machines", ".applications"]),
    );
    await userEvent.clear(screen.getByRole("textbox"));
    await userEvent.type(screen.getByRole("textbox"), ".applications{Enter}");
    expect(window.localStorage.getItem(QUERY_HISTORY_KEY)).toBe(
      JSON.stringify([".applications", ".machines"]),
    );
  });

  it("should have the copy json button dissabled when cross model query isn't loaded", () => {
    renderComponent(<SearchForm />, { state, url: "/q=." });
    expect(
      screen.getByRole("button", {
        name: Label.COPY_JSON,
      }),
    ).toBeDisabled();
  });

  it("should have the copy json button dissabled when cross model query is loading", () => {
    state.juju.crossModelQuery.loaded = true;
    state.juju.crossModelQuery.loading = true;
    renderComponent(<SearchForm />, { state, url: "/q=." });
    expect(
      screen.getByRole("button", {
        name: Label.COPY_JSON,
      }),
    ).toBeDisabled();
  });

  it("should have the copy json button dissabled when cross model query returns error", () => {
    state.juju.crossModelQuery.loaded = true;
    state.juju.crossModelQuery.loading = false;
    state.juju.crossModelQuery.errors = "mockErrors";
    renderComponent(<SearchForm />, { state, url: "/q=." });
    expect(
      screen.getByRole("button", {
        name: Label.COPY_JSON,
      }),
    ).toBeDisabled();
  });

  it("should copy the cross-model query results", async () => {
    const mockResults = {
      mockModelUUID: [crossModelQueryFactory.withApplications().build()],
    };
    state.juju.crossModelQuery.loaded = true;
    state.juju.crossModelQuery.loading = false;
    state.juju.crossModelQuery.results = mockResults;
    renderComponent(<SearchForm />, { state, url: "/q=." });
    const copyJSONButton = screen.getByRole("button", {
      name: Label.COPY_JSON,
    });
    expect(copyJSONButton).toBeEnabled();
    await userEvent.click(copyJSONButton);
    expect(componentUtils.copyToClipboard).toHaveBeenCalledWith(
      JSON.stringify(mockResults, null, 2),
    );
  });
});
