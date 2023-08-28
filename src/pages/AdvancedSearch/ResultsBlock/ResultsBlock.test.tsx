import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { formatFriendlyDateToNow } from "components/utils";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { generalStateFactory, configFactory } from "testing/factories/general";
import { crossModelQueryFactory } from "testing/factories/juju/jimm";
import { modelListInfoFactory } from "testing/factories/juju/juju";
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

  it("should show tree of results", async () => {
    state.juju.crossModelQuery.loaded = true;
    state.juju.crossModelQuery.loading = false;
    state.juju.crossModelQuery.results = {
      mockModelUUID: [crossModelQueryFactory.withModel().build()],
    };
    renderComponent(<ResultsBlock />, { state });
    const codeSnippetDropdownButton = screen.getByRole("combobox");
    await userEvent.selectOptions(codeSnippetDropdownButton, "Tree");
    expect(document.querySelector(".p-code-snippet__block")).toHaveTextContent(
      "▶mockModelUUID:[] 1 item▶0:{} 1 key▶model:{} 8 keys"
    );
  });

  it("should replace model UUIDs with names in the tree view", async () => {
    state.juju.crossModelQuery.loaded = true;
    state.juju.crossModelQuery.results = {
      abc123: [crossModelQueryFactory.withModel().build()],
    };
    state.juju.models = {
      abc123: modelListInfoFactory.build({
        uuid: "abc123",
        name: "test-model",
        ownerTag: "user-eggman@external",
      }),
    };
    renderComponent(<ResultsBlock />, { state });
    expect(screen.queryByText("abc123")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "eggman@external/test-model" })
    ).toBeInTheDocument();
  });

  it("should show status icons in the tree", async () => {
    state.juju.crossModelQuery.loaded = true;
    state.juju.crossModelQuery.results = {
      mockModelUUID: [crossModelQueryFactory.withModel().build()],
    };
    renderComponent(<ResultsBlock />, { state });
    await userEvent.click(screen.getByText("model:"));
    await userEvent.click(screen.getByText("model-status:"));
    const status = screen.getByText('"pending"');
    expect(status).toBeInTheDocument();
    expect(status).toHaveClass("is-pending");
  });

  it("displays values in the tree", async () => {
    state.juju.crossModelQuery.loaded = true;
    state.juju.crossModelQuery.results = {
      mockModelUUID: [crossModelQueryFactory.withModel().build()],
    };
    renderComponent(<ResultsBlock />, { state });
    await userEvent.click(screen.getByText("model:"));
    expect(screen.getByText('"jaas-staging"')).toBeInTheDocument();
  });

  it("should show actual time and relative time in the tree", () => {
    const pastDate = "2023-08-16 00:42:59Z";
    const relativeTimeFromPastDate = formatFriendlyDateToNow(pastDate);
    state.juju.crossModelQuery.loaded = true;
    state.juju.crossModelQuery.results = {
      mockModelUUID: [{ time: pastDate }],
    };
    renderComponent(<ResultsBlock />, { state });
    const dateComponent = screen.getByText(pastDate);
    expect(dateComponent).toBeVisible();
    expect(dateComponent).toHaveTextContent(relativeTimeFromPastDate);
  });
});
