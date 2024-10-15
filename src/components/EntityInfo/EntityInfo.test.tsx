import { screen } from "@testing-library/react";
import { vi } from "vitest";

import { renderComponent } from "testing/utils";

import EntityInfo from "./EntityInfo";

vi.mock("components/Topology", () => {
  const Topology = () => <div className="topology"></div>;
  return { default: Topology };
});

describe("Entity info", () => {
  it("renders the expanded topology on click", () => {
    renderComponent(
      <EntityInfo
        data={{
          name: "model1",
          controller: <span>controller1</span>,
          region: "eu1",
        }}
      />,
      {
        path: "/models/:userName/:modelName",
        url: "/models/user-eggman@external/group-test",
      },
    );
    expect(screen.getByText("model1")).toHaveClass("u-truncate");
    expect(screen.getByText("controller1")).not.toHaveClass("u-truncate");
    expect(screen.getByText("eu1")).toHaveClass("u-truncate");
  });
});
