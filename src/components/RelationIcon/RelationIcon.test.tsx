import { render, screen } from "@testing-library/react";

import { modelDataApplicationFactory } from "testing/factories/juju/juju";

import RelationIcon from "./RelationIcon";

describe("RelationIcon", () => {
  it("displays an image", () => {
    render(
      <RelationIcon
        applicationName="etcd"
        applications={{
          etcd: modelDataApplicationFactory.build({
            charm: "cs:etcd-charm-1",
          }),
        }}
      />,
    );
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://charmhub.io/etcd-charm/icon",
    );
  });

  it("handles no application", () => {
    render(<RelationIcon applicationName="etcd" applications={{}} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
