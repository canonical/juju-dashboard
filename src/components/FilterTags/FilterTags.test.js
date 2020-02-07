import React from "react";
import { MemoryRouter } from "react-router";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import FilterTags from "./FilterTags";

import dataDump from "../../testing/complete-redux-store-dump";

const mockStore = configureStore([]);

describe("FilterTags", () => {
  it("displays the filter panel when input clicked", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <FilterTags />
        </Provider>
      </MemoryRouter>
    );
    const input = ".p-filter-tags__input";
    const panel = ".p-filter-panel";
    expect(wrapper.find(panel).hasClass("is-visible")).toEqual(false);
    wrapper.find(input).simulate("click");
    expect(wrapper.find(panel).hasClass("is-visible")).toEqual(true);
  });

  it("displays correct filter types as per model data", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <FilterTags />
        </Provider>
      </MemoryRouter>
    );
    expect(wrapper.exists('[data-test="owner"]')).toEqual(true);
    expect(wrapper.exists('[data-test="cloud"]')).toEqual(true);
    expect(wrapper.exists('[data-test="region"]')).toEqual(true);
    expect(wrapper.exists('[data-test="credential"]')).toEqual(true);
  });

  it("displays correct number of filter types as per model data", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <FilterTags />
        </Provider>
      </MemoryRouter>
    );
    expect(wrapper.find('[data-test="owner"] li').length).toBe(5);
    expect(wrapper.find('[data-test="cloud"] li').length).toBe(2);
    expect(wrapper.find('[data-test="region"] li').length).toBe(4);
    expect(wrapper.find('[data-test="credential"] li').length).toBe(8);
  });
});

describe("Filter capsules", () => {
  it("display in the input field when clicked", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <FilterTags />
        </Provider>
      </MemoryRouter>
    );
    const firstAvailableFilter = wrapper
      .find(".p-filter-panel .p-filter-panel__button")
      .first();
    firstAvailableFilter.simulate("click");
    wrapper.update();
    console.log(firstAvailableFilter.debug());
    expect(
      wrapper
        .find(".p-filter-panel .p-filter-panel__button")
        .first()
        .hasClass("is-selected")
    ).toEqual(true);
  });
});
