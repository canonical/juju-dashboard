import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import dataDump from "testing/complete-redux-store-dump";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";

import ModelsIndex from "./ModelsIndex";

const mockStore = configureStore([]);

describe("Models Index page", () => {
  it("renders without crashing", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
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
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <BrowserRouter>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <ModelsIndex />
          </QueryParamProvider>
        </BrowserRouter>
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
    const searchParams = new URLSearchParams(window.location.search);
    expect(searchParams.get("groupedby")).toEqual("owner");
    expect(wrapper.find(".owners-group")).toBeDefined();
  });

  it("should display the correct window title", () => {
    const store = mockStore(dataDump);
    mount(
      <Provider store={store}>
        <BrowserRouter>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <ModelsIndex />
          </QueryParamProvider>
        </BrowserRouter>
      </Provider>
    );
    const pageTitle = document.title;
    expect(pageTitle).toEqual("Models | Juju Dashboard");
  });
});
