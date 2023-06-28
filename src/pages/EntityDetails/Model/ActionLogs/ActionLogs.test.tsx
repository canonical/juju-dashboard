import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as componentUtils from "components/utils";
import * as juju from "juju/api";
import ActionLogs, {
  Label,
} from "pages/EntityDetails/Model/ActionLogs/ActionLogs";
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

import { Output } from "./ActionLogs";

jest.mock("components/utils", () => ({
  ...jest.requireActual("components/utils"),
  copyToClipboard: jest.fn(),
}));

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

jest.mock("juju/api", () => {
  return {
    queryOperationsList: jest.fn(),
    queryActionsList: jest.fn(),
  };
});

describe("Action Logs", () => {
  let state: RootState;
  const path = "/models/:userName/:modelName";
  const url = "/models/eggman@external/group-test?activeView=action-logs";

  beforeEach(() => {
    jest
      .spyOn(juju, "queryOperationsList")
      .mockResolvedValue(mockOperationResults);
    jest.spyOn(juju, "queryActionsList").mockResolvedValue(mockActionResults);
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
    jest.resetModules();
  });

  it("requests the action logs data on load", async () => {
    renderComponent(<ActionLogs />, { path, url, state });
    const expected = [
      ["easyrsa", "1/list-disks", "completed", "", "", "", ""],
      [
        "└easyrsa/0",
        "",
        "completed",
        "2",
        "log message 1",
        "over 1 year ago",
        "Output",
        "Result",
      ],
      [
        "└easyrsa/1",
        "",
        "completed",
        "3",
        "log message 1log message 2error message",
        "over 1 year ago",
        "Output",
      ],
    ];
    const rows = await screen.findAllByRole("row");
    // Start at row 1 because row 0 is the header row.
    expect(rows[1].textContent).toEqual(expected[0].join(""));
    expect(rows[2].textContent).toEqual(expected[1].join(""));
    expect(rows[3].textContent).toEqual(expected[2].join(""));
  });

  it("fails gracefully if app does not exist in model data", async () => {
    renderComponent(<ActionLogs />, { path, url, state });
    const expected = [
      ["easyrsa", "1/list-disks", "completed", "", "", "", ""],
      [
        "└easyrsa/0",
        "",
        "completed",
        "2",
        "log message 1",
        "over 1 year ago",
        "Output",
        "Result",
      ],
      [
        "└easyrsa/1",
        "",
        "completed",
        "3",
        "log message 1log message 2error message",
        "over 1 year ago",
        "Output",
      ],
    ];
    const rows = await screen.findAllByRole("row");
    // Start at row 1 because row 0 is the header row.
    expect(rows[1].textContent).toEqual(expected[0].join(""));
    expect(rows[2].textContent).toEqual(expected[1].join(""));
    expect(rows[3].textContent).toEqual(expected[2].join(""));
  });

  it("handles unknown dates", async () => {
    const completed = new Date("0001-01-01T00:00:00Z");
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
        }),
      ],
    });
    jest.spyOn(juju, "queryActionsList").mockResolvedValue(mockActionResults);
    renderComponent(<ActionLogs />, { path, url, state });
    const expected = [
      ["easyrsa", "1/list-disks", "completed", "", "", "", ""],
      [
        "└easyrsa/0",
        "",
        "completed",
        "2",
        "log message 1",
        "Unknown",
        "Output",
      ],
    ];
    const rows = await screen.findAllByRole("row");
    // Start at row 1 because row 0 is the header row.
    expect(rows[1].textContent).toEqual(expected[0].join(""));
  });

  it("Only shows messages of selected type", async () => {
    renderComponent(<ActionLogs />, { path, url, state });
    const rows = await screen.findAllByRole("row");
    await userEvent.click(
      within(rows[2]).getByRole("button", { name: Label.OUTPUT })
    );
    await userEvent.click(screen.getByRole("button", { name: Output.STDOUT }));
    expect(within(rows[2]).getByText("log message 1")).toBeInTheDocument();
    await userEvent.click(
      within(rows[3]).getByRole("button", { name: Label.OUTPUT })
    );
    await userEvent.click(screen.getByRole("button", { name: Output.STDERR }));
    expect(within(rows[3]).getByText("error message")).toBeInTheDocument();
  });

  it("can show both STOUT and STDERR", async () => {
    renderComponent(<ActionLogs />, { path, url, state });
    const rows = await screen.findAllByRole("row");
    await userEvent.click(
      within(rows[3]).getByRole("button", { name: Label.OUTPUT })
    );
    await userEvent.click(screen.getByRole("button", { name: Output.ALL }));
    expect(within(rows[3]).getByText("log message 1")).toBeInTheDocument();
    expect(within(rows[3]).getByText("error message")).toBeInTheDocument();
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

  it("can copy the action result", async () => {
    renderComponent(<ActionLogs />, { path, url, state });
    await userEvent.click(await screen.findByTestId("show-output"));
    await userEvent.click(screen.getByRole("button", { name: Label.COPY }));
    expect(componentUtils.copyToClipboard).toHaveBeenCalledWith(`{
  "key1": "value1",
  "test": 123
}`);
  });
});
