import { screen } from "@testing-library/react";

import { renderComponent } from "testing/utils";

import Logs from "./Logs";

describe("Model", () => {
  it("can display the action logs tab", async () => {
    renderComponent(<Logs />, {
      url: "/models/eggman@external/test1?activeView=logs",
      path: "/models/:userName/:modelName",
    });

    expect(screen.getByRole("button", { name: "Action logs" })).toHaveClass(
      "is-selected"
    );
    expect(
      document.querySelector(".entity-details__action-logs")
    ).toBeInTheDocument();
  });

  it("can display the audit logs tab", async () => {
    renderComponent(<Logs />, {
      url: "/models/eggman@external/test1?activeView=logs&tableView=audit-logs",
      path: "/models/:userName/:modelName",
    });

    expect(screen.getByRole("button", { name: "Audit logs" })).toHaveClass(
      "is-selected"
    );
    expect(screen.queryByText("Audit Logs Placeholder")).toBeInTheDocument();
  });
});
