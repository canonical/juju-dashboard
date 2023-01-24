import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import * as reactRouterDOM from "react-router-dom";
import { render } from "@testing-library/react";

import { rootStateFactory } from "testing/factories/root";

import App from "./App";

jest.mock("react-router-dom", () => ({
  BrowserRouter: jest.fn(),
}));

const mockStore = configureStore([]);

describe("App", () => {
  it("properly sets up Router", () => {
    const BrowserRouterSpy = jest
      .spyOn(reactRouterDOM, "BrowserRouter")
      .mockImplementation(() => <div></div>);
    const store = mockStore(rootStateFactory.withGeneralConfig().build());
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    expect(BrowserRouterSpy.mock.calls[0][0].basename).toBe("/");
  });
});
