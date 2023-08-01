import { screen, within } from "@testing-library/react";
import { add } from "date-fns";

import { TestId } from "components/LoadingSpinner/LoadingSpinner";
import { actions as jujuActions } from "store/juju";
import * as storeModule from "store/store";
import { rootStateFactory } from "testing/factories";
import { configFactory, generalStateFactory } from "testing/factories/general";
import { auditEventFactory } from "testing/factories/juju/jimm";
import { renderComponent } from "testing/utils";

import AuditLogsTable from "./AuditLogsTable";

describe("AuditLogsTable", () => {
  let state: storeModule.RootState;

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
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should have model as second header when showing the model data", () => {
    renderComponent(<AuditLogsTable showModel={true} />);
    expect(document.querySelector("table tr")).toBeVisible();
    expect(document.querySelectorAll("table th")[1]).toHaveTextContent("model");
  });

  it("should not have model as header when showModel param is not passed", () => {
    renderComponent(<AuditLogsTable />);
    expect(document.querySelector("table tr")).toBeVisible();
    const headers = document.querySelectorAll("table th");
    headers.forEach((header) => {
      expect(header).not.toHaveTextContent("model");
    });
  });

  it("should not have model as header when not showing the model data", () => {
    renderComponent(<AuditLogsTable showModel={false} />);
    expect(document.querySelector("table tr")).toBeVisible();
    const headers = document.querySelectorAll("table th");
    headers.forEach((header) => {
      expect(header).not.toHaveTextContent("model");
    });
  });

  it("should contain all headers", () => {
    renderComponent(<AuditLogsTable showModel={true} />);
    const columnHeaders = document.querySelectorAll("table th");
    expect(columnHeaders[0]).toHaveTextContent("user");
    expect(columnHeaders[1]).toHaveTextContent("model");
    expect(columnHeaders[2]).toHaveTextContent("time");
    expect(columnHeaders[3]).toHaveTextContent("facade name");
    expect(columnHeaders[4]).toHaveTextContent("facade method");
    expect(columnHeaders[5]).toHaveTextContent("facade version");
  });

  it("should not fetch audit logs if there is no websocket", () => {
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve());
    jest.spyOn(storeModule, "usePromiseDispatch").mockReturnValue(dispatch);
    state.general.config = configFactory.build({
      controllerAPIEndpoint: "",
    });
    renderComponent(<AuditLogsTable />, { state });
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("should not fetch audit logs if there is no controller", () => {
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve());
    jest.spyOn(storeModule, "usePromiseDispatch").mockReturnValue(dispatch);
    state.general.controllerConnections = {};
    renderComponent(<AuditLogsTable />, { state });
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("should fetch audit logs", async () => {
    const dispatch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        events: [
          auditEventFactory.build({
            time: add(new Date(), { days: -1 }).toISOString(),
          }),
        ],
      })
    );
    jest.spyOn(storeModule, "usePromiseDispatch").mockReturnValue(dispatch);
    renderComponent(<AuditLogsTable showModel />, { state });
    expect(dispatch).toHaveBeenCalledWith(
      jujuActions.findAuditEvents({
        wsControllerURL: "wss://example.com/api",
      })
    );
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
});
