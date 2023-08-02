import { screen } from "@testing-library/react";

import * as storeModule from "store/store";
import { rootStateFactory } from "testing/factories";
import { generalStateFactory, configFactory } from "testing/factories/general";
import { auditEventFactory } from "testing/factories/juju/jimm";
import { renderComponent } from "testing/utils";

import Logs from "./Logs";

describe("Logs", () => {
  let state: storeModule.RootState;

  beforeEach(() => {
    const dispatch = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ events: [auditEventFactory.build()] })
      );
    jest.spyOn(storeModule, "usePromiseDispatch").mockReturnValue(dispatch);
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com/api",
        }),
        controllerConnections: {
          "wss://example.com/api": {
            user: {
              "display-name": "eggman",
              identity: "user-eggman@external",
              "controller-access": "",
              "model-access": "",
            },
          },
        },
      }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should render the page", async () => {
    renderComponent(<Logs />, { state });
    expect(screen.getByText("Audit logs")).toBeVisible();
    expect(document.querySelector(".logs")).toBeVisible();
    expect(await screen.findAllByRole("cell")).toHaveLength(6);
  });
});
