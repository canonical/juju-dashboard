import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import dataDump from "testing/complete-redux-store-dump";

import { Routes } from "components/Routes/Routes";

const mockStore = configureStore([]);

describe("PageNotFound page", () => {
  it("should display when unknown route is accessed", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/foobar11"]}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes />
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("PageNotFound").length).toBe(1);
    // Ensure only one route is rendered
    expect(wrapper.find("main").length).toBe(1);
  });
});
