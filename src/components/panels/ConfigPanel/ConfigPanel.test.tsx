import { mount } from "enzyme";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import dataDump from "testing/complete-redux-store-dump";
import configResponse from "testing/config-response";

import { waitForComponentToPaint } from "testing/utils";
import { getApplicationConfig } from "juju/index";

import ConfigPanel from "./ConfigPanel";

const mockStore = configureStore([]);

jest.mock("juju/index", () => ({
  getApplicationConfig: jest.fn(),
}));

describe("ConfigPanel", () => {
  beforeEach(() => jest.resetModules());

  it("displays a message if the app has no config", async () => {
    (getApplicationConfig as jest.Mock).mockImplementation(() => {
      return Promise.resolve({ config: {} });
    });
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <ConfigPanel
          appName="easyrsa"
          charm="cs:easyrsa"
          modelUUID=""
          closePanel={() => {}}
        />
      </Provider>
    );

    await waitForComponentToPaint(wrapper);
    expect(wrapper.find("NoConfigMessage")).toMatchSnapshot();
  });

  it("highlights changed fields before save", async () => {
    (getApplicationConfig as jest.Mock).mockImplementation(() => {
      return Promise.resolve(configResponse);
    });
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <ConfigPanel
          appName="easyrsa"
          charm="cs:easyrsa"
          modelUUID=""
          closePanel={() => {}}
        />
      </Provider>
    );

    await waitForComponentToPaint(wrapper);
    const getWrapper = () =>
      wrapper.find("[data-config-name='custom-registry-ca']");
    const getInput = () => getWrapper().find("textarea");
    getInput().simulate("change", { target: { value: "new value" } });

    await waitForComponentToPaint(wrapper);
    expect(getInput().prop("value")).toBe("new value");
    expect(getWrapper().prop("className")).toBe(
      "config-input config-input--changed"
    );
  });
});
