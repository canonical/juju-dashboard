import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { generalStateFactory, configFactory } from "testing/factories/general";
import {
  crossModelQueryApplicationFactory,
  crossModelQueryFactory,
} from "testing/factories/juju/jimm";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import CodeSnippetBlock from "./CodeSnippetBlock";

// Handle clicking the toggle for a key that has an anchor wrapping the label.
const clickToggleForLink = async (name: string) => {
  // Get the parent element to click on instead of the anchor.
  const toggle = screen.getByRole("link", {
    name,
  }).parentElement;
  expect(toggle).toBeInTheDocument();
  if (toggle) {
    await userEvent.click(toggle);
  }
};

describe("CodeSnippetBlock", () => {
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

  it("should render correctly", () => {
    renderComponent(
      <CodeSnippetBlock
        className="mock-class-name"
        title="Mock Title"
        code={{ abc123: [crossModelQueryFactory.withModel().build()] }}
      />,
      { state }
    );
    expect(screen.getByText("Mock Title")).toBeVisible();
    expect(document.querySelector(".p-code-snippet")).toBeVisible();
    expect(document.querySelector(".p-code-snippet__block")).toBeVisible();
  });

  it("should render the data in json format", async () => {
    renderComponent(
      <CodeSnippetBlock
        className="mock-class-name"
        title="Mock Title"
        code={{ abc123: [crossModelQueryFactory.withModel().build()] }}
      />,
      { state }
    );
    const codeSnippetDropdownButton = screen.getByRole("combobox");
    expect(codeSnippetDropdownButton).toBeVisible();
    expect(
      screen.getByRole("option", { name: "Tree", hidden: true })
    ).toHaveAttribute("value", "tree");
    expect(
      screen.getByRole("option", { name: "JSON", hidden: true })
    ).toHaveAttribute("value", "json");
    await userEvent.selectOptions(codeSnippetDropdownButton, "JSON");
    expect(screen.getByText('"abc123"')).toBeVisible();
  });

  it("should render errors in tree format", async () => {
    renderComponent(
      <CodeSnippetBlock
        className="mock-class-name"
        title="Mock Title"
        code={{ abc123: [crossModelQueryFactory.withModel().build()] }}
      />,
      { state }
    );
    const codeSnippetDropdownButton = screen.getByRole("combobox");
    await userEvent.selectOptions(codeSnippetDropdownButton, "Tree");
    expect(document.querySelector(".p-code-snippet__block")).toHaveTextContent(
      "▶eggman@external/test-model[] 1 item▶0:{} 1 key▶model:{} 8 keys"
    );
  });

  it("replace charms with links to charmhub", async () => {
    renderComponent(
      <CodeSnippetBlock
        className="mock-class-name"
        title="Mock Title"
        code={{
          abc123: [
            crossModelQueryFactory.build({
              applications: {
                calico: crossModelQueryApplicationFactory.build({
                  charm: "cs:~calico",
                  "charm-channel": undefined,
                  "charm-name": "calico",
                  "charm-origin": "charmhub",
                }),
              },
            }),
          ],
        }}
      />,
      { state }
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "Tree");
    await clickToggleForLink("applications:");
    await userEvent.click(screen.getByText("calico:"));
    expect(screen.getByRole("link", { name: '"cs:~calico"' })).toHaveAttribute(
      "href",
      "https://charmhub.io/calico"
    );
  });

  it("replace charms with links to charmhub with channels", async () => {
    renderComponent(
      <CodeSnippetBlock
        className="mock-class-name"
        title="Mock Title"
        code={{
          abc123: [
            crossModelQueryFactory.build({
              applications: {
                calico: crossModelQueryApplicationFactory.build({
                  charm: "cs:~calico",
                  "charm-channel": "stable",
                  "charm-name": "calico",
                  "charm-origin": "charmhub",
                }),
              },
            }),
          ],
        }}
      />,
      { state }
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "Tree");
    await clickToggleForLink("applications:");
    await userEvent.click(screen.getByText("calico:"));
    expect(screen.getByRole("link", { name: '"cs:~calico"' })).toHaveAttribute(
      "href",
      "https://charmhub.io/calico?channel=stable"
    );
  });

  it("should not replace charms with links from other stores", async () => {
    renderComponent(
      <CodeSnippetBlock
        className="mock-class-name"
        title="Mock Title"
        code={{
          abc123: [
            crossModelQueryFactory.build({
              applications: {
                calico: crossModelQueryApplicationFactory.build({
                  charm: "cs:~calico",
                  "charm-name": "calico",
                  "charm-origin": "snapstore",
                }),
              },
            }),
          ],
        }}
      />,
      { state }
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "Tree");
    await clickToggleForLink("applications:");
    await userEvent.click(screen.getByText("calico:"));
    expect(
      screen.queryByRole("link", { name: '"cs:~calico"' })
    ).not.toBeInTheDocument();
  });
});
