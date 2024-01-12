import { screen, within } from "@testing-library/react";
import { add } from "date-fns";

import { TestId } from "components/LoadingSpinner/LoadingSpinner";
import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { rootStateFactory, jujuStateFactory } from "testing/factories";
import { configFactory, generalStateFactory } from "testing/factories/general";
import { auditEventFactory } from "testing/factories/juju/jimm";
import { auditEventsStateFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";
import urls from "urls";

import AuditLogsTable from "./AuditLogsTable";
import { DEFAULT_LIMIT_VALUE } from "./consts";

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
    renderComponent(<AuditLogsTable />, {
      state,
    });
    expect((await screen.findAllByRole("columnheader"))[1]).toHaveTextContent(
      "model",
    );
  });

  it("should not have model as header when not showing the model data", async () => {
    renderComponent(<AuditLogsTable />, {
      state,
      path: urls.model.index(null),
      url: urls.model.index({
        userName: "eggman@external",
        modelName: "test-model",
      }),
    });
    const headers = await screen.findAllByRole("columnheader");
    headers.forEach((header) => {
      expect(header).not.toHaveTextContent("model");
    });
  });

  it("should contain all headers", async () => {
    renderComponent(<AuditLogsTable />, {
      state,
    });
    const columnHeaders = await screen.findAllByRole("columnheader");
    expect(columnHeaders[0]).toHaveTextContent("user");
    expect(columnHeaders[1]).toHaveTextContent("model");
    expect(columnHeaders[2]).toHaveTextContent("time");
    expect(columnHeaders[3]).toHaveTextContent("facade name");
    expect(columnHeaders[4]).toHaveTextContent("facade method");
    expect(columnHeaders[5]).toHaveTextContent("facade version");
  });

  it("should fetch audit logs", async () => {
    const { store } = renderComponent(<AuditLogsTable />, { state });
    const action = jujuActions.fetchAuditEvents({
      wsControllerURL: "wss://example.com/api",
      limit: DEFAULT_LIMIT_VALUE + 1,
      offset: 0,
    });
    expect(
      store.getActions().find((dispatch) => dispatch.type === action.type),
    ).toMatchObject(action);
  });

  it("should display audit logs", async () => {
    state.juju.auditEvents.items = [
      auditEventFactory.build({
        model: "microk8s",
        time: add(new Date(), { days: -1 }).toISOString(),
        "facade-name": "ModelManager",
        "facade-method": "AddModel",
        "facade-version": 3,
      }),
    ];
    renderComponent(<AuditLogsTable />, { state });
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

  it("should display filters", async () => {
    renderComponent(<AuditLogsTable />, {
      state,
      url: "/?user=eggman",
    });
    expect(document.querySelector(".p-chip__value")).toHaveTextContent(
      "eggman",
    );
  });

  it("should not display pagination if there is only one page of logs", async () => {
    state.juju.auditEvents.items = auditEventFactory.buildList(50);
    renderComponent(<AuditLogsTable />, {
      state,
    });
    expect(
      screen.queryByRole("navigation", { name: "Pagination" }),
    ).not.toBeInTheDocument();
  });

  it("should display pagination if there is more than one page of logs", async () => {
    state.juju.auditEvents.items = auditEventFactory.buildList(51);
    renderComponent(<AuditLogsTable />, {
      state,
    });
    expect(
      screen.getByRole("navigation", { name: "Pagination" }),
    ).toBeInTheDocument();
  });

  it("should display pagination if not on the first page", async () => {
    state.juju.auditEvents.items = auditEventFactory.buildList(51);
    renderComponent(<AuditLogsTable />, {
      state,
      url: "/?page=2",
    });
    expect(
      screen.getByRole("navigation", { name: "Pagination" }),
    ).toBeInTheDocument();
  });
});
