import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderComponent } from "testing/utils";

import Logo from "./Logo";
import { configFactory, generalStateFactory } from "testing/factories/general";
import { rootStateFactory } from "testing/factories/root";
import BaseLayout from "../../layout/BaseLayout/BaseLayout";
import { HTMLProps } from "react";

describe("Logo", () => {
  it("displays the Juju logo in Juju", () => {
    renderComponent(<Logo isJuju />);
    expect(screen.getAllByAltText("Juju")[1]).toHaveAttribute(
      "src",
      "juju-text.svg",
    );
  });

  it("displays the JAAS logo in JAAS", () => {
    renderComponent(<Logo />);
    expect(screen.getAllByAltText("JAAS")[1]).toHaveAttribute(
      "src",
      "jaas-text.svg",
    );
  });

  it("displays the dark text in Juju", () => {
    renderComponent(<Logo dark isJuju />);
    expect(screen.getAllByAltText("Juju")[1]).toHaveAttribute(
      "src",
      "juju-text-dark.svg",
    );
  });

  it("displays the dark text in JAAS", () => {
    renderComponent(<Logo dark />);
    expect(screen.getAllByAltText("JAAS")[1]).toHaveAttribute(
      "src",
      "jaas-text-dark.svg",
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
