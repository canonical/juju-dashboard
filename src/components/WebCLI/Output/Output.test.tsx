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
        command="status"
        content={["Output"]}
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
        command="status"
        content={["Output"]}
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
        command="status"
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
        command="status"
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
        command="status"
        content={["Output"]}
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
        command="status"
        content={["Output"]}
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
        command="status"
        content={content}
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
        command="remove-unit"
        content={messages}
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
        command="remove-unit"
        content={messages}
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
        command="status"
        content={messages}
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
        command="status"
        content={messages}
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
        command="remove-unit"
        content={messages}
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
});
