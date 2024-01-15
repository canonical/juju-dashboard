import * as versionsAPI from "@canonical/jujulib/dist/api/versions";
import { screen, waitFor, within } from "@testing-library/react";

import { configFactory, generalStateFactory } from "testing/factories/general";
import {
  controllerFeaturesFactory,
  controllerFeaturesStateFactory,
} from "testing/factories/general";
import { detailedStatusFactory } from "testing/factories/juju/ClientV6";
import {
  controllerFactory,
  jujuStateFactory,
  modelDataApplicationFactory,
  modelDataFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import PrimaryNav, { Label } from "./PrimaryNav";

describe("Primary Nav", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("displays correct number of blocked models", () => {
    const state = rootStateFactory.withGeneralConfig().build({
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelDataFactory.build({
            applications: {
              easyrsa: modelDataApplicationFactory.build({
                status: detailedStatusFactory.build({
                  status: "blocked",
                }),
              }),
            },
          }),
          def456: modelDataFactory.build({
            applications: {
              cockroachdb: modelDataApplicationFactory.build({
                status: detailedStatusFactory.build({
                  status: "blocked",
                }),
              }),
            },
          }),
        },
      }),
    });
    renderComponent(<PrimaryNav />, { state });
    expect(screen.getByText("2")).toHaveClass("entity-count");
  });

  it("displays the version number", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.build({
        appVersion: "0.4.0",
        config: configFactory.build(),
      }),
    });
    renderComponent(<PrimaryNav />, { state });
    expect(screen.getByText("Version 0.4.0")).toHaveClass("version");
  });

  it("displays an icon if controllers require authentication", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.build({
        visitURLs: ["/login"],
      }),
    });
    renderComponent(<PrimaryNav />, { state });
    expect(
      within(screen.getByRole("link", { name: "Controllers" })).getByTitle(
        "Authentication required",
      ),
    ).toBeInTheDocument();
  });

  it("displays the count of the controllers with old versions", () => {
    const state = rootStateFactory.build({
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
    });
    renderComponent(<PrimaryNav />, { state });
    expect(screen.getByText("1")).toHaveClass("entity-count");
  });

  it("shows an update available message if there is an update available for the dashboard", async () => {
    jest.spyOn(versionsAPI, "dashboardUpdateAvailable").mockResolvedValue(true);
    const state = rootStateFactory
      .withGeneralConfig()
      .build({ general: { appVersion: "0.8.0" } });

    renderComponent(<PrimaryNav />, { state });
    const notification = await waitFor(() =>
      screen.getByTestId("dashboard-update"),
    );
    expect(notification).toBeInTheDocument();
  });

  it("doesn't show an update available message if there is no update available for the dashboard", async () => {
    jest
      .spyOn(versionsAPI, "dashboardUpdateAvailable")
      .mockResolvedValue(false);
    const state = rootStateFactory
      .withGeneralConfig()
      .build({ general: { appVersion: "9.9.0" } });
    renderComponent(<PrimaryNav />, { state });
    const notification = await waitFor(() =>
      screen.queryByTestId("dashboard-update"),
    );
    expect(notification).not.toBeInTheDocument();
  });

  it("handles no update response", async () => {
    jest
      .spyOn(versionsAPI, "dashboardUpdateAvailable")
      .mockRejectedValue(new Error());
    const state = rootStateFactory
      .withGeneralConfig()
      .build({ general: { appVersion: "9.9.0" } });
    renderComponent(<PrimaryNav />, { state });
    const notification = await waitFor(() =>
      screen.queryByTestId("dashboard-update"),
    );
    expect(notification).not.toBeInTheDocument();
  });

  it("should have all navigation links", () => {
    renderComponent(<PrimaryNav />);
    expect(screen.getByRole("link", { name: "Models" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Controllers" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Report a bug" }),
    ).toBeInTheDocument();
  });

  it("should not show LogsLink navigation button under Juju", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          isJuju: true,
        }),
      }),
    });
    renderComponent(<PrimaryNav />, { state });
    expect(
      screen.queryByRole("link", { name: Label.LOGS }),
    ).not.toBeInTheDocument();
  });

  it("should show LogsLink navigation button if the controller supports it", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://controller.example.com",
          isJuju: false,
        }),
        controllerFeatures: controllerFeaturesStateFactory.build({
          "wss://controller.example.com": controllerFeaturesFactory.build({
            auditLogs: true,
          }),
        }),
      }),
    });
    renderComponent(<PrimaryNav />, { state });
    expect(screen.getByRole("link", { name: Label.LOGS })).toBeInTheDocument();
  });

  it("should not show Advanced search navigation button under Juju", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://controller.example.com",
          isJuju: true,
        }),
        controllerFeatures: controllerFeaturesStateFactory.build({
          "wss://controller.example.com": controllerFeaturesFactory.build({
            crossModelQueries: true,
          }),
        }),
      }),
    });
    renderComponent(<PrimaryNav />, { state });
    expect(
      screen.queryByRole("link", { name: Label.ADVANCED_SEARCH }),
    ).not.toBeInTheDocument();
  });

  it("should show Advanced search navigation button if the controller supports it", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://controller.example.com",
          isJuju: false,
        }),
        controllerFeatures: controllerFeaturesStateFactory.build({
          "wss://controller.example.com": controllerFeaturesFactory.build({
            crossModelQueries: true,
          }),
        }),
      }),
    });
    renderComponent(<PrimaryNav />, { state });
    expect(
      screen.getByRole("link", { name: Label.ADVANCED_SEARCH }),
    ).toBeInTheDocument();
  });
});
