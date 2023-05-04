import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import { thunks as appThunks } from "store/app";
import { actions as generalActions } from "store/general";
import { configFactory, generalStateFactory } from "testing/factories/general";
import { rootStateFactory } from "testing/factories/root";

import LogIn from "./LogIn";

const mockStore = configureStore([]);

describe("LogIn", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders a 'connecting' message while connecting", () => {
    const store = mockStore(
      rootStateFactory.build({
        general: generalStateFactory.build({
          config: configFactory.build({
            identityProviderAvailable: true,
          }),
        }),
      })
    );
    render(
      <Provider store={store}>
        <LogIn>App content</LogIn>
      </Provider>
    );
    expect(
      within(screen.getByRole("button")).getByText("Connecting...")
    ).toBeInTheDocument();
    const content = screen.getByText("App content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass("app-content");
  });

  it("renders an IdentityProvider login UI if the user is not logged in", () => {
    const store = mockStore(
      rootStateFactory.build({
        general: generalStateFactory.build({
          visitURL: "I am a url",
          config: configFactory.build({
            identityProviderAvailable: true,
          }),
        }),
      })
    );
    render(
      <Provider store={store}>
        <LogIn>App content</LogIn>
      </Provider>
    );
    expect(screen.getByRole("link")).toHaveTextContent(
      "Log in to the dashboard"
    );
    const content = screen.getByText("App content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass("app-content");
  });

  it("renders a UserPass login UI if the user is not logged in", () => {
    const store = mockStore(
      rootStateFactory.build({
        general: generalStateFactory.build({
          config: configFactory.build({
            identityProviderAvailable: false,
          }),
        }),
      })
    );
    render(
      <Provider store={store}>
        <LogIn>App content</LogIn>
      </Provider>
    );
    expect(screen.getByRole("button")).toHaveTextContent(
      "Log in to the dashboard"
    );
    const content = screen.getByText("App content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass("app-content");
  });

  it("renders a login error if one exists", () => {
    const store = mockStore(
      rootStateFactory.build({
        general: generalStateFactory.build({
          loginError: "Invalid user name",
          config: configFactory.build({
            identityProviderAvailable: false,
          }),
        }),
      })
    );
    render(
      <Provider store={store}>
        <LogIn>App content</LogIn>
      </Provider>
    );
    const error = screen.getByText("Invalid user name");
    expect(error).toBeInTheDocument();
    expect(error).toHaveClass("error-message");
  });

  it("logs in", async () => {
    // Mock the result of the thunk to be a normal action so that it can be tested
    // for. This is necessary because we don't have a full store set up which
    // can dispatch thunks (and we don't need to handle the thunk, just know it
    // was dispatched).
    jest
      .spyOn(appThunks, "connectAndStartPolling")
      .mockImplementation(
        jest.fn().mockReturnValue({ type: "connectAndStartPolling" })
      );
    const store = mockStore(
      rootStateFactory.build({
        general: generalStateFactory.build({
          config: configFactory.build({
            identityProviderAvailable: false,
          }),
        }),
      })
    );
    render(
      <Provider store={store}>
        <LogIn>App content</LogIn>
      </Provider>
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Username" }),
      "eggman"
    );
    await userEvent.type(screen.getByLabelText("Password"), "verysecure123");
    await userEvent.click(screen.getByRole("button"));
    const actions = store.getActions();
    const storeAction = generalActions.storeUserPass({
      wsControllerURL: "wss://controller.example.com",
      credential: { user: "eggman", password: "verysecure123" },
    });
    expect(
      actions.find((action) => action.type === storeAction.type)
    ).toStrictEqual(storeAction);
    expect(
      actions.find(
        (action) => action.type === generalActions.cleanupLoginErrors().type
      )
    ).toBeTruthy();
    expect(
      actions.find((action) => action.type === "connectAndStartPolling")
    ).toBeTruthy();
  });
});
