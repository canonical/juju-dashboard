import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import dataDump from "testing/complete-redux-store-dump";

import ActionLogs, {
  Label,
} from "pages/EntityDetails/Model/ActionLogs/ActionLogs";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Output } from "./ActionLogs";

jest.mock("juju", () => {
  return {
    queryOperationsList: () => {
      return new Promise((resolve) => {
        const apiData = require("testing/list-operations-api-response.json");
        resolve(apiData.response);
      });
    },
    queryActionsList: () => {
      return new Promise((resolve) => {
        const apiData = require("testing/list-actions-api-response.json");
        resolve(apiData.response);
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
