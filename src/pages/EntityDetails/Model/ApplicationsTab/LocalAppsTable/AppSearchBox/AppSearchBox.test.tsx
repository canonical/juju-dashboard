import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { actions as jujuActions } from "store/juju";
import { renderComponent } from "testing/utils";

import AppSearchBox from "./AppSearchBox";

describe("AppSearchBox", () => {
  it("changes the query param when searching", async () => {
    renderComponent(<AppSearchBox />);
    expect(window.location.search).toEqual("");
    await userEvent.type(screen.getByRole("searchbox"), "what{Enter}");
    expect(window.location.search).toEqual("?filterQuery=what");
  });

  it("clears selected applications when changing the search", async () => {
    const { store } = renderComponent(<AppSearchBox />);
    await userEvent.type(screen.getByRole("searchbox"), "what{Enter}");
    expect(
      store
        .getActions()
        .find((action) => action.type === "juju/updateSelectedApplications"),
    ).toMatchObject(
      jujuActions.updateSelectedApplications({
        selectedApplications: [],
      }),
    );
  });
});
