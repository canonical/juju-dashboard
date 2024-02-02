import { screen } from "@testing-library/react";

import { renderComponent } from "testing/utils";

import Output, { ansiColors } from "./Output";

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
      color: `rgb(${ansiColors[31]})`,
    });
    expect(screen.getByText("Blue output")).toHaveStyle({
      color: `rgb(${ansiColors[34]})`,
    });
    expect(screen.queryByText("Help message")).not.toBeInTheDocument();
  });
});
