import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import dataDump from "testing/complete-redux-store-dump";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";

import ModelsIndex from "./ModelsIndex";

const mockStore = configureStore([]);

describe("Models Index page", () => {
  it("renders without crashing", () => {
    const store = mockStore(dataDump);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <ModelsIndex />
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(document.querySelector(".header")).toBeInTheDocument();
    expect(screen.getAllByRole("grid")).toHaveLength(3);
    expect(document.querySelector(".chip-group")).toBeInTheDocument();
  });

  it("displays correct grouping view", async () => {
    const store = mockStore(dataDump);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <ModelsIndex />
          </QueryParamProvider>
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByRole("button", { name: "view by status" })).toHaveClass(
      "is-selected"
    );
    const ownerButton = screen.getByRole("button", { name: "view by owner" });
    await userEvent.click(ownerButton);
    expect(ownerButton).toHaveClass("is-selected");
    const searchParams = new URLSearchParams(window.location.search);
    expect(searchParams.get("groupedby")).toEqual("owner");
    expect(document.querySelector(".owners-group")).toBeInTheDocument();
  });

  it("should display the correct window title", () => {
    const store = mockStore(dataDump);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <ModelsIndex />
          </QueryParamProvider>
        </BrowserRouter>
      </Provider>
    );
    const pageTitle = document.title;
    expect(pageTitle).toEqual("Models | Juju Dashboard");
  });
});
