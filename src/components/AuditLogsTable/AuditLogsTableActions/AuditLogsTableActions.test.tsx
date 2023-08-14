import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { add } from "date-fns";

import type { RootState } from "store/store";
import { rootStateFactory, jujuStateFactory } from "testing/factories";
import { generalStateFactory, configFactory } from "testing/factories/general";
import { auditEventFactory } from "testing/factories/juju/jimm";
import { auditEventsStateFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import AuditLogsTableActions, { Label } from "./AuditLogsTableActions";

describe("AuditLogsTableActions", () => {
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
          items: [
            auditEventFactory.build({
              time: add(new Date(), { days: -1 }).toISOString(),
            }),
          ],
          loaded: true,
        }),
      }),
    });
  });

  it("should show refresh, next page and previous page buttons", async () => {
    renderComponent(<AuditLogsTableActions />, { state });
    expect(screen.getByRole("button", { name: "Refresh" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Next page" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeVisible();
  });

  it("can open the filter panel", async () => {
    renderComponent(<AuditLogsTableActions />);
    await userEvent.click(screen.getByRole("button", { name: Label.FILTER }));
    expect(window.location.search).toEqual("?panel=audit-log-filters");
  });
});
