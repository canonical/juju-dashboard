import { screen } from "@testing-library/react";

import { renderComponent } from "testing/utils";

import Permissions from "./Permissions";

describe("Permissions", () => {
  it("displays ReBAC Admin", () => {
    renderComponent(<Permissions />);
    expect(screen.getByText("Canonical ReBAC Admin")).toBeInTheDocument();
  });
});
