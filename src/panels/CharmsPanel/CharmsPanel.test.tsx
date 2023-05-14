import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import configureStore from "redux-mock-store";

import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { generalStateFactory } from "testing/factories/general";
import {
  charmApplicationFactory,
  charmInfoFactory,
} from "testing/factories/juju/Charms";

import CharmsPanel from "./CharmsPanel";

const mockStore = configureStore([]);

describe("CharmsPanel", () => {
  let storeData: RootState;

  beforeEach(() => {
    storeData = rootStateFactory.build({
      general: generalStateFactory.build({}),
      juju: jujuStateFactory.build({
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
      }),
    });
  });
  function generateComponent() {
    const store = mockStore(storeData);
    window.history.pushState({}, "", "/models/admin/tests?panel=choose-charm");
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<CharmsPanel />} />
          </Routes>
        </BrowserRouter>
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

  it("can open the actions panel", async () => {
    generateComponent();
    await userEvent.click(screen.getAllByRole("radio")[0]);
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(window.location.search).toBe(
      "?panel=charm-actions&charm=ch%3Aamd64%2Ffocal%2Fpostgresql-k8s-20"
    );
  });
});
