import { screen } from "@testing-library/react";

import {
  configFactory,
  generalStateFactory,
  authUserInfoFactory,
} from "testing/factories/general";
import { modelUserInfoFactory } from "testing/factories/juju/ModelManagerV9";
import {
  modelDataInfoFactory,
  jujuStateFactory,
  modelDataFactory,
  modelListInfoFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import AccessColumn from "./AccessColumn";
import { Label } from "./types";

describe("AccessColumn", () => {
  it("displays an access button and content", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        config: configFactory.build({
          isJuju: true,
        }),
        controllerConnections: {
          "wss://jimm.jujucharms.com/api": {
            user: authUserInfoFactory.build({
              identity: "user-eggman@external",
            }),
          },
        },
      }),
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            name: "test1",
            ownerTag: "user-eggman@external",
            wsControllerURL: "wss://jimm.jujucharms.com/api",
          }),
        },
        modelData: {
          abc123: modelDataFactory.build({
            info: modelDataInfoFactory.build({
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
            uuid: "abc123",
          }),
        },
      }),
    });
    const content = "From Donaldson's Dairy";
    renderComponent(
      <AccessColumn activeUser="eggman@external" modelName="test1">
        {content}
      </AccessColumn>,
      { state },
    );
    expect(
      screen.getByRole("button", { name: Label.ACCESS_BUTTON }),
    ).toBeInTheDocument();
  });

  it("does not display the access button if the user does not have permission", () => {
    renderComponent(
      <AccessColumn activeUser="eggman@external" modelName="test-model">
        From Donaldson's Dairy
      </AccessColumn>,
    );
    expect(
      screen.queryByRole("button", { name: Label.ACCESS_BUTTON }),
    ).not.toBeInTheDocument();
  });
});
