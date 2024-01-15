import { fireEvent, render, screen } from "@testing-library/react";

import defaultCharmIcon from "static/images/icons/default-charm-icon.svg";

import CharmIcon from "./CharmIcon";

describe("CharmIcon", () => {
  it("can display an image", () => {
    render(<CharmIcon name="etcd" charmId="cs:etcd-charm-1" />);
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://charmhub.io/etcd-charm/icon",
    );
  });

  it("handles local charms", () => {
    render(<CharmIcon name="etcd" charmId="local:etcd-charm-1" />);
    expect(screen.getByRole("img")).toHaveAttribute("src", defaultCharmIcon);
  });

  it("handles errors fetching the image", () => {
    render(<CharmIcon name="etcd" charmId="cs:etcd-charm-1" />);
    const icon = screen.getByRole("img");
    expect(icon).not.toHaveAttribute("src", defaultCharmIcon);
    fireEvent.error(icon);
    expect(icon).toHaveAttribute("src", defaultCharmIcon);
  });
});
