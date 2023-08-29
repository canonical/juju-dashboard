import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderComponent } from "testing/utils";

import CodeSnippetBlock from "./CodeSnippetBlock";

describe("CodeSnippetBlock", () => {
  it("should render correctly", () => {
    renderComponent(
      <CodeSnippetBlock
        className="mock-class-name"
        title="Mock Title"
        code={{ mockKey: ["mockValue"] }}
      />
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
        code={{ mockKey: ["mockValue"] }}
      />
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
    expect(screen.getByText('"mockKey"')).toBeVisible();
    expect(screen.getByText('"mockValue"')).toBeVisible();
  });

  it("should render errors in tree format", async () => {
    renderComponent(
      <CodeSnippetBlock
        className="mock-class-name"
        title="Mock Title"
        code={{ mockKey: ["mockValue"] }}
      />
    );
    const codeSnippetDropdownButton = screen.getByRole("combobox");
    await userEvent.selectOptions(codeSnippetDropdownButton, "Tree");
    expect(document.querySelector(".p-code-snippet__block")).toHaveTextContent(
      '▶:[] 1 item0:"mockValue"'
    );
  });
});
