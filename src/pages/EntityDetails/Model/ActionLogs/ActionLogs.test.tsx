import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import dataDump from "testing/complete-redux-store-dump";
import {
  actionFactory,
  actionMessageFactory,
  actionResultFactory,
  actionResultsFactory,
  operationResultFactory,
  operationResultsFactory,
} from "testing/factories/juju/ActionV7";

import ActionLogs, {
  Label,
} from "pages/EntityDetails/Model/ActionLogs/ActionLogs";

import { Output } from "./ActionLogs";

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
        }),
        actionResultFactory.build({
          action: actionFactory.build({
            tag: "action-3",
            receiver: "unit-easyrsa-1",
            name: "list-disks",
          }),
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
      log: [
        actionMessageFactory.build({
          message: "log message 1",
        }),
      ],
    }),
    actionResultFactory.build({
      action: actionFactory.build({
        tag: "action-3",
        receiver: "unit-easyrsa-1",
        name: "list-disks",
      }),
      log: [
        actionMessageFactory.build({
          message: "log message 1",
        }),
        actionMessageFactory.build({
          message: "log message 2",
        }),
      ],
      status: "failed",
      message: "error message",
    }),
  ],
});

jest.mock("juju/api", () => {
  return {
    queryOperationsList: () => {
      return new Promise((resolve) => {
        resolve(mockOperationResults);
      });
    },
    queryActionsList: () => {
      return new Promise((resolve) => {
        resolve(mockActionResults);
      });
    },
  };
});

const mockStore = configureStore([]);

describe("Action Logs", () => {
  function generateComponent(applicationData = dataDump) {
    const store = mockStore(applicationData);
    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            "/models/eggman@external/group-test?activeView=action-logs",
          ]}
        >
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={<ActionLogs />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  }

  it("requests the action logs data on load", async () => {
    generateComponent();
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
    generateComponent();
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

  it("Only shows messages of selected type", async () => {
    generateComponent();
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
});
