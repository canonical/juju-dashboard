import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { renderComponent } from "testing/utils";

import Output from "./Output";
import { DEFAULT_HEIGHT, HELP_HEIGHT } from "./consts";
import { TestId } from "./types";

describe("Output", () => {
  it("should display content and not display help message", () => {
    renderComponent(
      <Output
        content="Output"
        helpMessage="Help message"
        showHelp={false}
        setShouldShowHelp={vi.fn()}
      />,
    );
    expect(screen.getByText("Output")).toBeInTheDocument();
    expect(screen.queryByText("Help message")).not.toBeInTheDocument();
    expect(screen.getByTestId(TestId.CONTENT)).toHaveAttribute(
      "style",
      `height: ${DEFAULT_HEIGHT}px;`,
    );
  });

  it("should not display content and display help message", () => {
    renderComponent(
      <Output
        content="Output"
        helpMessage="Help message"
        showHelp={true}
        setShouldShowHelp={vi.fn()}
      />,
    );
    expect(screen.queryByText("Output")).not.toBeInTheDocument();
    expect(screen.getByText("Help message")).toBeInTheDocument();
    expect(screen.getByTestId(TestId.CONTENT)).toHaveAttribute(
      "style",
      `height: ${HELP_HEIGHT}px;`,
    );
  });

  it("should close the output when the help is closed", async () => {
    const { rerender } = render(
      <Output
        content="Output"
        helpMessage="Help message"
        // Initially render with the help visible.
        showHelp={true}
        setShouldShowHelp={vi.fn()}
      />,
    );
    expect(screen.getByTestId(TestId.CONTENT)).toHaveAttribute(
      "style",
      `height: ${HELP_HEIGHT}px;`,
    );
    rerender(
      <Output
        content="Output"
        helpMessage="Help message"
        // Rerender with the help hidden.
        showHelp={false}
        setShouldShowHelp={vi.fn()}
      />,
    );
    expect(screen.getByTestId(TestId.CONTENT)).toHaveAttribute(
      "style",
      "height: 0px;",
    );
  });

  it("should display the content with correct formatting", () => {
    const content = `\u001b[1;39mApp\n\u001b[0m\u001b[33munknown`;
    renderComponent(
      <Output
        content={content}
        helpMessage="Help message"
        showHelp={false}
        setShouldShowHelp={vi.fn()}
      />,
    );
    const boldElements = screen.getAllByText(/.*/, { selector: "b" });
    expect(boldElements).toHaveLength(1);
    expect(boldElements[0].childNodes).toHaveLength(1);
    const appSpanElement = boldElements[0].childNodes[0];
    expect(appSpanElement).toHaveTextContent("App");
    expect(appSpanElement).toHaveStyle({
      color: "#FFF",
    });
    expect(screen.getByText("unknown")).toHaveStyle({
      color: "#A50",
    });
  });
});
