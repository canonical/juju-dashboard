import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  generalStateFactory,
  configFactory,
  authUserInfoFactory,
} from "testing/factories/general";
import {
  modelInfoFactory,
  modelUserInfoFactory,
} from "testing/factories/juju/ModelManagerV10";
import {
  modelMigrationTargetFactory,
  versionElemFactory,
} from "testing/factories/juju/jimm";
import {
  controllerFactory,
  jujuStateFactory,
  modelDataFactory,
  modelListInfoFactory,
  modelMigrationTargetsStateFactory,
  supportedJujuVersionsStateFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";
import urls from "urls";

import { Label as FieldsLabel } from "./Fields/types";
import UpgradeModelController from "./UpgradeModelController";
import { Label } from "./types";

describe("UpgradeModelController", () => {
  let state: RootState;
  const url =
    "/models?panel=upgrade-model&modelName=test1&qualifier=eggman@external";
  const path = urls.models.index;

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          isJuju: false,
          controllerAPIEndpoint: "wss://example.com/api",
        }),
        controllerConnections: {
          "wss://example.com/api": {
            user: authUserInfoFactory.build(),
          },
        },
      }),
      juju: jujuStateFactory.build({
        controllers: {
          "wss://example.com/api": [
            controllerFactory.build({
              uuid: "controller123",
              version: "1.2.3",
              name: "controller1",
            }),
            controllerFactory.build({
              uuid: "controller456",
              version: "4.6.14",
              name: "controller2",
            }),
          ],
        },
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            name: "test1",
            wsControllerURL: "wss://example.com/api",
          }),
        },
        modelData: {
          abc123: modelDataFactory.build({
            info: modelInfoFactory.build({
              uuid: "abc123",
              name: "test1",
              "controller-uuid": "controller123",
              users: [
                modelUserInfoFactory.build({
                  user: "eggman@external",
                  access: "admin",
                }),
              ],
            }),
          }),
        },
        modelMigrationTargets: modelMigrationTargetsStateFactory.build({
          abc123: modelMigrationTargetFactory.build({
            data: ["controller123", "controller456"],
          }),
        }),
        supportedJujuVersions: supportedJujuVersionsStateFactory.build({
          data: [
            versionElemFactory.build({ version: "1.2.3" }),
            versionElemFactory.build({ version: "4.6.14" }),
          ],
        }),
      }),
    });
  });

  it("closes the panel when the form is submitted", async () => {
    const onRemovePanelQueryParams = vi.fn();
    renderComponent(
      <UpgradeModelController
        back={vi.fn}
        onRemovePanelQueryParams={onRemovePanelQueryParams}
        version={versionElemFactory.build({ version: "1.2.3" })}
        modelName="test1"
        qualifier="eggman@external"
      />,
      { state, url, path },
    );
    await userEvent.click(
      screen.getByRole("checkbox", { name: FieldsLabel.CONFIRM }),
    );
    await userEvent.click(
      await screen.findByRole("button", {
        name: Label.SUBMIT,
      }),
    );
    expect(onRemovePanelQueryParams).toHaveBeenCalled();
  });

  it("does not close the panel when clicking inside the target dropdown", async () => {
    const onRemovePanelQueryParams = vi.fn();
    renderComponent(
      <UpgradeModelController
        back={vi.fn}
        onRemovePanelQueryParams={onRemovePanelQueryParams}
        version={versionElemFactory.build({ version: "4.6.14" })}
        modelName="test1"
        qualifier="eggman@external"
      />,
      { state, url, path },
    );
    await userEvent.click(
      screen.getByRole("button", { name: FieldsLabel.TARGET_CONTROLLER }),
    );
    await userEvent.click(screen.getByRole("option", { name: /controller2/ }));
    expect(onRemovePanelQueryParams).not.toHaveBeenCalled();
  });

  it("requires the controller and confirmation when a migration is required", async () => {
    renderComponent(
      <UpgradeModelController
        back={vi.fn}
        onRemovePanelQueryParams={vi.fn()}
        version={versionElemFactory.build({ version: "4.6.14" })}
        modelName="test1"
        qualifier="eggman@external"
      />,
      { state, url, path },
    );
    const submit = screen.queryByRole("button", { name: Label.SUBMIT });
    expect(submit).toHaveAttribute("aria-disabled");
    await userEvent.click(
      screen.getByRole("button", { name: FieldsLabel.TARGET_CONTROLLER }),
    );
    await userEvent.click(screen.getByRole("option", { name: /controller2/ }));
    expect(submit).toHaveAttribute("aria-disabled");
    const confirm = screen.getByRole("checkbox", { name: FieldsLabel.CONFIRM });
    await userEvent.click(confirm);
    // Vanilla doesn't display validation until the field loses focus.
    await act(() => fireEvent.blur(confirm));
    expect(submit).not.toHaveAttribute("aria-disabled");
  });

  it("requires the confirmation when a migration is not required", async () => {
    state.juju.modelData.abc123.model.version = "1.2.0";
    renderComponent(
      <UpgradeModelController
        back={vi.fn}
        onRemovePanelQueryParams={vi.fn()}
        version={versionElemFactory.build({ version: "1.2.3" })}
        modelName="test1"
        qualifier="eggman@external"
      />,
      { state, url, path },
    );
    const submit = screen.queryByRole("button", { name: Label.SUBMIT });
    expect(submit).toHaveAttribute("aria-disabled");
    const confirm = screen.getByRole("checkbox", { name: FieldsLabel.CONFIRM });
    await userEvent.click(confirm);
    // Vanilla doesn't display validation until the field loses focus.
    await act(() => fireEvent.blur(confirm));
    expect(submit).not.toHaveAttribute("aria-disabled");
  });
});
