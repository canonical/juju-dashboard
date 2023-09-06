import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RootState } from "store/store";
import { rootStateFactory, jujuStateFactory } from "testing/factories";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";
import urls from "urls";

import UnitLink from "./UnitLink";

describe("UnitLink", () => {
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
      <UnitLink uuid="abc123" appName="mockApp" unitId="0">
        unit0
      </UnitLink>,
      { state }
    );
    expect(screen.queryByRole("link", { name: "unit0" })).toHaveAttribute(
      "href",
      urls.model.unit({
        userName: "eggman@external",
        modelName: "test-model",
        appName: "mockApp",
        unitId: "0",
      })
    );
  });

  it("should not render a link if invalid UUID is passed", () => {
    renderComponent(
      <UnitLink uuid="invalidUUID" appName="mockApp" unitId="0">
        No unit link due to invalid UUID
      </UnitLink>,
      { state }
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("No unit link due to invalid UUID")).toBeVisible();
  });

  it("should not propagate clicks", async () => {
    const onClick = jest.fn();
    renderComponent(
      <button onClick={onClick}>
        <UnitLink uuid="abc123" appName="mockApp" unitId="0">
          unit0
        </UnitLink>
      </button>,
      { state }
    );
    await userEvent.click(screen.getByRole("link", { name: "unit0" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
