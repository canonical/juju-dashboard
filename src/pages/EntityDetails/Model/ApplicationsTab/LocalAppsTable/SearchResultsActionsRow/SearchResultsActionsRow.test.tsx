import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { charmApplicationFactory } from "testing/factories/juju/Charms";
import { renderComponent } from "testing/utils";

import SearchResultsActionsRow from "./SearchResultsActionsRow";

describe("SearchResultsActionsRow", () => {
  let state: RootState;
  const url = "/?filterQuery=db";

  beforeEach(() => {
    state = rootStateFactory.build();
  });

  it("doesn't show the run action button when there is no search", () => {
    renderComponent(<SearchResultsActionsRow />, { url: "/", state });
    expect(
      screen.queryByRole("button", { name: /run action/i })
    ).not.toBeInTheDocument();
  });

  it("shows the run action button when there is a search", () => {
    renderComponent(<SearchResultsActionsRow />, {
      url,
      state,
    });
    expect(
      screen.queryByRole("button", { name: /run action/i })
    ).toBeInTheDocument();
  });

  it("disables the run action button when there are no applications selected", () => {
    renderComponent(<SearchResultsActionsRow />, {
      url,
      state,
    });
    expect(
      screen.queryByRole("button", { name: /run action/i })
    ).toBeDisabled();
  });

  it("enables the run action button when there is at least one application selected", () => {
    state.juju.selectedApplications = [charmApplicationFactory.build()];
    renderComponent(<SearchResultsActionsRow />, {
      url,
      state,
    });
    expect(
      screen.queryByRole("button", { name: /run action/i })
    ).not.toBeDisabled();
  });

  it("opens the choose-charm panel when clicking the run action button", async () => {
    state.juju.selectedApplications = [charmApplicationFactory.build()];
    renderComponent(<SearchResultsActionsRow />, {
      url,
      state,
    });
    expect(window.location.search).toEqual("?filterQuery=db");
    await userEvent.click(screen.getByRole("button", { name: /run action/i }));
    expect(window.location.search).toEqual(
      "?filterQuery=db&panel=select-charms-and-actions"
    );
  });
});
