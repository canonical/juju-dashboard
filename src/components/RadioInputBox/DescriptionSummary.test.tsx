import { render, screen } from "@testing-library/react";

import DescriptionSummary from "./DescriptionSummary";

describe("DescriptionSummary", () => {
  it("returns a details component if the description is longer than 30 characters", () => {
    const description =
      "The number of coding chunks, i.e. the number of additional chunks computed by the encoding functions. If there are 2 coding chunks, it means 2 OSDs can be out without losing data. ";
    const { container } = render(
      <DescriptionSummary description={description} />
    );
    expect(container).toMatchSnapshot();
  });

  it("returns just the text if the description is shorter than 30 characters", () => {
    const description = "The name of the profile";
    render(<DescriptionSummary description={description} />);
    expect(screen.getByText(description)).toBeInTheDocument();
    expect(
      document.querySelector(".radio-input-box__details")
    ).not.toBeInTheDocument();
  });

  it("returns null if no description is provided", () => {
    render(<DescriptionSummary description={undefined} />);
    expect(
      document.querySelector(".radio-input-box__details")
    ).not.toBeInTheDocument();
  });
});
