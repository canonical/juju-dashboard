import { mount } from "enzyme";
import { QueryParamProvider } from "use-query-params";
import { MemoryRouter, Router, Route } from "react-router";
import { createMemoryHistory } from "history";

import PanelHeader from "./PanelHeader";

describe("PanelHeader", () => {
  it("Renders the supplied title", () => {
    const title = <div>My Title</div>;
    const wrapper = mount(
      <MemoryRouter
        initialEntries={["/models/user-eggman@external/new-search-aggregate"]}
      >
        <QueryParamProvider ReactRouterRoute={Route}>
          <PanelHeader title={title} />
        </QueryParamProvider>
      </MemoryRouter>
    );
    expect(wrapper.find(".p-panel__title").contains(title)).toBe(true);
  });

  it("Removes all query params when close button clicked", () => {
    const history = createMemoryHistory();
    history.push("/models?model=cmr&panel=share-model");

    const wrapper = mount(
      <Router history={history}>
        <QueryParamProvider ReactRouterRoute={Route}>
          <PanelHeader title="Title" />
        </QueryParamProvider>
      </Router>
    );
    const searchParams = new URLSearchParams(history.location.search);
    expect(searchParams.get("panel")).toEqual("share-model");
    expect(searchParams.get("model")).toEqual("cmr");
    wrapper.find(".js-aside-close").simulate("click");
    const searchParamsAfterClose = new URLSearchParams(history.location.search);
    expect(searchParamsAfterClose.get("panel")).toEqual(null);
    expect(searchParamsAfterClose.get("model")).toEqual(null);
  });
});
