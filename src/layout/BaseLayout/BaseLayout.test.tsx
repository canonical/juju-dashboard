import { fireEvent, screen, within } from "@testing-library/react";

import type { RootState } from "store/store";
import { configFactory, generalStateFactory } from "testing/factories/general";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import BaseLayout, { Label } from "./BaseLayout";

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

  it("displays the Juju logo under Juju", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          isJuju: true,
        }),
      }),
    });
    renderComponent(
      <BaseLayout>
        <p>foo</p>
      </BaseLayout>,
      { state },
    );
    const logo = screen.getAllByAltText("Juju")[0];
    expect(logo).toHaveAttribute("src", "juju-text.svg");
    expect(screen.getAllByRole("link", { name: "Juju" })[0]).toHaveAttribute(
      "href",
      "https://juju.is",
    );
  });

  it("displays the JAAS logo under JAAS", () => {
    renderComponent(
      <BaseLayout>
        <p>foo</p>
      </BaseLayout>,
    );
    const logo = screen.getAllByAltText("JAAS")[0];
    expect(logo).toHaveAttribute("src", "jaas-text.svg");
    expect(screen.getAllByRole("link", { name: "JAAS" })[0]).toHaveAttribute(
      "href",
      "https://jaas.ai",
    );
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
