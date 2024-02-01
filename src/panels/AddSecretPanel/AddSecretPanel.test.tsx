import { screen } from "@testing-library/react";

import { renderComponent } from "testing/utils";

import AddSecretPanel, { TestId } from "./AddSecretPanel";

describe("AddSecretPanel", () => {
  it("renders", async () => {
    renderComponent(<AddSecretPanel />);
    expect(screen.getByTestId(TestId.PANEL)).toBeInTheDocument();
  });
});
