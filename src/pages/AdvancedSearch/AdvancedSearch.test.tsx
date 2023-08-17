import { renderComponent } from "testing/utils";

import AdvancedSearch from "./AdvancedSearch";

describe("Logs", () => {
  it("should render the page", () => {
    renderComponent(<AdvancedSearch />);
    expect(document.querySelector("header")).toHaveTextContent(
      "Advanced search"
    );
  });
});
