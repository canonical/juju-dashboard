import { screen } from "@testing-library/react";

import { renderComponent } from "testing/utils";

import AdvancedSearch from "./AdvancedSearch";

describe("AdvancedSearch", () => {
  it("should render the page", () => {
    renderComponent(<AdvancedSearch />);
    expect(document.querySelector("header")).toHaveTextContent(
      "Advanced search"
    );
  });

  it("should display the search form", () => {
    renderComponent(<AdvancedSearch />);
    expect(screen.getByTestId("search-form")).toBeInTheDocument();
  });
});
