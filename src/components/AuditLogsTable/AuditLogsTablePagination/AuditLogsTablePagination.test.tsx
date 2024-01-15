import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { add } from "date-fns";

import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { rootStateFactory, jujuStateFactory } from "testing/factories";
import { generalStateFactory, configFactory } from "testing/factories/general";
import { auditEventFactory } from "testing/factories/juju/jimm";
import { auditEventsStateFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import AuditLogsTablePagination, { Label } from "./AuditLogsTablePagination";

describe("AuditLogsTablePagination", () => {
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

  it("should navigate to next page and then to previous page", async () => {
    state.juju.auditEvents.items = auditEventFactory.buildList(51);
    renderComponent(<AuditLogsTablePagination />, { state });
    await userEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(window.location.search).toEqual("?page=2");
    await userEvent.click(
      screen.getByRole("button", { name: "Previous page" }),
    );
    expect(window.location.search).toEqual("?page=1");
  });

  it("should change amount of logs per page", async () => {
    const { store } = renderComponent(<AuditLogsTablePagination showLimit />, {
      state,
    });
    const dropdownMenu = screen.getByRole("combobox");
    expect(dropdownMenu).toBeVisible();
    expect(dropdownMenu).toHaveTextContent("50/page");
    await userEvent.click(dropdownMenu);
    await userEvent.selectOptions(dropdownMenu, "100/page");
    expect(dropdownMenu).toHaveTextContent("100/page");
    const action = jujuActions.updateAuditEventsLimit(100);
    expect(
      store.getActions().find((dispatch) => dispatch.type === action.type),
    ).toMatchObject(action);
  });

  it("should navigate to first page when pressing the back to start button", async () => {
    state.juju.auditEvents.items = auditEventFactory.buildList(51);
    renderComponent(<AuditLogsTablePagination />, { state });
    expect(
      screen.getByRole("button", { name: Label.FIRST_PAGE }),
    ).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(window.location.search).toEqual("?page=2");
    await userEvent.click(
      screen.getByRole("button", { name: Label.FIRST_PAGE }),
    );
    expect(window.location.search).toEqual("");
  });

  it("shouldn't be possible to navigate to next page if audit logs are loading", () => {
    state.juju.auditEvents.items = auditEventFactory.buildList(51);
    state.juju.auditEvents.loading = true;
    renderComponent(<AuditLogsTablePagination />, { state });
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("shouldn't be possible to navigate to next page if audit logs haven't loaded", () => {
    state.juju.auditEvents.items = auditEventFactory.buildList(51);
    state.juju.auditEvents.loaded = false;
    renderComponent(<AuditLogsTablePagination />, { state });
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });
});
