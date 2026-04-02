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
  jujuStateFactory,
  modelDataFactory,
  modelListInfoFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";
import urls from "urls";

import { versions } from "../UpgradeModelVersion/utils";

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
      }),
    });
  });

  it("closes the panel when the form is submitted", async () => {
    const onRemovePanelQueryParams = vi.fn();
    renderComponent(
      <UpgradeModelController
        back={vi.fn}
        onRemovePanelQueryParams={onRemovePanelQueryParams}
        version={versions[0]}
      />,
      { state, url, path },
    );
    await userEvent.click(
      await screen.findByRole("button", {
        name: Label.SUBMIT,
      }),
    );
    expect(onRemovePanelQueryParams).toHaveBeenCalled();
  });
});
