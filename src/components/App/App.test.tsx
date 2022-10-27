import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import * as reactRouterDOM from "react-router-dom";
import { render } from "@testing-library/react";

import App from "./App";

import dataDump from "../../testing/complete-redux-store-dump";

jest.mock("react-router-dom", () => ({
  BrowserRouter: jest.fn(),
}));

const mockStore = configureStore([]);

describe("App", () => {
  it.only("properly sets up Router", () => {
    const BrowserRouterSpy = jest
      .spyOn(reactRouterDOM, "BrowserRouter")
      .mockImplementation(() => <div></div>);
    const store = mockStore(dataDump);
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    expect(BrowserRouterSpy.mock.calls[0][0].basename).toBe("/");
  });
});
