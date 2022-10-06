import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import dataDump from "testing/complete-redux-store-dump";

import EntityInfo from "./EntityInfo";

const mockStore = configureStore([]);

jest.mock("components/Topology/Topology", () => {
  const Topology = () => <div className="topology"></div>;
  return Topology;
});

describe("Entity info", () => {
  it("renders the expanded topology on click", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={["/models/user-eggman@external/group-test"]}
        >
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={
                <EntityInfo
                  data={{
                    name: "model1",
                    controller: "controller1",
                    region: "eu1",
                  }}
                />
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("[data-name='region']").text()).toBe("eu1");
  });
});
