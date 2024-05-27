import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderComponent } from "testing/utils";

import AuditLogsTableFilters from "./AuditLogsTableFilters";

describe("AuditLogsTableFilters", () => {
  it("displays nothing if there are no filters", async () => {
    const { result } = renderComponent(<AuditLogsTableFilters />, { url: "/" });
    expect(result.baseElement).toHaveTextContent("");
  });

  it("displays filters", async () => {
    renderComponent(<AuditLogsTableFilters />, { url: "/?user=eggman" });
    expect(document.querySelector(".p-chip__value")).toHaveTextContent(
      "eggman",
    );
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
  });

  it("can remove a single filter", async () => {
    const { router } = renderComponent(<AuditLogsTableFilters />, {
      url: "/?user=eggman&model=test",
    });
    await userEvent.click(
      screen.getAllByRole("button", { name: "Dismiss" })[0],
    );
    expect(router.state.location.search).toEqual("?model=test");
  });

  it("can clear all filters", async () => {
    const { router } = renderComponent(<AuditLogsTableFilters />, {
      url: "/?user=eggman&model=test",
    });
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(router.state.location.search).toEqual("");
  });
});
