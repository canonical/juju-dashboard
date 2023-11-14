import { screen } from "@testing-library/react";

import { Label } from "components/AuditLogsTable/AuditLogsTableActions/AuditLogsTableActions";
import type { RootState } from "store/store";
import { rootStateFactory, jujuStateFactory } from "testing/factories";
import { generalStateFactory, configFactory } from "testing/factories/general";
import { auditEventFactory } from "testing/factories/juju/jimm";
import { auditEventsStateFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import Logs from "./Logs";

describe("Logs", () => {
  let state: RootState;

  beforeEach(() => {
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
      juju: jujuStateFactory.build({
        auditEvents: auditEventsStateFactory.build({
          items: [auditEventFactory.build()],
          loaded: true,
        }),
      }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should render the page", async () => {
    renderComponent(<Logs />, { state });
    expect(screen.getByText("Audit logs")).toBeVisible();
    expect(await screen.findAllByRole("cell")).toHaveLength(6);
  });

  it("should display the actions", async () => {
    renderComponent(<Logs />, { state });
    expect(
      screen.getByRole("button", { name: Label.FILTER })
    ).toBeInTheDocument();
  });
});
