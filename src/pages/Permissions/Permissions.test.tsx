import { screen } from "@testing-library/react";

import { renderComponent } from "testing/utils";

import Permissions from "./Permissions";

describe("Permissions", () => {
  it("should display the permissions page", async () => {
    renderComponent(<Permissions />);
    expect(
      screen.getByRole("heading", { name: "Canonical ReBAC Admin" })
    ).toBeInTheDocument();
  });
});
