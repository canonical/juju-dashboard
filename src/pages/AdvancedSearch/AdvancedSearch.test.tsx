import { renderComponent } from "testing/utils";

import AdvancedSearch from "./AdvancedSearch";

describe("AdvancedSearch", () => {
  it("should render the page", () => {
    renderComponent(<AdvancedSearch />);
    expect(document.querySelector("header")).toHaveTextContent(
      "Advanced search"
    );
  });
});
