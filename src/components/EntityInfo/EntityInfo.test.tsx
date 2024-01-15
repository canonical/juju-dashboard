import { screen } from "@testing-library/react";

import { renderComponent } from "testing/utils";

import EntityInfo from "./EntityInfo";

jest.mock("components/Topology/Topology", () => {
  const Topology = () => <div className="topology"></div>;
  return Topology;
});

describe("Entity info", () => {
  it("renders the expanded topology on click", () => {
    renderComponent(
      <EntityInfo
        data={{
          name: "model1",
          controller: "controller1",
          region: "eu1",
        }}
      />,
      {
        path: "/models/:userName/:modelName",
        url: "/models/user-eggman@external/group-test",
      },
    );
    expect(screen.getByText("eu1")).toHaveAttribute("data-name", "region");
  });
});
