import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { generalStateFactory, configFactory } from "testing/factories/general";
import { crossModelQueryFactory } from "testing/factories/juju/jimm";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import CodeSnippetBlock from "./CodeSnippetBlock";

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
});
