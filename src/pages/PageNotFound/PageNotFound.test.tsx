import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import Routes from "components/Routes";
import { BaseLayoutTestId } from "layout/BaseLayout";
import { rootStateFactory } from "testing/factories/root";
import { changeURL } from "testing/utils";

import { Label } from "./types";

const mockStore = configureStore([]);

describe("PageNotFound page", () => {
  it("should display when unknown route is accessed", () => {
    const store = mockStore(rootStateFactory.withGeneralConfig().build());
    changeURL("/unknown");
    render(
      <Provider store={store}>
        <Routes />
      </Provider>,
    );
    expect(screen.getByText(Label.NOT_FOUND)).toBeInTheDocument();
    // Ensure only one route is rendered
    expect(screen.getAllByTestId(BaseLayoutTestId.MAIN)).toHaveLength(1);
  });
});
