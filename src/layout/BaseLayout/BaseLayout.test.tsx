import { fireEvent, screen, within } from "@testing-library/react";
import ReactGA from "react-ga4";
import { vi } from "vitest";

import { configFactory, generalStateFactory } from "testing/factories/general";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent, changeURL, wrapComponent } from "testing/utils";

import BaseLayout from "./BaseLayout";
import { Label } from "./types";

describe("Base Layout", () => {
  it("renders with a sidebar", () => {
    renderComponent(<BaseLayout />);
    expect(document.querySelector(".l-navigation")).toBeInTheDocument();
  });

  it("should display the children", () => {
    const TEST_ID = "main-children";
    renderComponent(<BaseLayout />, {
      routeChildren: [
        {
          path: "",
          element: <div data-testid={TEST_ID}>App content</div>,
        },
      ],
    });
    const main = screen.getByTestId(TEST_ID);
    expect(within(main).getByText("App content")).toBeInTheDocument();
  });

  it("displays a message if the dashboard is offline", () => {
    renderComponent(<BaseLayout />, {
      routeChildren: [{ path: "", element: <>App content</> }],
    });
    fireEvent.offline(window);
    expect(screen.getByText(Label.OFFLINE)).toBeInTheDocument();
  });

  it("displays a message if the dashboard comes back online", () => {
    renderComponent(<BaseLayout />, {
      routeChildren: [{ path: "", element: <>App content</> }],
    });
    fireEvent.online(window);
    expect(
      screen.getByText(/Your dashboard is now back online/),
    ).toBeInTheDocument();
  });

  it("sends path change events", async () => {
    vi.stubEnv("PROD", true);
    const pageviewSpy = vi.spyOn(ReactGA, "send");
    const state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          analyticsEnabled: true,
        }),
      }),
    });
    const {
      result: { rerender },
    } = renderComponent(<BaseLayout />, { state });
    changeURL("/new/path");
    // Force the component to rerender so the useEffect runs.
    const { Component } = wrapComponent(<BaseLayout />, {
      state,
    });
    rerender(<Component />);
    expect(pageviewSpy).toHaveBeenCalledWith({
      controllerVersion: "",
      dashboardVersion: "",
      hitType: "pageview",
      isJuju: "false",
      page: "/new/path",
    });
  });
});
