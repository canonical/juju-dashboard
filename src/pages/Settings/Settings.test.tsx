import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderComponent } from "testing/utils";

import Settings, { DISABLE_ANALYTICS_KEY, Label } from "./Settings";

describe("Settings", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("restores the analytics setting", async () => {
    localStorage.setItem(DISABLE_ANALYTICS_KEY, JSON.stringify("true"));
    renderComponent(<Settings />);
    expect(
      screen.getByRole("switch", { name: Label.DISABLE_TOGGLE })
    ).toBeChecked();
  });

  it("can update the analytics setting", async () => {
    renderComponent(<Settings />);
    expect(localStorage.getItem(DISABLE_ANALYTICS_KEY)).toBeNull();
    await userEvent.click(
      screen.getByRole("switch", { name: Label.DISABLE_TOGGLE })
    );
    expect(JSON.parse(localStorage.getItem(DISABLE_ANALYTICS_KEY) ?? "")).toBe(
      true
    );
  });
});
