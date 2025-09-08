import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { add } from "date-fns";
import { vi } from "vitest";

import * as actionsHooks from "juju/api-hooks/actions";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  actionFactory,
  actionMessageFactory,
  actionResultFactory,
  actionResultsFactory,
  operationResultFactory,
  operationResultsFactory,
} from "testing/factories/juju/ActionV7";
import { detailedStatusFactory } from "testing/factories/juju/ClientV6";
import {
  jujuStateFactory,
  modelDataApplicationFactory,
  modelDataFactory,
  modelDataInfoFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";
import { logger } from "utils/logger";

import ActionLogs from "./ActionLogs";
import { Label, Output } from "./types";

const completed = new Date();
completed.setMonth(completed.getMonth() - 18);

const mockOperationResults = operationResultsFactory.build({
  results: [
    operationResultFactory.build({
      actions: [
        actionResultFactory.build({
          action: actionFactory.build({
            tag: "action-2",
            receiver: "unit-easyrsa-0",
            name: "list-disks",
          }),
          completed: completed.toISOString(),
        }),
        actionResultFactory.build({
          action: actionFactory.build({
            tag: "action-3",
            receiver: "unit-easyrsa-1",
            name: "list-disks",
          }),
          completed: completed.toISOString(),
        }),
      ],
    }),
  ],
});

const mockActionResults = actionResultsFactory.build({
  results: [
    actionResultFactory.build({
      action: actionFactory.build({
        tag: "action-2",
        receiver: "unit-easyrsa-0",
        name: "list-disks",
      }),
      completed: completed.toISOString(),
      log: [
        actionMessageFactory.build({
          message: "log message 1",
        }),
      ],
      output: {
        key1: "value1",
        test: 123,
      },
    }),
    actionResultFactory.build({
      action: actionFactory.build({
        tag: "action-3",
        receiver: "unit-easyrsa-1",
        name: "list-disks",
      }),
      completed: completed.toISOString(),
      log: [
        actionMessageFactory.build({
          message: "log message 1",
        }),
        actionMessageFactory.build({
          message: "log message 2",
        }),
      ],
      output: { "return-code": "1" },
      status: "failed",
      message: "error message",
    }),
  ],
});

vi.mock("juju/api-hooks/actions", () => {
  return {
    useQueryActionsList: vi.fn().mockReturnValue(vi.fn()),
    useQueryOperationsList: vi.fn().mockReturnValue(vi.fn()),
  };
});

describe("Action Logs", () => {
  let state: RootState;
  const path = "/models/:userName/:modelName";
  const url = "/models/eggman@external/group-test?activeView=action-logs";

  beforeEach(() => {
    vi.spyOn(logger, "error").mockImplementation(() => vi.fn());
    vi.spyOn(actionsHooks, "useQueryOperationsList").mockImplementation(() =>
      vi.fn().mockImplementation(() => Promise.resolve(mockOperationResults)),
    );
    vi.spyOn(actionsHooks, "useQueryActionsList").mockImplementation(() =>
      vi.fn().mockImplementation(() => Promise.resolve(mockActionResults)),
    );
    state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelDataFactory.build({
            applications: {
              easyrsa: modelDataApplicationFactory.build({
                status: detailedStatusFactory.build({
                  status: "running",
                }),
              }),
            },
            info: modelDataInfoFactory.build({
              name: "group-test",
            }),
          }),
        },
      }),
    });
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("requests the action logs data on load", async () => {
    renderComponent(<ActionLogs />, { path, url, state });
    const expected = [
      ["easyrsa", "1/list-disks", "completed", "", ""],
      ["└easyrsa/0", "2", "completed", "log message 1", "over 1 year ago"],
      [
        "└easyrsa/1",
        "3",
        "completed",
        "log message 1log message 2error message",
        "over 1 year ago",
      ],
    ];
    const rows = await screen.findAllByRole("row");
    // Start at row 1 because row 0 is the header row.
    expect(rows[1].textContent).toEqual(expected[0].join(""));
    expect(rows[2].textContent).toEqual(expected[2].join(""));
    expect(rows[3].textContent).toEqual(expected[1].join(""));
  });

  it("fails gracefully if app does not exist in model data", async () => {
    renderComponent(<ActionLogs />, { path, url, state });
    const expected = [
      ["easyrsa", "1/list-disks", "completed", "", ""],
      ["└easyrsa/0", "2", "completed", "log message 1", "over 1 year ago"],
      [
        "└easyrsa/1",
        "3",
        "completed",
        "log message 1log message 2error message",
        "over 1 year ago",
      ],
    ];
    const rows = await screen.findAllByRole("row");
    // Start at row 1 because row 0 is the header row.
    expect(rows[1].textContent).toEqual(expected[0].join(""));
    expect(rows[2].textContent).toEqual(expected[2].join(""));
    expect(rows[3].textContent).toEqual(expected[1].join(""));
  });

  it("orders by most recent first by default", async () => {
    const yesterday = add(new Date(), { days: -1 });
    const mockResults = operationResultsFactory.build({
      results: [
        operationResultFactory.build({
          actions: [
            actionResultFactory.build({
              action: actionFactory.build({
                tag: "action-2",
                receiver: "unit-easyrsa-0",
                name: "list-disks",
              }),
              completed: completed.toISOString(),
            }),
            actionResultFactory.build({
              action: actionFactory.build({
                tag: "action-3",
                receiver: "unit-easyrsa-1",
                name: "list-disks",
              }),
              completed: yesterday.toISOString(),
            }),
          ],
        }),
      ],
    });
    vi.spyOn(actionsHooks, "useQueryOperationsList").mockImplementation(() =>
      vi.fn().mockImplementation(() => Promise.resolve(mockResults)),
    );
    renderComponent(<ActionLogs />, { path, url, state });
    const expected = [
      [
        "└easyrsa/1",
        "3",
        "completed",
        "log message 1log message 2error message",
        "1 day ago",
      ],
      ["└easyrsa/0", "2", "completed", "log message 1", "over 1 year ago"],
    ];
    const tableBody = await screen.findAllByRole("rowgroup");
    const rows = await within(tableBody[1]).findAllByRole("row");
    expect(rows[1].textContent).toEqual(expected[0].join(""));
    expect(rows[2].textContent).toEqual(expected[1].join(""));
  });

  it("handles unknown dates", async () => {
    const completedDate = new Date("0001-01-01T00:00:00Z");
    const mockResults = actionResultsFactory.build({
      results: [
        actionResultFactory.build({
          action: actionFactory.build({
            tag: "action-2",
            receiver: "unit-easyrsa-0",
            name: "list-disks",
          }),
          completed: completedDate.toISOString(),
          log: [
            actionMessageFactory.build({
              message: "log message 1",
            }),
          ],
        }),
      ],
    });
    vi.spyOn(actionsHooks, "useQueryActionsList").mockImplementation(() =>
      vi.fn().mockImplementation(() => Promise.resolve(mockResults)),
    );
    renderComponent(<ActionLogs />, { path, url, state });
    const expected = [
      ["easyrsa", "1/list-disks", "completed", "", "", "", ""],
      ["└easyrsa/0", "2", "completed", "log message 1", "Unknown"],
    ];
    const rows = await screen.findAllByRole("row");
    // Start at row 1 because row 0 is the header row.
    expect(rows[1].textContent).toEqual(expected[0].join(""));
  });

  it("handles no completed date", async () => {
    const mockResults = operationResultsFactory.build({
      results: [
        operationResultFactory.build({
          actions: [
            actionResultFactory.build({
              action: actionFactory.build({
                tag: "action-2",
                receiver: "unit-easyrsa-0",
                name: "list-disks",
              }),
              completed: undefined,
            }),
          ],
        }),
      ],
    });
    vi.spyOn(actionsHooks, "useQueryOperationsList").mockImplementation(() =>
      vi.fn().mockImplementation(() => Promise.resolve(mockResults)),
    );
    renderComponent(<ActionLogs />, { path, url, state });
    const expected = [
      ["easyrsa", "1/list-disks", "completed", "", "", "", ""],
      ["└easyrsa/0", "2", "completed", "log message 1", "Unknown"],
    ];
    const rows = await screen.findAllByRole("row");
    // Start at row 1 because row 0 is the header row.
    expect(rows[1].textContent).toEqual(expected[0].join(""));
  });

  it("Only shows messages of selected type", async () => {
    renderComponent(<ActionLogs />, { path, url, state });
    const rows = await screen.findAllByRole("row");
    await userEvent.click(
      within(rows[3]).getByRole("button", { name: Label.OUTPUT }),
    );
    await userEvent.click(screen.getByRole("button", { name: Output.STDOUT }));
    expect(within(rows[3]).getByText("log message 1")).toBeInTheDocument();
    await userEvent.click(
      within(rows[2]).getByRole("button", { name: Label.OUTPUT }),
    );
    await userEvent.click(screen.getByRole("button", { name: Output.STDERR }));
    expect(within(rows[2]).getByText("error message")).toBeInTheDocument();
  });

  it("can show both STOUT and STDERR", async () => {
    renderComponent(<ActionLogs />, { path, url, state });
    const rows = await screen.findAllByRole("row");
    await userEvent.click(
      within(rows[2]).getByRole("button", { name: Label.OUTPUT }),
    );
    await userEvent.click(screen.getByRole("button", { name: Output.ALL }));
    expect(within(rows[2]).getByText("log message 1")).toBeInTheDocument();
    expect(within(rows[2]).getByText("error message")).toBeInTheDocument();
  });

  it("does not display a toggle when there is neither STOUT or STDERR", async () => {
    const mockResults = actionResultsFactory.build({
      results: [
        actionResultFactory.build({
          log: undefined,
          status: "completed",
        }),
      ],
    });
    vi.spyOn(actionsHooks, "useQueryActionsList").mockImplementation(() =>
      vi.fn().mockImplementation(() => Promise.resolve(mockResults)),
    );
    renderComponent(<ActionLogs />, { path, url, state });
    const rows = await screen.findAllByRole("row");
    expect(
      within(rows[2]).queryByRole("button", { name: Label.OUTPUT }),
    ).not.toBeInTheDocument();
  });

  it("only shows the action result button when there is a result", async () => {
    renderComponent(<ActionLogs />, { path, url, state });
    const showOutputBtns = await screen.findAllByTestId("show-output");
    expect(showOutputBtns.length).toBe(1);
  });

  it("shows the payload when the action result button is clicked", async () => {
    renderComponent(<ActionLogs />, { path, url, state });
    const showOutputBtn = await screen.findByTestId("show-output");
    await userEvent.click(showOutputBtn);
    const modal = await screen.findByTestId("action-payload-modal");
    expect(modal).toBeInTheDocument();
  });

  it("closes the payload modal when the close button is clicked", async () => {
    renderComponent(<ActionLogs />, { path, url, state });
    const showOutputBtn = await screen.findByTestId("show-output");
    await userEvent.click(showOutputBtn);
    const modal = await screen.findByTestId("action-payload-modal");
    expect(modal).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Close active modal"));
    expect(modal).not.toBeInTheDocument();
  });

  it("should show error when fetching action logs and refetch action logs", async () => {
    const queryOperationsListSpy = vi
      .fn()
      .mockImplementation(() =>
        Promise.reject(new Error("Error while querying operations list.")),
      );
    vi.spyOn(actionsHooks, "useQueryOperationsList").mockImplementation(
      () => queryOperationsListSpy,
    );
    renderComponent(<ActionLogs />, { path, url, state });
    expect(queryOperationsListSpy).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith(
        Label.FETCH_ERROR,
        new Error("Error while querying operations list."),
      );
    });
    const fetchErrorNotification = screen.getByText(
      new RegExp(Label.FETCH_ERROR),
    );
    expect(fetchErrorNotification).toBeInTheDocument();
    expect(fetchErrorNotification.childElementCount).toBe(1);
    const refetchButton = fetchErrorNotification.children[0];
    expect(refetchButton).toHaveTextContent("refetch");
    await userEvent.click(refetchButton);
    expect(queryOperationsListSpy).toHaveBeenCalledTimes(2);
  });
});
