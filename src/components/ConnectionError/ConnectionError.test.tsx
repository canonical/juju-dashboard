import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import { rootStateFactory } from "testing/factories/root";

import ConnectionError from "./ConnectionError";

const mockStore = configureStore();

describe("ConnectionError", () => {
  let reload: Location["reload"];

  beforeEach(() => {
    reload = window.location.reload;
    Object.defineProperty(window, "location", {
      value: { reload: jest.fn() },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: { reload },
    });
  });

  it("displays connection errors", () => {
    const state = rootStateFactory
      .withGeneralConfig()
      .build({ general: { connectionError: "Can't connect" } });
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <ConnectionError />
      </Provider>
    );
    expect(screen.getByText(/Can't connect/)).toBeInTheDocument();
  });

  it("can refresh the window", async () => {
    const state = rootStateFactory
      .withGeneralConfig()
      .build({ general: { connectionError: "Can't connect" } });
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <ConnectionError />
      </Provider>
    );
    await userEvent.click(screen.getByRole("button", { name: "refreshing" }));
    expect(window.location.reload).toHaveBeenCalled();
  });
});
