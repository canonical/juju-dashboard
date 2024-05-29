import { fireEvent, screen, within } from "@testing-library/react";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import BaseLayout from "./BaseLayout";
import { Label } from "./types";

describe("Base Layout", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.withGeneralConfig().build();
  });

  it("renders with a sidebar", () => {
    renderComponent(
      <BaseLayout>
        <p>foo</p>
      </BaseLayout>,
      { state },
    );
    expect(document.querySelector(".l-navigation")).toBeInTheDocument();
  });

  it("should display the children", () => {
    renderComponent(
      <BaseLayout>
        <p>foo</p>
      </BaseLayout>,
      { state },
    );
    const main = screen.getByTestId("main-children");
    expect(within(main).getByText("foo")).toBeInTheDocument();
  });

  it("displays a message if the dashboard is offline", () => {
    renderComponent(
      <BaseLayout>
        <p>foo</p>
      </BaseLayout>,
      { state, path: "/models", url: "/models/" },
    );
    fireEvent.offline(window);
    expect(screen.getByText(Label.OFFLINE)).toBeInTheDocument();
  });

  it("displays a message if the dashboard comes back on line", () => {
    renderComponent(
      <BaseLayout>
        <p>foo</p>
      </BaseLayout>,
      { state, path: "/models", url: "/models/" },
    );
    fireEvent.online(window);
    expect(
      screen.getByText(/Your dashboard is now back online/),
    ).toBeInTheDocument();
  });
});
