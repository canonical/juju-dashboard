import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { MemoryRouter, Router, Route } from "react-router";
import dataDump from "testing/complete-redux-store-dump";
import { createMemoryHistory } from "history";
import { QueryParamProvider } from "use-query-params";

import ModelsIndex from "./ModelsIndex";

const mockStore = configureStore([]);

describe("Models Index page", () => {
  it("renders without crashing", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <QueryParamProvider ReactRouterRoute={Route}>
            <ModelsIndex />
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("Header")).toBeDefined();
    expect(wrapper.find("TableList")).toBeDefined();
    expect(wrapper.find("ChipGroup")).toBeDefined();
  });

  it("displays correct grouping view", () => {
    const history = createMemoryHistory();
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <ModelsIndex />
          </QueryParamProvider>
        </Router>
      </Provider>
    );
    expect(wrapper.find(".p-button-group__button.is-selected").text()).toBe(
      "status"
    );
    wrapper.find("button[value='owner']").simulate("click", {
      target: { value: "owner" },
    });
    expect(wrapper.find(".p-button-group__button.is-selected").text()).toBe(
      "owner"
    );
    const searchParams = new URLSearchParams(history.location.search);
    expect(searchParams.get("groupedby")).toEqual("owner");
    expect(wrapper.find(".owners-group")).toBeDefined();
  });

  it("should display the correct window title", () => {
    const store = mockStore(dataDump);
    const history = createMemoryHistory();
    mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <ModelsIndex />
          </QueryParamProvider>
        </Router>
      </Provider>
    );
    const pageTitle = document.title;
    expect(pageTitle).toEqual("Models | Juju Dashboard");
  });
});
