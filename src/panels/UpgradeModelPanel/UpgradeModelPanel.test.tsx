import { screen } from "@testing-library/react";
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

import UpgradeModelPanel from "./UpgradeModelPanel";
import { UpgradeModelPanelHeaderLabel } from "./UpgradeModelPanelHeader";
import { UpgradeModelVersionLabel } from "./UpgradeModelVersion";
import { FieldsLabel as UpgradeModelVersionFieldsLabel } from "./UpgradeModelVersion/Fields";

describe("UpgradeModelPanel", () => {
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
              version: "3.6.21",
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
        modelsLoaded: true,
        modelMigrationTargets: modelMigrationTargetsStateFactory.build({
          abc123: modelMigrationTargetFactory.build({
            data: ["controller123", "controller456"],
          }),
        }),
        supportedJujuVersions: supportedJujuVersionsStateFactory.build({
          data: [
            versionElemFactory.build({ version: "3.6.21" }),
            versionElemFactory.build({ version: "4.6.14" }),
          ],
        }),
      }),
    });
  });

  it("initially displays the version selection panel", async () => {
    renderComponent(<UpgradeModelPanel />, { state, url, path });
    expect(
      screen.getByRole("dialog", { name: UpgradeModelPanelHeaderLabel.TITLE }),
    ).toBeVisible();
  });

  it("can transition to the confirmation panel", async () => {
    renderComponent(<UpgradeModelPanel />, { state, url, path });
    await userEvent.click(
      screen.getByRole("radio", {
        name: UpgradeModelVersionFieldsLabel.MANUAL,
      }),
    );
    await userEvent.type(
      screen.getByRole("textbox", {
        name: UpgradeModelVersionFieldsLabel.VERSION,
      }),
      "3.6.21",
    );
    await userEvent.click(
      await screen.findByRole("button", {
        name: UpgradeModelVersionLabel.SUBMIT,
      }),
    );
    expect(
      await screen.findByRole("dialog", {
        name: /Upgrade test1/,
      }),
    ).toBeVisible();
  });
});
