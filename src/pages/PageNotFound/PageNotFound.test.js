import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { MemoryRouter, Route } from "react-router";
import { QueryParamProvider } from "use-query-params";
import dataDump from "testing/complete-redux-store-dump";

import { Routes } from "components/Routes/Routes";

const mockStore = configureStore([]);

describe("PageNotFound page", () => {
  it("should display when unknown route is accessed", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/foobar11"]}>
          <QueryParamProvider ReactRouterRoute={Route}>
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
