import { screen } from "@testing-library/react";

import { renderComponent } from "testing/utils";
import urls from "urls";

import ModelDetailsLink from "./ModelDetailsLink";

describe("ModelDetailsLink", () => {
  it("returns the label if there is no owner", () => {
    renderComponent(
      <ModelDetailsLink modelName="test-model">Test Model</ModelDetailsLink>
    );
    expect(screen.getByText("Test Model")).toBeInTheDocument();
  });

  it("can link to a model", () => {
    renderComponent(
      <ModelDetailsLink modelName="test-model" ownerTag="user-eggman">
        Test Model
      </ModelDetailsLink>
    );
    expect(screen.getByRole("link", { name: "Test Model" })).toHaveAttribute(
      "href",
      urls.model.index({
        userName: "eggman",
        modelName: "test-model",
      })
    );
  });

  it("can link to a tab", () => {
    renderComponent(
      <ModelDetailsLink
        modelName="test-model"
        ownerTag="user-eggman"
        view="apps"
      >
        Test Model
      </ModelDetailsLink>
    );
    expect(screen.getByRole("link", { name: "Test Model" })).toHaveAttribute(
      "href",
      urls.model.tab({
        userName: "eggman",
        modelName: "test-model",
        tab: "apps",
      })
    );
  });
});
