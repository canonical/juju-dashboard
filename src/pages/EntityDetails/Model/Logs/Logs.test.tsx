import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderComponent } from "testing/utils";

import Logs from "./Logs";
import { Label } from "./Logs";

describe("Model", () => {
  it("can display the action logs tab", async () => {
    renderComponent(<Logs />, {
      url: "/models/eggman@external/test1?activeView=action-logs",
      path: "/models/:userName/:modelName",
    });

    expect(
      document.querySelector(".entity-details__action-logs")
    ).toBeInTheDocument();
  });

  it("can navigate to the action logs tab", async () => {
    renderComponent(<Logs />, {
      url: "/models/eggman@external/test1",
      path: "/models/:userName/:modelName",
    });

    expect(
      document.querySelector(".entity-details__action-logs")
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: Label.ACTION_LOGS }));
    expect(
      document.querySelector(".entity-details__action-logs")
    ).toBeInTheDocument();
  });
});
