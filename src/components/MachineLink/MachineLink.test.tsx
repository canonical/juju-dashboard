import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RootState } from "store/store";
import { rootStateFactory, jujuStateFactory } from "testing/factories";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";
import urls from "urls";

import MachineLink from "./MachineLink";

describe("MachineLink", () => {
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
      <MachineLink uuid="abc123" machineId="0">
        machine0
      </MachineLink>,
      { state },
    );
    expect(screen.queryByRole("link", { name: "machine0" })).toHaveAttribute(
      "href",
      urls.model.machine({
        userName: "eggman@external",
        modelName: "test-model",
        machineId: "0",
      }),
    );
  });

  it("should not render a link if invalid UUID is passed", () => {
    renderComponent(
      <MachineLink uuid="invalidUUID" machineId="mockApp">
        No machine link due to invalid UUID
      </MachineLink>,
      { state },
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(
      screen.getByText("No machine link due to invalid UUID"),
    ).toBeVisible();
  });

  it("should not propagate clicks", async () => {
    const onClick = jest.fn();
    renderComponent(
      <button onClick={onClick}>
        <MachineLink uuid="abc123" machineId="0">
          machine0
        </MachineLink>
      </button>,
      { state },
    );
    await userEvent.click(screen.getByRole("link", { name: "machine0" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
