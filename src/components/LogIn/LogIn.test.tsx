import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { render, screen, within } from "@testing-library/react";

import { configFactory, generalStateFactory } from "testing/factories/general";
import { rootStateFactory } from "testing/factories/root";

import LogIn from "./LogIn";

const mockStore = configureStore([]);

describe("LogIn", () => {
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
});
