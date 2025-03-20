import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { actions as generalActions } from "store/general";
import { rootStateFactory } from "testing/factories";
import { createStore, renderComponent } from "testing/utils";

import AuthenticationButton from "./AuthenticationButton";

describe("AuthenticationButton", () => {
  it("displays a link to open an auth URL", () => {
    renderComponent(
      <AuthenticationButton visitURL="http://example.com">
        Log in
      </AuthenticationButton>,
    );
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "http://example.com",
    );
  });

  it("should remove the URL when clicked", async () => {
    const onClick = vi.fn();
    const [store, actions] = createStore(rootStateFactory.build(), {
      trackActions: true,
    });
    renderComponent(
      <AuthenticationButton onClick={onClick} visitURL="http://example.com">
        Log in
      </AuthenticationButton>,
      { store },
    );
    await userEvent.click(screen.getByRole("link", { name: "Log in" }));
    expect(onClick).toHaveBeenCalled();
    const action = generalActions.removeVisitURL("http://example.com");
    expect(
      actions.find((dispatch) => dispatch.type === action.type),
    ).toMatchObject(action);
  });
});
