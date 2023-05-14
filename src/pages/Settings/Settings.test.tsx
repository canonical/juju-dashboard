import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

import { rootStateFactory } from "testing/factories";

import Settings, { Label, DISABLE_ANALYTICS_KEY } from "./Settings";

const mockStore = configureStore();

describe("Settings", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("restores the analytics setting", async () => {
    const store = mockStore(rootStateFactory.build());
    localStorage.setItem(DISABLE_ANALYTICS_KEY, JSON.stringify("true"));
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      </Provider>
    );
    expect(
      screen.getByRole("switch", { name: Label.DISABLE_TOGGLE })
    ).toBeChecked();
  });

  it("can update the analytics setting", async () => {
    const store = mockStore(rootStateFactory.build());
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      </Provider>
    );
    expect(localStorage.getItem(DISABLE_ANALYTICS_KEY)).toBeNull();
    await userEvent.click(
      screen.getByRole("switch", { name: Label.DISABLE_TOGGLE })
    );
    expect(JSON.parse(localStorage.getItem(DISABLE_ANALYTICS_KEY) ?? "")).toBe(
      true
    );
  });
});
