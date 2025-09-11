import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { formatFriendlyDateToNow } from "components/utils";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { generalStateFactory, configFactory } from "testing/factories/general";
import { crossModelQueryFactory } from "testing/factories/juju/jimm";
import { crossModelQueryModelFactory } from "testing/factories/juju/jimm";
import {
  jujuStateFactory,
  modelListInfoFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";
import urls from "urls";
import { ModelTab } from "urls";

import ResultsBlock from "./ResultsBlock";
import { Label, TestId } from "./types";

// Handle clicking the toggle for a key that has an anchor wrapping the label.
const clickToggleForLink = async (name: string): Promise<void> => {
  // Get the parent element to click on instead of the anchor.
  const toggle = screen.getByRole("link", {
    name,
  }).parentElement;
  expect(toggle).toBeInTheDocument();
  if (toggle) {
    await userEvent.click(toggle);
  }
};

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
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            name: "test-model",
            ownerTag: "user-eggman@external",
          }),
        },
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
      abc123: [crossModelQueryFactory.withModel().build()],
    };
    renderComponent(<ResultsBlock />, { state });
    const codeSnippetDropdownButton = screen.getByRole("combobox");
    expect(codeSnippetDropdownButton).toBeVisible();
    expect(
      screen.getByRole("option", { name: "Tree", hidden: true }),
    ).toHaveAttribute("value", "tree");
    expect(
      screen.getByRole("option", { name: "JSON", hidden: true }),
    ).toHaveAttribute("value", "json");
    await userEvent.selectOptions(codeSnippetDropdownButton, "JSON");
    expect(
      JSON.stringify(
        JSON.parse(
          document.querySelector(".p-code-snippet__block--numbered")
            ?.textContent ?? "",
        ),
      ),
    ).toBe(JSON.stringify(state.juju.crossModelQuery.results));
  });

  it("should show tree of results", async () => {
    state.juju.crossModelQuery.loaded = true;
    state.juju.crossModelQuery.loading = false;
    state.juju.crossModelQuery.results = {
      abc123: [crossModelQueryFactory.withModel().build()],
    };
    renderComponent(<ResultsBlock />, { state });
    const codeSnippetDropdownButton = screen.getByRole("combobox");
    await userEvent.selectOptions(codeSnippetDropdownButton, "Tree");
    expect(document.querySelector(".p-code-snippet__block")).toHaveTextContent(
      "▶eggman@external/test-model[] 1 item▶0:{} 1 key▶model:{} 8 keys",
    );
  });

  it("should replace model UUIDs with names in the tree view", async () => {
    state.juju.crossModelQuery.loaded = true;
    state.juju.crossModelQuery.results = {
      abc123: [crossModelQueryFactory.withModel().build()],
    };
    renderComponent(<ResultsBlock />, { state });
    expect(screen.queryByText("abc123")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "eggman@external/test-model" }),
    ).toBeInTheDocument();
  });

  it("should not replace top key if it is not a model UUID", async () => {
    state.juju.crossModelQuery.loaded = true;
    state.juju.crossModelQuery.results = {
      "": [],
      mockResultKey: ["mockResultValue"],
    };
    renderComponent(<ResultsBlock />, { state });
    expect(screen.queryByText("[none]:")).toBeInTheDocument();
    expect(screen.getByText('"mockResultValue"')).toBeVisible();
  });

  it("should show status icons in the tree", async () => {
    state.juju.crossModelQuery.loaded = true;
    state.juju.crossModelQuery.results = {
      abc123: [crossModelQueryFactory.withModel().build()],
    };
    renderComponent(<ResultsBlock />, { state });
    await clickToggleForLink("model:");
    await userEvent.click(screen.getByText("model-status:"));
    const status = screen.getByText('"pending"');
    expect(status).toBeInTheDocument();
    expect(status).toHaveClass("is-pending");
  });

  it("displays values in the tree", async () => {
    state.juju.crossModelQuery.loaded = true;
    state.juju.crossModelQuery.results = {
      abc123: [crossModelQueryFactory.withModel().build()],
    };
    renderComponent(<ResultsBlock />, { state });
    await clickToggleForLink("model:");
    expect(screen.getByText('"jaas-staging"')).toBeInTheDocument();
  });

  it("should handle blank keys in the tree view", async () => {
    state.juju.crossModelQuery.loaded = true;
    state.juju.crossModelQuery.results = {
      abc123: [
        crossModelQueryFactory.build({
          model: crossModelQueryModelFactory.build({
            "": "test",
          }),
        }),
      ],
    };
    renderComponent(<ResultsBlock />, { state });
    await clickToggleForLink("model:");
    expect(screen.getByText("[none]:")).toBeInTheDocument();
  });

  it("should link to applications in the tree view", async () => {
    state.juju.crossModelQuery.loaded = true;
    state.juju.crossModelQuery.results = {
      abc123: [crossModelQueryFactory.withApplications().build()],
    };
    renderComponent(<ResultsBlock />, { state });
    expect(screen.getByRole("link", { name: "applications:" })).toHaveAttribute(
      "href",
      urls.model.tab({
        userName: "eggman@external",
        modelName: "test-model",
        tab: ModelTab.APPS,
      }),
    );
  });

  it("should link to offers in the tree view", async () => {
    state.juju.crossModelQuery.loaded = true;
    state.juju.crossModelQuery.results = {
      abc123: [crossModelQueryFactory.withOffers().build()],
    };
    renderComponent(<ResultsBlock />, { state });
    expect(screen.getByRole("link", { name: "offers:" })).toHaveAttribute(
      "href",
      urls.model.tab({
        userName: "eggman@external",
        modelName: "test-model",
        tab: ModelTab.APPS,
      }),
    );
  });

  it("should link to machines in the tree view", async () => {
    state.juju.crossModelQuery.loaded = true;
    state.juju.crossModelQuery.results = {
      abc123: [crossModelQueryFactory.withMachines().build()],
    };
    renderComponent(<ResultsBlock />, { state });
    expect(screen.getByRole("link", { name: "machines:" })).toHaveAttribute(
      "href",
      urls.model.tab({
        userName: "eggman@external",
        modelName: "test-model",
        tab: ModelTab.MACHINES,
      }),
    );
  });

  it("should link to relations in the tree view", async () => {
    state.juju.crossModelQuery.loaded = true;
    state.juju.crossModelQuery.results = {
      abc123: [crossModelQueryFactory.withApplications().build()],
    };
    renderComponent(<ResultsBlock />, { state });
    await clickToggleForLink("applications:");
    await clickToggleForLink("application_0:");
    expect(screen.getByRole("link", { name: "relations:" })).toHaveAttribute(
      "href",
      urls.model.tab({
        userName: "eggman@external",
        modelName: "test-model",
        tab: ModelTab.INTEGRATIONS,
      }),
    );
  });

  it("should link to the model in the tree view", async () => {
    state.juju.crossModelQuery.loaded = true;
    state.juju.crossModelQuery.results = {
      abc123: [crossModelQueryFactory.withModel().build()],
    };
    renderComponent(<ResultsBlock />, { state });
    expect(screen.getByRole("link", { name: "model:" })).toHaveAttribute(
      "href",
      urls.model.index({
        userName: "eggman@external",
        modelName: "test-model",
      }),
    );
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

  it("should show message when there are no results", () => {
    state.juju.crossModelQuery.loaded = true;
    state.juju.crossModelQuery.results = null;
    renderComponent(<ResultsBlock />, { state });
    expect(screen.getByText(Label.NO_RESULTS)).toBeVisible();
  });

  it("should show message when all models have no results", () => {
    state.juju.crossModelQuery.loaded = true;
    state.juju.crossModelQuery.results = { mockModel0: [], mockModel1: [null] };
    renderComponent(<ResultsBlock />, { state });
    expect(screen.getByText(Label.NO_RESULTS)).toBeVisible();
  });
});
