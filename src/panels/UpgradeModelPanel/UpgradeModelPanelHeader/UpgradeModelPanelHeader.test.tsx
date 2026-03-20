import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  generalStateFactory,
  configFactory,
  authUserInfoFactory,
} from "testing/factories/general";
import { modelStatusInfoFactory } from "testing/factories/juju/ClientV8";
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

import UpgradeModelPanelHeader from "./UpgradeModelPanelHeader";
import { Label } from "./types";

describe("UpgradeModelPanelHeader", () => {
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
            model: modelStatusInfoFactory.build({
              version: "3.6.14",
            }),
          }),
        },
      }),
    });
  });

  it("can display a default title", async () => {
    const back = vi.fn();
    renderComponent(<UpgradeModelPanelHeader back={back} titleId="123" />, {
      state,
      url,
      path,
    });
    expect(
      screen.getByRole("heading", {
        name: Label.TITLE,
      }),
    ).toBeInTheDocument();
  });

  it("can display the upgrade title", async () => {
    const back = vi.fn();
    renderComponent(
      <UpgradeModelPanelHeader back={back} titleId="123" version="4.5.6" />,
      {
        state,
        url,
        path,
      },
    );
    expect(
      screen.getByRole("heading", {
        name: /Upgrade test1/,
      }),
    ).toHaveTextContent("Upgrade test1 3.6.14 → 4.5.6");
  });

  it("can display a back button", async () => {
    const back = vi.fn();
    renderComponent(<UpgradeModelPanelHeader back={back} titleId="123" />, {
      state,
      url,
      path,
    });
    await userEvent.click(
      await screen.findByRole("button", {
        name: new RegExp(Label.BACK),
      }),
    );
    expect(back).toHaveBeenCalled();
  });
});
