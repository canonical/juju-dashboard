import { MemoryRouter } from "react-router-dom";
import { mount } from "enzyme";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import dataDump from "testing/complete-redux-store-dump";
import cloneDeep from "clone-deep";

import PrimaryNav from "./PrimaryNav";

const mockStore = configureStore([]);
describe("Primary Nav", () => {
  it("applies is-selected state correctly", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/controllers"]}>
          <PrimaryNav />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("a.is-selected").text()).toStrictEqual("Controllers");
  });

  it("displays correct number of blocked models", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <PrimaryNav />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(".entity-count").text()).toStrictEqual("4");
  });

  it("displays the JAAS logo under JAAS", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <PrimaryNav />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(".logo__text").prop("src")).toBe("jaas-text.svg");
    expect(wrapper.find(".logo").prop("href")).toBe("https://jaas.ai");
  });

  it("displays the Juju logo under Juju", () => {
    const clonedDump = cloneDeep(dataDump);
    clonedDump.root.config.isJuju = true;
    const store = mockStore(clonedDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <PrimaryNav />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(".logo__text").prop("src")).toBe("juju-text.svg");
    expect(wrapper.find(".logo").prop("href")).toBe("https://juju.is");
  });

  it("displays the version number", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <PrimaryNav />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(".version").text()).toBe("Version 0.4.0");
  });
});
