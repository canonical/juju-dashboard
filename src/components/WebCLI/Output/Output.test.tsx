import { render, screen, within } from "@testing-library/react";
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

  it("should display the content with correct formatting", () => {
    const content = [`\u001b[1;39mApp\n\u001b[0m\u001b[33munknown`];
    renderComponent(
      <Output
        content={[
          {
            command: "status",
            messages: content,
          },
        ]}
        helpMessage="Help message"
        showHelp={false}
        setShouldShowHelp={vi.fn()}
      />,
    );
    expect(screen.getByText("unknown").parentElement).toHaveStyle({
      color: "color: rgb(187, 187, 0);",
    });
  });

  it("inserts table links for matching commands", async () => {
    const messages = ["Model       Controller", "k8s         workloads"];
    renderComponent(
      <Output
        content={[
          {
            command: "remove-unit",
            messages,
          },
        ]}
        helpMessage="Help message"
        showHelp={false}
        setShouldShowHelp={vi.fn()}
        tableLinks={{
          "remove-unit": {
            exact: false,
            blocks: {
              Model: {
                Controller: (column) => ({
                  link: `/controller/${column.value}`,
                }),
              },
            },
          },
        }}
      />,
    );
    const code = await screen.findByTestId(TestId.CODE);
    expect(
      within(code).getByRole("link", { name: "workloads" }),
    ).toHaveAttribute("href", "/controller/workloads");
  });

  it("overrides output for matching commands", async () => {
    const messages = ["Model       Controller", "k8s         workloads"];
    renderComponent(
      <Output
        content={[
          {
            command: "remove-unit",
            messages,
          },
        ]}
        helpMessage="Help message"
        showHelp={false}
        setShouldShowHelp={vi.fn()}
        processOutput={{
          "remove-unit": {
            exact: false,
            process: (messages) => (
              <div data-testid="custom">{messages[0]}</div>
            ),
          },
        }}
      />,
    );
    const code = await screen.findByTestId(TestId.CODE);
    expect(within(code).getByTestId("custom")).toHaveTextContent(
      /^Model Controller$/,
    );
  });

  // When a tableLinks prop is supplied and a command that doesn't get
  // handled is submitted, it should handle the output via the default processor
  // rather than returning the output of `tableLinks` which would be nothing.
  it("falls back to default processor if the link processor does not handle command", async () => {
    const messages = ["Model       Controller", "k8s         workloads"];
    renderComponent(
      <Output
        content={[
          {
            command: "status",
            messages,
          },
        ]}
        helpMessage="Help message"
        showHelp={false}
        setShouldShowHelp={vi.fn()}
        tableLinks={
          {
            // This is a truth value, but there are no handlers to match the command.
          }
        }
      />,
    );
    expect(await screen.findByTestId(TestId.CODE)).toHaveTextContent(
      "Model Controller",
    );
  });

  // When a processOutput prop is supplied and a command that doesn't get
  // handled is submitted, it should handle the output via the default processor
  // rather than returning the output of `processOutput` which would be nothing.
  it("falls back to default processor if the provided processor does not handle command", async () => {
    const messages = ["Model       Controller", "k8s         workloads"];
    const customId = "custom";
    renderComponent(
      <Output
        content={[
          {
            command: "status",
            messages,
          },
        ]}
        helpMessage="Help message"
        showHelp={false}
        setShouldShowHelp={vi.fn()}
        processOutput={
          {
            // This is a truth value, but there are no handlers to match the command.
          }
        }
      />,
    );
    expect(await screen.findByTestId(TestId.CODE)).toHaveTextContent(
      "Model Controller",
    );
    expect(screen.queryByTestId(customId)).not.toBeInTheDocument();
  });

  it("falls back to default processor if the provided processor fails", async () => {
    const messages = ["Model       Controller", "k8s         workloads"];
    renderComponent(
      <Output
        content={[
          {
            command: "remove-unit",
            messages,
          },
        ]}
        helpMessage="Help message"
        showHelp={false}
        setShouldShowHelp={vi.fn()}
        processOutput={{
          "remove-unit": {
            exact: false,
            process: () => {
              throw new Error("unrecognised data");
            },
          },
        }}
      />,
    );
    expect(await screen.findByTestId(TestId.CODE)).toHaveTextContent(
      "Model Controller",
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
