import { screen } from "@testing-library/react";

import {
  modelDataApplicationFactory,
  modelDataFactory,
  modelDataUnitFactory,
  modelDataMachineFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import ModelSummary, { Label } from "./ModelSummary";

describe("ModelSummary", () => {
  it("displays links", () => {
    const modelData = modelDataFactory.build({
      applications: {
        easyrsa: modelDataApplicationFactory.build({
          units: {
            "easyrsa/0": modelDataUnitFactory.build(),
            "easyrsa/1": modelDataUnitFactory.build(),
            "easyrsa/3": modelDataUnitFactory.build(),
          },
        }),
      },
      machines: {
        "0": modelDataMachineFactory.build(),
        "1": modelDataMachineFactory.build(),
      },
    });
    renderComponent(
      <ModelSummary modelData={modelData} ownerTag="user-eggman@external" />
    );
    expect(screen.getByRole("link", { name: Label.APPS })).toHaveTextContent(
      "1"
    );
    expect(screen.getByLabelText(Label.UNITS)).toHaveTextContent("3");
    expect(
      screen.getByRole("link", { name: Label.MACHINES })
    ).toHaveTextContent("2");
  });
});
