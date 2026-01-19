import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { actions as jujuActions } from "store/juju";
import { rootStateFactory } from "testing/factories";
import { createStore, renderComponent } from "testing/utils";

import AppSearchBox from "./AppSearchBox";

describe("AppSearchBox", () => {
  it("changes the query param when searching", async () => {
    const { router } = renderComponent(<AppSearchBox />);
    expect(router.state.location.search).toEqual("");
    await userEvent.type(screen.getByRole("searchbox"), "what{Enter}");
    expect(router.state.location.search).toEqual("?filterQuery=what");
  });

  it("clears selected applications when changing the search", async () => {
    const [store, actions] = createStore(rootStateFactory.build(), {
      trackActions: true,
    });
    renderComponent(<AppSearchBox />, { store });
    await userEvent.type(screen.getByRole("searchbox"), "what{Enter}");
    expect(
      actions.find(
        (action) => action.type === "juju/updateSelectedApplications",
      ),
    ).toMatchObject(
      jujuActions.updateSelectedApplications({
        selectedApplications: {},
      }),
    );
  });
});
