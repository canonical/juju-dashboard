import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RootState } from "store/store";
import { rootStateFactory, jujuStateFactory } from "testing/factories";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import AppLink from "./AppLink";

describe("AppLink", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.withGeneralConfig().build({
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            name: "test-model",
            ownerTag: "user-eggman@external",
          }),
        },
      }),
    });
  });

  it("should render correctly", () => {
    renderComponent(
      <AppLink uuid="abc123" appName="mockApp">
        abc123
      </AppLink>,
      { state }
    );
    expect(screen.queryByRole("link", { name: "abc123" })).toHaveAttribute(
      "href",
      "/models/eggman@external/test-model/app/mockApp"
    );
  });

  it("should not render a link if invalid UUID is passed", () => {
    renderComponent(
      <AppLink uuid="invalidUUID" appName="mockApp">
        No app link due to invalid UUID
      </AppLink>,
      { state }
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("No app link due to invalid UUID")).toBeVisible();
  });

  it("should not propagate clicks", async () => {
    const onClick = jest.fn();
    renderComponent(
      <button onClick={onClick}>
        <AppLink uuid="abc123" appName="mockApp">
          abc123
        </AppLink>
      </button>,
      { state }
    );
    await userEvent.click(screen.getByRole("link", { name: "abc123" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
