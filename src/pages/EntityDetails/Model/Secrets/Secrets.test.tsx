import { screen } from "@testing-library/react";

import { renderComponent } from "testing/utils";

import Secrets from "./Secrets";

describe("Secrets", () => {
  it("can display the action logs tab", async () => {
    renderComponent(<Secrets />);
    expect(screen.getByText("Secrets")).toBeInTheDocument();
  });
});
