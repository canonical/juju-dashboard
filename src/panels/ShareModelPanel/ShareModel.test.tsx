import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import dataDump from "testing/complete-redux-store-dump";

import ShareModel from "./ShareModel";

const mockStore = configureStore([]);

describe("Share Model Panel", () => {
  it("should show panel", () => {
    const store = mockStore(dataDump);
    render(
      <MemoryRouter initialEntries={["/models/eggman@external/hadoopspark"]}>
        <Provider store={store}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route
                path="/models/:userName/:modelName"
                element={<ShareModel />}
              />
            </Routes>
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    expect(
      screen.getByRole("heading", { name: "Sharing with:" })
    ).toBeInTheDocument();
  });

  it("should show small screen view toggles", async () => {
    const store = mockStore(dataDump);
    render(
      <MemoryRouter initialEntries={["/models/eggman@external/hadoopspark"]}>
        <Provider store={store}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route
                path="/models/:userName/:modelName"
                element={<ShareModel />}
              />
            </Routes>
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    const addNewUserButton = screen.getByRole("button", {
      name: "Add new user",
    });
    expect(addNewUserButton).toBeInTheDocument();
    await userEvent.click(addNewUserButton);
    const backToCardsButton = screen.getByRole("button", {
      name: "Back",
    });
    expect(backToCardsButton).toBeInTheDocument();
  });
});
