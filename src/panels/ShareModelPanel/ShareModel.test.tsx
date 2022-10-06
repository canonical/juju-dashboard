import { mount } from "enzyme";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import dataDump from "testing/complete-redux-store-dump";

import ShareModel from "./ShareModel";

const mockStore = configureStore([]);

describe("Share Model Panel", () => {
  it("should show panel", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter initialEntries={["/models/eggman@external/hadoopspark"]}>
        <Provider store={store}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route
                path="/models/:userName/:modelName"
                element={<ShareModel />}
              />
            </Routes>
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    const panelHeader = wrapper.find(
      ".aside-split-col .share-cards__heading h5"
    );
    expect(panelHeader.text()).toEqual("Sharing with:");
  });

  it("should show small screen view toggles", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter initialEntries={["/models/eggman@external/hadoopspark"]}>
        <Provider store={store}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route
                path="/models/:userName/:modelName"
                element={<ShareModel />}
              />
            </Routes>
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    const addNewUserButton = wrapper.find(".share-cards__heading button");
    expect(addNewUserButton.exists()).toBe(true);
    addNewUserButton.simulate("click");
    const backToCardsButton = wrapper.find(".title-wrapper button");
    expect(backToCardsButton.exists()).toBe(true);
  });
});
