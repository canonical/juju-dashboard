import { screen } from "@testing-library/react";

import { renderComponent } from "testing/utils";

import Logs from "./Logs";

describe("Logs", () => {
  it("should render the page", () => {
    renderComponent(<Logs />);
    expect(screen.getByText("Audit logs")).toBeVisible();
    expect(document.querySelector(".logs")).toBeVisible();
    expect(document.querySelectorAll("table th")).toHaveLength(6);
  });
});
