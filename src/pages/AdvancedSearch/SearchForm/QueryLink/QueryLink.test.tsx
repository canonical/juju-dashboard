import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderComponent } from "testing/utils";

import QueryLink from "./QueryLink";

describe("QueryLink", () => {
  it("should call the query handler when clicking the button", async () => {
    const search = jest.fn();
    renderComponent(<QueryLink query=".applications" handleQuery={search} />);
    // Open the menu so that the portal gets rendered.
    await userEvent.click(
      screen.getByRole("button", { name: ".applications" }),
    );
    expect(search).toHaveBeenCalledWith(".applications");
  });
});
