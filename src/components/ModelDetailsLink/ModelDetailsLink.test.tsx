import { screen } from "@testing-library/react";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";
import urls from "urls";
import { ModelTab } from "urls";

import ModelDetailsLink from "./ModelDetailsLink";

describe("ModelDetailsLink", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build();
  });

  it("returns the label if there is no owner", () => {
    renderComponent(
      <ModelDetailsLink modelName="test-model">Test Model</ModelDetailsLink>,
      { state },
    );
    expect(screen.getByText("Test Model")).toBeInTheDocument();
  });

  it("can fetch the model name and user when passed a uuid", () => {
    state.juju.models = {
      abc123: modelListInfoFactory.build({
        uuid: "abc123",
        name: "test-model",
        ownerTag: "user-eggman@external",
      }),
    };
    renderComponent(
      <ModelDetailsLink replaceLabel uuid="abc123">
        Test Model
      </ModelDetailsLink>,
      { state },
    );
    expect(
      screen.getByRole("link", { name: "eggman@external/test-model" }),
    ).toBeInTheDocument();
  });

  it("can link to a model", () => {
    renderComponent(
      <ModelDetailsLink modelName="test-model" ownerTag="user-eggman">
        Test Model
      </ModelDetailsLink>,
      { state },
    );
    expect(screen.getByRole("link", { name: "Test Model" })).toHaveAttribute(
      "href",
      urls.model.index({
        userName: "eggman",
        modelName: "test-model",
      }),
    );
  });

  it("can link to a tab", () => {
    renderComponent(
      <ModelDetailsLink
        modelName="test-model"
        ownerTag="user-eggman"
        view={ModelTab.APPS}
      >
        Test Model
      </ModelDetailsLink>,
      { state },
    );
    expect(screen.getByRole("link", { name: "Test Model" })).toHaveAttribute(
      "href",
      urls.model.tab({
        userName: "eggman",
        modelName: "test-model",
        tab: ModelTab.APPS,
      }),
    );
  });
});
