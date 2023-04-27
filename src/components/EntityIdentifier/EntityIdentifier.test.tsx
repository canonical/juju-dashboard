import { render, screen } from "@testing-library/react";

import EntityIdentifier from "./EntityIdentifier";

describe("EntityIdentifier", () => {
  it("can display name only", () => {
    render(<EntityIdentifier name="etcd" />);
    expect(screen.getAllByText("etcd").length > 0).toBe(true);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(document.querySelector(".subordinate")).not.toBeInTheDocument();
  });

  it("can handle subordinates", () => {
    render(<EntityIdentifier name="etcd" subordinate />);
    expect(document.querySelector(".subordinate")).toBeInTheDocument();
  });

  it("can display an icon", () => {
    render(<EntityIdentifier name="etcd" charmId="cs:etcd-2" />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });
});
