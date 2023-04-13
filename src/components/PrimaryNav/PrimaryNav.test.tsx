import * as versionsAPI from "@canonical/jujulib/dist/api/versions";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

import { configFactory, generalStateFactory } from "testing/factories/general";
import {
  controllerFactory,
  jujuStateFactory,
  modelDataApplicationFactory,
  modelDataFactory,
  modelDataStatusFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";

import PrimaryNav from "./PrimaryNav";

const mockStore = configureStore([]);
describe("Primary Nav", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("applies is-selected state correctly", () => {
    const store = mockStore(rootStateFactory.withGeneralConfig().build());
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/controllers"]}>
          <PrimaryNav />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByRole("link", { name: "Controllers" })).toHaveClass(
      "is-selected"
    );
  });

  it("displays correct number of blocked models", () => {
    const state = rootStateFactory.withGeneralConfig().build({
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelDataFactory.build({
            applications: {
              easyrsa: modelDataApplicationFactory.build({
                status: modelDataStatusFactory.build({
                  status: "blocked",
                }),
              }),
            },
          }),
          def456: modelDataFactory.build({
            applications: {
              cockroachdb: modelDataApplicationFactory.build({
                status: modelDataStatusFactory.build({
                  status: "blocked",
                }),
              }),
            },
          }),
        },
      }),
    });
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <PrimaryNav />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText("2")).toHaveClass("entity-count");
  });

  it("displays the JAAS logo under JAAS", () => {
    const store = mockStore(rootStateFactory.withGeneralConfig().build());
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <PrimaryNav />
        </MemoryRouter>
      </Provider>
    );
    const logo = screen.getByAltText("Juju logo");
    expect(logo).toHaveAttribute("src", "jaas-text.svg");
    expect(logo).toHaveClass("logo__text");
    expect(document.querySelector(".logo")).toHaveAttribute(
      "href",
      "https://jaas.ai"
    );
  });

  it("displays the Juju logo under Juju", () => {
    const store = mockStore(
      rootStateFactory.build({
        general: generalStateFactory.build({
          config: configFactory.build({
            isJuju: true,
          }),
        }),
      })
    );
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <PrimaryNav />
        </MemoryRouter>
      </Provider>
    );
    const logo = screen.getByAltText("Juju logo");
    expect(logo).toHaveAttribute("src", "juju-text.svg");
    expect(logo).toHaveClass("logo__text");
    expect(document.querySelector(".logo")).toHaveAttribute(
      "href",
      "https://juju.is"
    );
  });

  it("displays the version number", () => {
    const store = mockStore(
      rootStateFactory.build({
        general: generalStateFactory.build({
          appVersion: "0.4.0",
          config: configFactory.build(),
        }),
      })
    );
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <PrimaryNav />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText("Version 0.4.0")).toHaveClass("version");
  });

  it("displays the count of the controllers with old versions", () => {
    const store = mockStore(
      rootStateFactory.build({
        general: generalStateFactory.build({
          config: configFactory.build({
            isJuju: true,
          }),
        }),
        juju: jujuStateFactory.build({
          controllers: {
            abc123: [
              controllerFactory.build({
                version: "2.7.0",
                updateAvailable: true,
              }),
            ],
            456: [
              controllerFactory.build({
                version: "2.8.0",
                updateAvailable: false,
              }),
            ],
          },
        }),
      })
    );
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <PrimaryNav />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText("1")).toHaveClass("entity-count");
  });

  it("shows an update available message if there is an update available for the dashboard", async () => {
    jest.spyOn(versionsAPI, "dashboardUpdateAvailable").mockResolvedValue(true);
    const store = mockStore(
      rootStateFactory
        .withGeneralConfig()
        .build({ general: { appVersion: "0.8.0" } })
    );

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <PrimaryNav />
        </MemoryRouter>
      </Provider>
    );
    const notification = await waitFor(() =>
      screen.getByTestId("dashboard-update")
    );
    expect(notification).toBeInTheDocument();
  });

  it("doesn't show an update available message if there is no update available for the dashboard", async () => {
    jest
      .spyOn(versionsAPI, "dashboardUpdateAvailable")
      .mockResolvedValue(false);
    const store = mockStore(
      rootStateFactory
        .withGeneralConfig()
        .build({ general: { appVersion: "9.9.0" } })
    );
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <PrimaryNav />
        </MemoryRouter>
      </Provider>
    );
    const notification = await waitFor(() =>
      screen.queryByTestId("dashboard-update")
    );
    expect(notification).not.toBeInTheDocument();
  });
});
