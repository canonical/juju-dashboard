import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { generalStateFactory, configFactory } from "testing/factories/general";
import { renderComponent } from "testing/utils";

import SearchForm, { Label, QUERY_HISTORY_KEY } from "./SearchForm";

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
      store.getActions().find((dispatch) => dispatch.type === action.type)
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
      JSON.stringify([".applications"])
    );
  });
});
