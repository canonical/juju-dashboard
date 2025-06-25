import { screen } from "@testing-library/react";

import { renderComponent } from "testing/utils";

import OutputCommand from "./OutputCommand";

describe("OutputCommand", () => {
  it("should display the content with correct formatting", () => {
    const content = [`\u001b[1;39mApp\n\u001b[0m\u001b[33munknown`];
    renderComponent(<OutputCommand command={"status"} messages={content} />);
    expect(screen.getByText("unknown").parentElement).toHaveStyle({
      color: "color: rgb(187, 187, 0);",
    });
  });

  it("inserts table links for matching commands", async () => {
    const messages = ["Model       Controller", "k8s         workloads"];
    renderComponent(
      <OutputCommand
        command={"remove-unit"}
        messages={messages}
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
    expect(screen.getByRole("link", { name: "workloads" })).toHaveAttribute(
      "href",
      "/controller/workloads",
    );
  });

  it("overrides outputCommand for matching commands", async () => {
    const messages = ["Model       Controller", "k8s         workloads"];
    renderComponent(
      <OutputCommand
        command={"remove-unit"}
        messages={messages}
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
    expect(screen.getByTestId("custom")).toHaveTextContent(
      /^Model Controller$/,
    );
  });

  // When a tableLinks prop is supplied and a command that doesn't get
  // handled is submitted, it should handle the outputCommand via the default processor
  // rather than returning the outputCommand of `tableLinks` which would be nothing.
  it("falls back to default processor if the link processor does not handle command", async () => {
    const messages = ["Model       Controller", "k8s         workloads"];
    renderComponent(
      <OutputCommand
        command={"status"}
        messages={messages}
        tableLinks={
          {
            // This is a truth value, but there are no handlers to match the command.
          }
        }
      />,
    );
    expect(document.querySelector("body")).toHaveTextContent(
      "Model Controller",
    );
  });

  // When a processOutput prop is supplied and a command that doesn't get
  // handled is submitted, it should handle the outputCommand via the default processor
  // rather than returning the outputCommand of `processOutput` which would be nothing.
  it("falls back to default processor if the provided processor does not handle command", async () => {
    const messages = ["Model       Controller", "k8s         workloads"];
    const customId = "custom";
    renderComponent(
      <OutputCommand
        command={"status"}
        messages={messages}
        processOutput={
          {
            // This is a truthy value, but there are no handlers to match the command.
          }
        }
      />,
    );
    expect(document.querySelector("body")).toHaveTextContent(
      "Model Controller",
    );
    expect(screen.queryByTestId(customId)).not.toBeInTheDocument();
  });

  it("falls back to default processor if the provided processor fails", async () => {
    const messages = ["Model       Controller", "k8s         workloads"];
    renderComponent(
      <OutputCommand
        command={"remove-unit"}
        messages={messages}
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
    expect(document.querySelector("body")).toHaveTextContent(
      "Model Controller",
    );
  });
});
