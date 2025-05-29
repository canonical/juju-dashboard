import { fireEvent, screen, within } from "@testing-library/react";

import { renderComponent } from "testing/utils";

import BaseLayout from "./BaseLayout";
import { Label } from "./types";

describe("Base Layout", () => {
  it("renders with a sidebar", () => {
    renderComponent(<BaseLayout />);
    expect(document.querySelector(".l-navigation")).toBeInTheDocument();
  });

  it("should display the children", () => {
    renderComponent(<BaseLayout />, {
      routeChildren: [
        {
          path: "",
          element: <div data-testid="main-children">App content</div>,
        },
      ],
    });
    const main = screen.getByTestId("main-children");
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
});
