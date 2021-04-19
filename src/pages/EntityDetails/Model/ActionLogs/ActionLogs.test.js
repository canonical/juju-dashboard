import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router";

import dataDump from "testing/complete-redux-store-dump";

import ActionLogs from "pages/EntityDetails/Model/ActionLogs/ActionLogs";
import TestRoute from "components/Routes/TestRoute";
import { waitForComponentToPaint } from "testing/utils";

jest.mock("juju", () => {
  return {
    queryOperationsList: () => {
      return new Promise((resolve) => {
        const apiData = require("testing/list-operations-api-response.json");
        resolve(apiData.response);
      });
    },
  };
});

const mockStore = configureStore([]);

describe("Action Logs", () => {
  async function generateComponent() {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            "/models/eggman@external/group-test?activeView=action-logs",
          ]}
        >
          <TestRoute path="/models/:userName/:modelName?">
            <ActionLogs />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    await waitForComponentToPaint(wrapper);
    return wrapper;
  }

  it("requests the action logs data on load", async () => {
    const wrapper = await generateComponent();
    const expected = [
      ["easyrsa", "1/list-disks", "completed", "", "", ""],
      ["└easyrsa/0", "", "completed", "2", "", "2021-04-14T20:27:57Z"],
      ["└easyrsa/1", "", "completed", "3", "", "2021-04-14T20:27:57Z"],
    ];
    const result = [];
    wrapper.find("tbody TableRow").forEach((row, rowIndex) => {
      result.push([]);
      row.find("TableCell").forEach((cell) => {
        result[rowIndex].push(cell.text());
      });
    });
    expect(expected).toEqual(result);
  });
});
