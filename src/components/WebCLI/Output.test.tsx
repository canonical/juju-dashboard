import { screen } from "@testing-library/react";

import { renderComponent } from "testing/utils";

import Output from "./Output";

describe("Output", () => {
  it("should display content and not display help message", () => {
    renderComponent(
      <Output
        content="Output"
        helpMessage="Help message"
        showHelp={false}
        setShouldShowHelp={jest.fn()}
      />,
    );
    expect(screen.getByText("Output")).toBeInTheDocument();
    expect(screen.queryByText("Help message")).not.toBeInTheDocument();
  });

  it("should not display content and display help message", () => {
    renderComponent(
      <Output
        content="Output"
        helpMessage="Help message"
        showHelp={true}
        setShouldShowHelp={jest.fn()}
      />,
    );
    expect(screen.queryByRole("Output")).not.toBeInTheDocument();
    expect(screen.getByText("Help message")).toBeInTheDocument();
  });

  it("should display the content with correct formatting", () => {
    const content = `\u001b[1;39mApp\n\u001b[0m\u001b[33munknown`;
    renderComponent(
      <Output
        content={content}
        helpMessage="Help message"
        showHelp={false}
        setShouldShowHelp={jest.fn()}
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
