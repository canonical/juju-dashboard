import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import AccessButton, { Label } from "./AccessButton";

describe("AccessButton", () => {
  it("displays an access button", () => {
    render(<AccessButton setPanelQs={vi.fn()} modelName="test-model" />);
    expect(
      screen.getByRole("button", { name: Label.ACCESS_BUTTON }),
    ).toBeInTheDocument();
  });

  it("can open the access panel", async () => {
    const setPanelQs = vi.fn();
    render(<AccessButton setPanelQs={setPanelQs} modelName="test-model" />);
    await userEvent.click(
      screen.getByRole("button", { name: Label.ACCESS_BUTTON }),
    );
    expect(setPanelQs).toHaveBeenCalledWith(
      {
        model: "test-model",
        panel: "share-model",
      },
      { replace: true },
    );
  });
});
