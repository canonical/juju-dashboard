import { mount } from "enzyme";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import { QueryParamProvider } from "use-query-params";
import dataDump from "testing/complete-redux-store-dump";

import TestRoute from "components/Routes/TestRoute";

import ShareModel from "./ShareModel";

const mockStore = configureStore([]);

describe("Share Model Panel", () => {
  it("should show users with which a model is shared", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter initialEntries={["/models/eggman@external/hadoopspark"]}>
        <Provider store={store}>
          <TestRoute path="/models/:userName/:modelName?">
            <QueryParamProvider ReactRouterRoute={Route}>
              <ShareModel />
            </QueryParamProvider>
          </TestRoute>
        </Provider>
      </MemoryRouter>
    );
    const firstUserCard = wrapper.find(".share-model__card").first();
    const firstUserName = firstUserCard.find(".share-model__card-title strong");
    expect(firstUserName.text()).toBe("eggman@external");
  });
});
