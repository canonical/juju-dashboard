import { screen } from "@testing-library/react";
import type { HTMLProps } from "react";

import { renderComponent } from "testing/utils";

import Logo from "./Logo";
import { TEXT } from "./text";

describe("Logo", () => {
  it("displays the Juju logo in Juju", () => {
    renderComponent(<Logo isJuju />);
    expect(screen.getAllByAltText("Juju")[1].getAttribute("src")).toBe(
      TEXT.light.juju,
    );
  });

  it("displays the JAAS logo in JAAS", () => {
    renderComponent(<Logo />);
    expect(screen.getAllByAltText("JAAS")[1].getAttribute("src")).toBe(
      TEXT.light.jaas,
    );
  });

  it("displays the dark text in Juju", () => {
    renderComponent(<Logo dark isJuju />);
    expect(screen.getAllByAltText("Juju")[1].getAttribute("src")).toBe(
      TEXT.dark.juju,
    );
  });

  it("displays the dark text in JAAS", () => {
    renderComponent(<Logo dark />);
    expect(screen.getAllByAltText("JAAS")[1].getAttribute("src")).toBe(
      TEXT.dark.jaas,
    );
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
