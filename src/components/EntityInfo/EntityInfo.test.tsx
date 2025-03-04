import { screen } from "@testing-library/react";

import { renderComponent } from "testing/utils";

import EntityInfo from "./EntityInfo";

describe("Entity info", () => {
  it("renders the data", () => {
    renderComponent(
      <EntityInfo
        data={{
          name: "model1",
          controller: <span>controller1</span>,
          region: "eu1",
        }}
      />,
    );
    expect(screen.getByText("model1")).toHaveClass("u-truncate");
    expect(screen.getByText("controller1")).not.toHaveClass("u-truncate");
    expect(screen.getByText("eu1")).toHaveClass("u-truncate");
  });

  it("renders empty data", () => {
    const {
      result: { container },
    } = renderComponent(<EntityInfo data={{}} />);
    expect(container.querySelector(".entity-info__grid")).toBeEmptyDOMElement();
  });
});
