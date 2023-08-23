import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { generalStateFactory, configFactory } from "testing/factories/general";
import { crossModelQueryFactory } from "testing/factories/juju/jimm";
import { renderComponent } from "testing/utils";

import ResultsBlock, { TestId } from "./ResultsBlock";

describe("ResultsBlock", () => {
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

  it("should show Spinner when cross-model query is loading", () => {
    state.juju.crossModelQuery.loaded = true;
    state.juju.crossModelQuery.loading = true;
    renderComponent(<ResultsBlock />, { state });
    expect(screen.getByTestId(TestId.LOADING)).toBeVisible();
  });

  it("should show result in JSON format", async () => {
    state.juju.crossModelQuery.loaded = true;
    state.juju.crossModelQuery.loading = false;
    state.juju.crossModelQuery.results = {
      mockModelUUID: [crossModelQueryFactory.withModel().build()],
    };
    renderComponent(<ResultsBlock />, { state });
    const codeSnippetDropdownButton = screen.getByRole("combobox");
    expect(codeSnippetDropdownButton).toBeVisible();
    expect(
      screen.getByRole("option", { name: "Tree", hidden: true })
    ).toHaveAttribute("value", "tree");
    expect(
      screen.getByRole("option", { name: "JSON", hidden: true })
    ).toHaveAttribute("value", "json");
    await userEvent.selectOptions(codeSnippetDropdownButton, "JSON");
    expect(screen.getByText('"model": {')).toBeVisible();
  });
});
