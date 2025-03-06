import { screen } from "@testing-library/react";

import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";
import urls from "urls";

import Label from "./Label";
import { getTab } from "./utils";

describe("Label", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.withGeneralConfig().build({
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            name: "test-model",
            ownerTag: "user-eggman@external",
          }),
        },
      }),
    });
  });

  it("should display '[none]:' if invalid key path is passed", () => {
    renderComponent(<Label keyPath={[]} />);
    expect(screen.getByText("[none]:")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("should display results model link for a model UUID", () => {
    renderComponent(<Label keyPath={["abc123"]} />, { state });
    const link = screen.getByRole("link", {
      name: "eggman@external/test-model",
    });
    expect(link).toHaveAttribute(
      "href",
      urls.model.index({
        userName: "eggman@external",
        modelName: "test-model",
      }),
    );
    expect(link).toHaveAttribute("title", "UUID: abc123");
  });

  it("should display unit link for a link", () => {
    renderComponent(
      <Label
        keyPath={[
          "easyrsa/0",
          "units",
          "application_0",
          "applications",
          0,
          "abc123",
        ]}
      />,
      { state },
    );
    expect(screen.getByRole("link", { name: "easyrsa/0:" })).toHaveAttribute(
      "href",
      urls.model.unit({
        userName: "eggman@external",
        modelName: "test-model",
        appName: "easyrsa",
        unitId: "easyrsa-0",
      }),
    );
  });

  it("should display machine link for a machine", () => {
    renderComponent(
      <Label
        keyPath={[
          "easyrsa/0",
          "units",
          "application_0",
          "applications",
          0,
          "abc123",
        ]}
      />,
      { state },
    );
    expect(screen.getByRole("link", { name: "easyrsa/0:" })).toHaveAttribute(
      "href",
      urls.model.unit({
        userName: "eggman@external",
        modelName: "test-model",
        appName: "easyrsa",
        unitId: "easyrsa-0",
      }),
    );
  });

  it("should display app link for an offer", () => {
    renderComponent(<Label keyPath={["offer_0", "offers", 0, "abc123"]} />, {
      state,
    });
    expect(screen.getByRole("link", { name: "offer_0:" })).toHaveAttribute(
      "href",
      urls.model.app.index({
        userName: "eggman@external",
        modelName: "test-model",
        appName: "offer_0",
      }),
    );
  });

  it("should display app link for an application", () => {
    renderComponent(
      <Label keyPath={["application_0", "applications", 0, "abc123"]} />,
      {
        state,
      },
    );
    expect(
      screen.getByRole("link", { name: "application_0:" }),
    ).toHaveAttribute(
      "href",
      urls.model.app.index({
        userName: "eggman@external",
        modelName: "test-model",
        appName: "application_0",
      }),
    );
  });

  it("should display results model link for applications", () => {
    renderComponent(<Label keyPath={["applications", 0, "abc123"]} />, {
      state,
    });
    expect(screen.getByRole("link", { name: "applications:" })).toHaveAttribute(
      "href",
      urls.model.tab({
        userName: "eggman@external",
        modelName: "test-model",
        tab: getTab("applications")!,
      }),
    );
  });

  it("should display results model link for machines", () => {
    renderComponent(<Label keyPath={["machines", 0, "abc123"]} />, {
      state,
    });
    expect(screen.getByRole("link", { name: "machines:" })).toHaveAttribute(
      "href",
      urls.model.tab({
        userName: "eggman@external",
        modelName: "test-model",
        tab: getTab("machines")!,
      }),
    );
  });

  it("should display results model link for offers", () => {
    renderComponent(<Label keyPath={["offers", 0, "abc123"]} />, {
      state,
    });
    expect(screen.getByRole("link", { name: "offers:" })).toHaveAttribute(
      "href",
      urls.model.tab({
        userName: "eggman@external",
        modelName: "test-model",
        tab: getTab("offers")!,
      }),
    );
  });

  it("should display results model link for relations", () => {
    renderComponent(<Label keyPath={["relations", 0, "abc123"]} />, {
      state,
    });
    expect(screen.getByRole("link", { name: "relations:" })).toHaveAttribute(
      "href",
      urls.model.tab({
        userName: "eggman@external",
        modelName: "test-model",
        tab: getTab("relations")!,
      }),
    );
  });

  it("should display results model link for model", () => {
    renderComponent(<Label keyPath={["model", 0, "abc123"]} />, {
      state,
    });
    expect(screen.getByRole("link", { name: "model:" })).toHaveAttribute(
      "href",
      urls.model.index({
        userName: "eggman@external",
        modelName: "test-model",
      }),
    );
  });

  it("should display '[none]:' if the current key is an empty string", () => {
    renderComponent(<Label keyPath={["", 0, "abc123"]} />, {
      state,
    });
    expect(screen.getByText("[none]:")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("should display the current key for all other cases", () => {
    renderComponent(<Label keyPath={["something else", 0, "abc123"]} />, {
      state,
    });
    expect(screen.getByText("something else:")).toBeInTheDocument();
    expect(screen.queryByText("[none]:")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
