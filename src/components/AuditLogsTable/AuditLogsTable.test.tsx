import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { add } from "date-fns";

import { TestId } from "components/LoadingSpinner/LoadingSpinner";
import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { rootStateFactory, jujuStateFactory } from "testing/factories";
import { configFactory, generalStateFactory } from "testing/factories/general";
import { auditEventFactory } from "testing/factories/juju/jimm";
import { auditEventsStateFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import AuditLogsTable, { DEFAULT_LIMIT_VALUE } from "./AuditLogsTable";

describe("AuditLogsTable", () => {
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

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should have model as second header when showing the model data", async () => {
    renderComponent(<AuditLogsTable showModel={true} />, { state });
    expect((await screen.findAllByRole("columnheader"))[1]).toHaveTextContent(
      "model"
    );
  });

  it("should not have model as header when showModel param is not passed", async () => {
    renderComponent(<AuditLogsTable />, { state });
    const headers = await screen.findAllByRole("columnheader");
    headers.forEach((header) => {
      expect(header).not.toHaveTextContent("model");
    });
  });

  it("should not have model as header when not showing the model data", async () => {
    renderComponent(<AuditLogsTable showModel={false} />, { state });
    const headers = await screen.findAllByRole("columnheader");
    headers.forEach((header) => {
      expect(header).not.toHaveTextContent("model");
    });
  });

  it("should contain all headers", async () => {
    renderComponent(<AuditLogsTable showModel={true} />, { state });
    const columnHeaders = await screen.findAllByRole("columnheader");
    expect(columnHeaders[0]).toHaveTextContent("user");
    expect(columnHeaders[1]).toHaveTextContent("model");
    expect(columnHeaders[2]).toHaveTextContent("time");
    expect(columnHeaders[3]).toHaveTextContent("facade name");
    expect(columnHeaders[4]).toHaveTextContent("facade method");
    expect(columnHeaders[5]).toHaveTextContent("facade version");
  });

  it("should not fetch audit logs if there is no websocket", () => {
    state.general.config = configFactory.build({
      controllerAPIEndpoint: "",
    });
    const { store } = renderComponent(<AuditLogsTable />, { state });
    const action = jujuActions.fetchAuditEvents({
      wsControllerURL: "wss://example.com/api",
      limit: DEFAULT_LIMIT_VALUE + 1,
      offset: 0,
    });
    expect(
      store.getActions().find((dispatch) => dispatch.type === action.type)
    ).toBeUndefined();
  });

  it("should not fetch audit logs if there is no controller", () => {
    state.general.controllerConnections = {};
    const { store } = renderComponent(<AuditLogsTable />, { state });
    const action = jujuActions.fetchAuditEvents({
      wsControllerURL: "wss://example.com/api",
      limit: DEFAULT_LIMIT_VALUE + 1,
      offset: 0,
    });
    expect(
      store.getActions().find((dispatch) => dispatch.type === action.type)
    ).toBeUndefined();
  });

  it("should fetch audit logs", async () => {
    const { store } = renderComponent(<AuditLogsTable showModel />, { state });
    const action = jujuActions.fetchAuditEvents({
      wsControllerURL: "wss://example.com/api",
      limit: DEFAULT_LIMIT_VALUE + 1,
      offset: 0,
    });
    expect(
      store.getActions().find((dispatch) => dispatch.type === action.type)
    ).toMatchObject(action);
  });

  it("should display audit logs", async () => {
    renderComponent(<AuditLogsTable showModel />, { state });
    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(screen.queryByTestId(TestId.LOADING)).not.toBeInTheDocument();
    const row = screen.getAllByRole("row")[1];
    const cells = within(row).getAllByRole("cell");
    expect(cells[0]).toHaveTextContent("eggman");
    expect(cells[1]).toHaveTextContent("microk8s");
    expect(cells[2]).toHaveTextContent("1 day ago");
    expect(cells[3]).toHaveTextContent("ModelManager");
    expect(cells[4]).toHaveTextContent("AddModel");
    expect(cells[5]).toHaveTextContent("3");
  });

  it("should show refresh, next page and previous page buttons", async () => {
    renderComponent(<AuditLogsTable showModel />, { state });
    expect(screen.getByRole("button", { name: "Refresh" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Next page" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeVisible();
  });

  it("should navigate to first page when pressing refresh button", async () => {
    const auditLogs = [];
    for (let i = 1; i <= 51; i++) {
      auditLogs.push(
        auditEventFactory.build({
          "user-tag": `user-eggman${i}`,
        })
      );
    }
    state.juju.auditEvents.items = auditLogs;
    renderComponent(<AuditLogsTable showModel />, { state });
    await userEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(window.location.search).toEqual("?page=2");
    await userEvent.click(screen.getByRole("button", { name: "Refresh" }));
    expect(window.location.search).toEqual("?page=1");
  });

  it("should navigate to next page and then to previous page", async () => {
    const auditLogs = [];
    for (let i = 1; i <= 51; i++) {
      auditLogs.push(
        auditEventFactory.build({
          "user-tag": `user-eggman${i}`,
        })
      );
    }
    state.juju.auditEvents.items = auditLogs;
    renderComponent(<AuditLogsTable showModel />, { state });
    await userEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(window.location.search).toEqual("?page=2");
    await userEvent.click(
      screen.getByRole("button", { name: "Previous page" })
    );
    expect(window.location.search).toEqual("?page=1");
  });

  it("should change amount of logs per page", async () => {
    renderComponent(<AuditLogsTable showModel />, { state });
    const dropdownMenu = screen.getByRole("combobox");
    expect(dropdownMenu).toBeVisible();
    expect(dropdownMenu).toHaveTextContent("50/page");
    await userEvent.click(dropdownMenu);
    await userEvent.click(screen.getByRole("option", { name: "100/page" }));
    expect(dropdownMenu).toHaveTextContent("100/page");
  });
});
