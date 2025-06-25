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
        content={[
          {
            command: "status",
            messages: ["Output1"],
          },
          {
            command: "help",
            messages: ["Output2"],
          },
        ]}
        helpMessage="Help message"
        showHelp={false}
        setShouldShowHelp={vi.fn()}
      />,
    );
    expect(screen.getByTestId(TestId.CONTENT)).toHaveTextContent(
      ["$ status", "Output1 ", "$ help", "Output2"].join(""),
    );
    expect(screen.queryByText("Help message")).not.toBeInTheDocument();
    expect(screen.getByTestId(TestId.CONTENT)).toHaveAttribute(
      "style",
      `height: ${DEFAULT_HEIGHT}px;`,
    );
  });

  it("should not display content and display help message", () => {
    renderComponent(
      <Output
        content={[
          {
            command: "status",
            messages: ["Output"],
          },
        ]}
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

  it("displays help while not loading and there is no content", () => {
    renderComponent(
      <Output
        content={[]}
        helpMessage="Help message"
        showHelp={false}
        loading={false}
        setShouldShowHelp={vi.fn()}
      />,
    );
    expect(screen.getByText("Help message")).toBeInTheDocument();
  });

  it("displays nothing while loading and there is no content", () => {
    renderComponent(
      <Output
        content={[]}
        helpMessage="Help message"
        showHelp={false}
        loading={true}
        setShouldShowHelp={vi.fn()}
      />,
    );
    expect(screen.queryByText("Help message")).not.toBeInTheDocument();
    expect(screen.getByTestId(TestId.CONTENT)).toHaveTextContent("");
  });

  it("should close the output when the help is closed", async () => {
    const { rerender } = render(
      <Output
        content={[
          {
            command: "status",
            messages: ["Output"],
          },
        ]}
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
        content={[
          {
            command: "status",
            messages: ["Output"],
          },
        ]}
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

  it("should scroll to the bottom when new commands are sent", async () => {
    const { rerender } = render(
      <Output
        content={[
          {
            command: "status",
            messages: ["Output"],
          },
        ]}
        helpMessage="Help message"
        showHelp={false}
        setShouldShowHelp={vi.fn()}
      />,
    );
    const content = screen.getByTestId(TestId.CONTENT);
    const scrollToSpy = vi.spyOn(content, "scrollTo");
    // Mock the scroll height as this is not being rendered in a real DOM.
    Object.defineProperty(content, "scrollHeight", {
      configurable: true,
      value: 500,
    });
    content.scrollTop = 350;
    Object.defineProperty(content, "clientHeight", {
      configurable: true,
      value: 50,
    });
    rerender(
      <Output
        content={[
          {
            command: "status",
            messages: ["Output1"],
          },
          {
            command: "help",
            messages: ["Output2"],
          },
        ]}
        helpMessage="Help message"
        showHelp={false}
        setShouldShowHelp={vi.fn()}
      />,
    );
    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 500,
    });
    scrollToSpy.mockRestore();
  });

  it("should not scroll to the bottom when user has scrolled up", async () => {
    const { rerender } = render(
      <Output
        content={[
          {
            command: "status",
            messages: ["Output"],
          },
        ]}
        helpMessage="Help message"
        showHelp={false}
        setShouldShowHelp={vi.fn()}
      />,
    );
    const content = screen.getByTestId(TestId.CONTENT);
    const scrollToSpy = vi.spyOn(content, "scrollTo");
    // Mock the scroll height as this is not being rendered in a real DOM.
    Object.defineProperty(content, "scrollHeight", {
      configurable: true,
      value: 500,
    });
    content.scrollTop = 250;
    Object.defineProperty(content, "clientHeight", {
      configurable: true,
      value: 50,
    });
    rerender(
      <Output
        content={[
          {
            command: "status",
            messages: ["Output1"],
          },
          {
            command: "help",
            messages: ["Output2"],
          },
        ]}
        helpMessage="Help message"
        showHelp={false}
        setShouldShowHelp={vi.fn()}
      />,
    );
    expect(scrollToSpy).not.toHaveBeenCalled();
    scrollToSpy.mockRestore();
  });
});
