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

  it("should display the content with correct color", () => {
    renderComponent(
      <Output
        content="Regular output[31mRed output[34mBlue output"
        helpMessage="Help message"
        showHelp={false}
        setShouldShowHelp={jest.fn()}
      />,
    );
    expect(screen.getByText("Regular output")).toBeInTheDocument();
    expect(screen.getByText("Red output")).toHaveStyle({
      color: "rgb(205,49,49)",
    });
    expect(screen.getByText("Blue output")).toHaveStyle({
      color: "rgb(26,114,200)",
    });
    expect(screen.queryByText("Help message")).not.toBeInTheDocument();
  });
});
