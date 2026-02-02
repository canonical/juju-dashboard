import { screen } from "@testing-library/react";

import {
  applicationStatusFactory,
  unitStatusFactory,
  machineStatusFactory,
} from "testing/factories/juju/ClientV7";
import { modelDataFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import ModelSummary from "./ModelSummary";
import { Label } from "./types";

describe("ModelSummary", () => {
  it("displays links", () => {
    const modelData = modelDataFactory.build({
      applications: {
        easyrsa: applicationStatusFactory.build({
          units: {
            "easyrsa/0": unitStatusFactory.build(),
            "easyrsa/1": unitStatusFactory.build(),
            "easyrsa/3": unitStatusFactory.build(),
          },
        }),
      },
      machines: {
        "0": machineStatusFactory.build(),
        "1": machineStatusFactory.build(),
      },
    });
    renderComponent(
      <ModelSummary modelData={modelData} ownerTag="user-eggman@external" />,
    );
    expect(screen.getByRole("link", { name: Label.APPS })).toHaveTextContent(
      "1",
    );
    expect(screen.getByLabelText(Label.UNITS)).toHaveTextContent("3");
    expect(
      screen.getByRole("link", { name: Label.MACHINES }),
    ).toHaveTextContent("2");
  });
});
