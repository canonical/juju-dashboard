import { screen } from "@testing-library/react";

import { renderComponent } from "testing/utils";

import ActionBar from "./ActionBar";

describe("ActionBar", () => {
  it("should display provided content", async () => {
    renderComponent(
      <ActionBar>
        <button>Action</button>
      </ActionBar>
    );
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });
});
