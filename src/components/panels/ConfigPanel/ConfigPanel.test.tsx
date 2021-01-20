import { mount } from "enzyme";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import dataDump from "testing/complete-redux-store-dump";

import { waitForComponentToPaint } from "testing/utils";

import ConfigPanel from "./ConfigPanel";

const getApplicationConfig = () => {
  return Promise.resolve({ config: {} });
};

jest.mock("juju/index", () => ({
  getApplicationConfig: getApplicationConfig,
}));

const mockStore = configureStore([]);

describe("ConfigPanel", () => {
  it("displays a message if the app has no config", async () => {
    const store = mockStore(dataDump);
    const title = <div>title</div>;
    const wrapper = mount(
      <Provider store={store}>
        <ConfigPanel
          appName="easyrsa"
          title={title}
          modelUUID=""
          closePanel={() => {}}
        />
      </Provider>
    );

    await waitForComponentToPaint(wrapper);
    expect(wrapper.find(".config-panel__message")).toMatchSnapshot();
  });
});
