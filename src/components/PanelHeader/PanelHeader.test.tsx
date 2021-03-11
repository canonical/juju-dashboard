import { mount } from "enzyme";
import { QueryParamProvider } from "use-query-params";
import { MemoryRouter, Route } from "react-router";

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
});
