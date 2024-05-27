import { screen } from "@testing-library/react";
import type { HTMLProps } from "react";

import { renderComponent } from "testing/utils";

import Logo from "./Logo";

describe("Logo", () => {
  it("displays the Juju logo in Juju", () => {
    renderComponent(<Logo isJuju />);
    expect(
      screen
        .getAllByAltText("Juju")[1]
        .getAttribute("src")
        ?.endsWith("juju-text.svg"),
    ).toBe(true);
  });

  it("displays the JAAS logo in JAAS", () => {
    renderComponent(<Logo />);
    expect(
      screen
        .getAllByAltText("JAAS")[1]
        .getAttribute("src")
        ?.endsWith("jaas-text.svg"),
    ).toBe(true);
  });

  it("displays the dark text in Juju", () => {
    renderComponent(<Logo dark isJuju />);
    expect(
      screen
        .getAllByAltText("Juju")[1]
        .getAttribute("src")
        ?.endsWith("juju-text-dark.svg"),
    ).toBe(true);
  });

  it("displays the dark text in JAAS", () => {
    renderComponent(<Logo dark />);
    expect(
      screen
        .getAllByAltText("JAAS")[1]
        .getAttribute("src")
        ?.endsWith("jaas-text-dark.svg"),
    ).toBe(true);
  });

  it("can display using a custom component", () => {
    renderComponent(
      <Logo<HTMLProps<HTMLLinkElement>>
        component="a"
        href="http://example.com"
      />,
    );
    expect(screen.getByRole("link", { name: /JAAS/ })).toHaveAttribute(
      "href",
      "http://example.com",
    );
  });
});
