import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { mount } from "enzyme";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import cloneDeep from "clone-deep";

import dataDump from "testing/complete-redux-store-dump";

import ActionLogs from "pages/EntityDetails/Model/ActionLogs/ActionLogs";
import { waitForComponentToPaint } from "testing/utils";
import { act } from "react-dom/test-utils";

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
  async function generateComponent(applicationData = dataDump) {
    const store = mockStore(applicationData);
    const wrapper = mount(
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
    await waitForComponentToPaint(wrapper);
    return wrapper;
  }

  it("requests the action logs data on load", async () => {
    const wrapper = await generateComponent();
    const expected = [
      ["easyrsa", "1/list-disks", "completed", "", "", "", ""],
      [
        "└easyrsa/0",
        "",
        "completed",
        "2",
        "log message 1",
        new Date("2021-04-14T20:27:57Z").toLocaleString(),
        "Output",
      ],
      [
        "└easyrsa/1",
        "",
        "completed",
        "3",
        "log message 1log message 2error message",
        new Date("2021-04-14T20:27:57Z").toLocaleString(),
        "Output",
      ],
    ];
    const result = [];
    wrapper.find("tbody TableRow").forEach((row, rowIndex) => {
      result.push([]);
      row.find("TableCell").forEach((cell) => {
        result[rowIndex].push(cell.text());
      });
    });
    expect(result).toEqual(expected);
  });

  it("fails gracefully if app does not exist in model data", async () => {
    const clonedData = cloneDeep(dataDump);
    delete clonedData.juju.modelData["57650e3c-815f-4540-89df-81fdfakeb7ef"]
      .easyrsa;

    const wrapper = await generateComponent();
    const expected = [
      ["easyrsa", "1/list-disks", "completed", "", "", "", ""],
      [
        "└easyrsa/0",
        "",
        "completed",
        "2",
        "log message 1",
        new Date("2021-04-14T20:27:57Z").toLocaleString(),
        "Output",
      ],
      [
        "└easyrsa/1",
        "",
        "completed",
        "3",
        "log message 1log message 2error message",
        new Date("2021-04-14T20:27:57Z").toLocaleString(),
        "Output",
      ],
    ];
    const result = [];
    wrapper.find("tbody TableRow").forEach((row, rowIndex) => {
      result.push([]);
      row.find("TableCell").forEach((cell) => {
        result[rowIndex].push(cell.text());
      });
    });
    expect(result).toEqual(expected);
  });
  it("Only shows messages of selected type", async () => {
    const clonedData = cloneDeep(dataDump);
    delete clonedData.juju.modelData["57650e3c-815f-4540-89df-81fdfakeb7ef"]
      .easyrsa;

    const wrapper = await generateComponent();
    const expected = [
      ["easyrsa", "1/list-disks", "completed", "", "", "", ""],
      [
        "└easyrsa/0",
        "",
        "completed",
        "2",
        "log message 1",
        new Date("2021-04-14T20:27:57Z").toLocaleString(),
        "STDOUT",
      ],
      [
        "└easyrsa/1",
        "",
        "completed",
        "3",
        "error message",
        new Date("2021-04-14T20:27:57Z").toLocaleString(),
        "STDERR",
      ],
    ];
    const result = [];
    wrapper.find("tbody TableRow").forEach((row, rowIndex) => {
      // choose only stdout for action 1
      if (rowIndex > 0) {
        row.find("ContextualMenu").simulate("click");
        act(() => {
          // select stdout for the first action logs item and stderr for the second one
          const stdoutElement = row.find("ContextualMenu").props().links[
            rowIndex
          ];
          stdoutElement.onClick();
        });
      }
      // choose only stderr for action 2
      result.push([]);
      row.find("TableCell").forEach((cell) => {
        result[rowIndex].push(cell.text());
      });
    });
    expect(result).toEqual(expected);
  });
});
