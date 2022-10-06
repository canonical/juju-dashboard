import { mount } from "enzyme";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import { BrowserRouter, MemoryRouter } from "react-router-dom";

import PanelHeader from "./PanelHeader";

describe("PanelHeader", () => {
  it("Renders the supplied title", () => {
    const title = <div>My Title</div>;
    const wrapper = mount(
      <MemoryRouter
        initialEntries={["/models/user-eggman@external/new-search-aggregate"]}
      >
        <QueryParamProvider adapter={ReactRouter6Adapter}>
          <PanelHeader title={title} />
        </QueryParamProvider>
      </MemoryRouter>
    );
    expect(wrapper.find(".p-panel__title").contains(title)).toBe(true);
  });

  it("Removes all query params when close button clicked", () => {
    window.history.pushState({}, "", "/models?model=cmr&panel=share-model");
    const wrapper = mount(
      <BrowserRouter>
        <QueryParamProvider adapter={ReactRouter6Adapter}>
          <PanelHeader title="Title" />
        </QueryParamProvider>
      </BrowserRouter>
    );
    const searchParams = new URLSearchParams(window.location.search);
    expect(searchParams.get("panel")).toEqual("share-model");
    expect(searchParams.get("model")).toEqual("cmr");
    wrapper.find(".js-aside-close").simulate("click");
    const searchParamsAfterClose = new URLSearchParams(window.location.search);
    expect(searchParamsAfterClose.get("panel")).toEqual(null);
    expect(searchParamsAfterClose.get("model")).toEqual(null);
  });
});
