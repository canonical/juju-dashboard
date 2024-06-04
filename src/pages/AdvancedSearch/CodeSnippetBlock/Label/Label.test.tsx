import { screen } from "@testing-library/react";

import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import Label from "./Label";

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

  it("should display [none] if invalid keyPath is passed", () => {
    renderComponent(<Label keyPath={[]} />);
    expect(screen.getByText("[none]:")).toBeInTheDocument();
  });

  it("should display results model link", () => {
    renderComponent(<Label keyPath={["abc123"]} />, { state });
    const link = screen.getByRole("link", {
      name: "eggman@external/test-model",
    });
    expect(link).toHaveAttribute("href", "/models/eggman@external/test-model");
    expect(link).toHaveAttribute("title", "UUID: abc123");
  });
});
