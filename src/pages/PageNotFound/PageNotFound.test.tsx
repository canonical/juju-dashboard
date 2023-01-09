import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import dataDump from "testing/complete-redux-store-dump";

import { Routes } from "components/Routes/Routes";
import { Label } from "./PageNotFound";
import { TestId } from "../../layout/BaseLayout/BaseLayout";

const mockStore = configureStore([]);

describe("PageNotFound page", () => {
  it("should display when unknown route is accessed", () => {
    const store = mockStore(dataDump);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/foobar11"]}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes />
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText(Label.NOT_FOUND)).toBeInTheDocument();
    // Ensure only one route is rendered
    expect(screen.getAllByTestId(TestId.MAIN)).toHaveLength(1);
  });
});
