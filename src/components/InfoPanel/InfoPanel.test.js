import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router";
import dataDump from "testing/complete-redux-store-dump";

import TestRoute from "components/Routes/TestRoute";

import InfoPanel from "./InfoPanel";

const mockStore = configureStore([]);

jest.mock("components/Topology/Topology", () => {
  const Topology = () => <div className="topology"></div>;
  return Topology;
});

describe("Info Panel", () => {
  it("renders the topology", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/group-test"]}>
          <TestRoute path="/models/*">
            <InfoPanel />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("Topology").length).toBe(1);
  });

  it("renders the expanded topology on click", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/group-test"]}>
          <TestRoute path="/models/*">
            <InfoPanel />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("[data-test='topology-modal']").length).toBe(0);
    wrapper
      .find(".info-panel__pictogram .p-icon--fullscreen")
      .simulate("click");
    expect(wrapper.find("[data-test='topology-modal']").length).toBe(1);
  });

  it("displays correct model status info", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/group-test"]}>
          <TestRoute path="/models/*">
            <InfoPanel />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find('[data-name="controller"]').text()).toStrictEqual(
      "iaas"
    );
  });
});
