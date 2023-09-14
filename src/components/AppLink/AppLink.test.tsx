import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RootState } from "store/store";
import { rootStateFactory, jujuStateFactory } from "testing/factories";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";
import urls from "urls";

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

  it("should render correctly when there is no view", () => {
    renderComponent(
      <AppLink uuid="abc123" appName="mockApp">
        abc123
      </AppLink>,
      { state }
    );
    expect(screen.queryByRole("link", { name: "abc123" })).toHaveAttribute(
      "href",
      urls.model.app.index({
        userName: "eggman@external",
        modelName: "test-model",
        appName: "mockApp",
      })
    );
  });

  it("should render correctly when view is present", () => {
    renderComponent(
      <AppLink uuid="abc123" appName="mockApp" view="units">
        abc123
      </AppLink>,
      { state }
    );
    expect(screen.queryByRole("link", { name: "abc123" })).toHaveAttribute(
      "href",
      urls.model.app.tab({
        userName: "eggman@external",
        modelName: "test-model",
        appName: "mockApp",
        tab: "units",
      })
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
