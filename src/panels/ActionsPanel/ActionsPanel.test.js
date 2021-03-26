import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { mount } from "enzyme";
import { MemoryRouter, Route } from "react-router";
import { QueryParamProvider } from "use-query-params";

import dataDump from "testing/complete-redux-store-dump";

import { executeActionOnUnits } from "juju/index";
import { waitForComponentToPaint } from "testing/utils";

import TestRoute from "components/Routes/TestRoute";
import ActionsPanel from "./ActionsPanel";

const mockStore = configureStore([]);

jest.mock("juju", () => {
  return {
    executeActionOnUnits: jest.fn(),
    getActionsForApplication: () => {
      return new Promise((resolve) => {
        const apiData = require("testing/actions-list-api-response.json");
        resolve(apiData.response);
      });
    },
  };
});

describe("ActionsPanel", () => {
  async function generateComponent() {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            "/models/user-eggman@external/group-test/app/kubernetes-master?panel=execute-action",
          ]}
        >
          <TestRoute path="/models/:userName/:modelName?/app/:appName?">
            <QueryParamProvider ReactRouterRoute={Route}>
              <ActionsPanel />
            </QueryParamProvider>
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    await waitForComponentToPaint(wrapper);
    return wrapper;
  }

  it("Renders the list of available actions", async () => {
    const wrapper = await generateComponent();
    expect(wrapper.find("LoadingHandler").length).toBe(1);
    expect(wrapper.find("RadioInputBox").length).toBe(20);
    expect(wrapper.find("Field").length).toBe(30);
  });

  it("validates that an action is selected before submitting", async () => {
    const wrapper = await generateComponent();
    expect(wrapper.find("Button").prop("disabled")).toBe(true);
  });

  it("submits the action request to the api without options", async () => {
    const wrapper = await generateComponent();
    expect(wrapper.find("Button").prop("disabled")).toBe(true);
    wrapper
      .find('input[aria-labelledby="inputRadio-pause"]')
      .simulate("click", {});
    expect(wrapper.find("Button").prop("disabled")).toBe(false);
    wrapper.find(".actions-panel__run-action").simulate("click", {});
    const call = executeActionOnUnits.mock.calls[0];
    expect(call[0]).toEqual(["ceph/0"]);
    expect(call[1]).toBe("pause");
    expect(call[2]).toEqual({}); // no options
  });

  it("submits the action request to the api with options that are required", async () => {
    const wrapper = await generateComponent();
    wrapper
      .find('input[aria-labelledby="inputRadio-add-disk"]')
      .simulate("click", {});
    wrapper.find('input[name="add-disk-osd-devices"]').simulate("change", {
      target: { name: "add-disk-osd-devices", value: "new device" },
    });
    await waitForComponentToPaint(wrapper);
    await waitForComponentToPaint(wrapper);
    expect(wrapper.find(".actions-panel__run-action").prop("disabled")).toBe(
      false
    );
    wrapper.find(".actions-panel__run-action").simulate("click", {});
    const call = executeActionOnUnits.mock.calls[0];
    expect(call[0]).toEqual(["ceph/0"]);
    expect(call[1]).toBe("add-disk");
    expect(call[2]).toEqual({
      bucket: "",
      "osd-devices": "new device",
    });
  });
});
