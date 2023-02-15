import { act, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import configureStore from "redux-mock-store";
import { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { generalStateFactory } from "testing/factories/general";
import {
  charmApplicationFactory,
  charmInfoFactory,
} from "testing/factories/juju/Charms";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import CharmsPanel from "./ChamsPanel";

const mockStore = configureStore([]);

describe("CharmsPanel", () => {
  let storeData: RootState;

  beforeEach(() => {
    storeData = rootStateFactory.build({
      general: generalStateFactory.build({}),
      juju: jujuStateFactory.build(
        {},
        {
          transient: {
            charms: [
              charmInfoFactory.build(),
              charmInfoFactory.build({
                meta: { name: "Redis k8s" },
                url: "ch:amd64/focal/redis-k8s",
              }),
            ],
            selectedApplications: [
              charmApplicationFactory.build(),
              charmApplicationFactory.build({
                "charm-url": "ch:amd64/focal/redis-k8s",
              }),
            ],
          },
        }
      ),
    });
  });
  function generateComponent() {
    const store = mockStore(storeData);
    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={["/models/admin/tests?panel=choose-charm"]}
        >
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route
                path="/models/:userName/:modelName"
                element={<CharmsPanel />}
              />
            </Routes>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
  }
  it("renders the correct number of charms", () => {
    generateComponent();
    expect(screen.getAllByRole("radio").length).toBe(2);
  });

  it("next button is disabled when no charm is selected", () => {
    generateComponent();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("next button is enabled when a charm is selected", () => {
    generateComponent();
    act(() => screen.getAllByRole("radio")[0].click());
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });
});
