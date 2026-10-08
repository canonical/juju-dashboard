import { screen } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { act } from "react";

import {
  DestroyBlockedReason,
  type ModelDestructionData,
} from "store/juju/types";
import type { RootState } from "store/store";
import { configFactory, generalStateFactory } from "testing/factories/general";
import {
  jujuStateFactory,
  modelDestructionDataFactory,
  modelListInfoFactory,
  modelSelectionParamsFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import { Label } from "../types";

import AccordionTitle from "./AccordionTitle";

describe("AccordionTitle", () => {
  let state: RootState;
  let destructionData: ModelDestructionData;
  let userEventWithTimers: UserEvent;

  beforeEach(() => {
    destructionData = modelDestructionDataFactory.build({
      applications: ["easyrsa", "mysql"],
      machines: ["0", "1"],
      unitCount: 3,
    });
    vi.useFakeTimers();
    userEventWithTimers = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com/api",
          isJuju: true,
        }),
      }),
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            canConfigure: true,
          }),
        },
      }),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders properly", () => {
    renderComponent(
      <AccordionTitle
        modelUUID="abc123"
        modelName="test-model"
        destructionData={destructionData}
      />,
      { state },
    );
    expect(screen.getByText("test-model")).toBeInTheDocument();
    // 2 applications, 3 units (2 easyrsa + 1 mysql), 2 machines
    const summaryItems = document.querySelectorAll(
      ".accordion-title__model-summary-item",
    );
    expect(summaryItems[0]).toHaveTextContent("2"); // apps
    expect(summaryItems[1]).toHaveTextContent("3"); // units
    expect(summaryItems[2]).toHaveTextContent("2"); // machines
  });

  it("shows the reviewed icon when the model is reviewed and not skipped", () => {
    state.juju.modelsSelectedForDestruction = [
      modelSelectionParamsFactory.build({
        modelUUID: "abc123",
        reviewed: true,
        skipped: false,
      }),
    ];
    renderComponent(
      <AccordionTitle
        modelUUID="abc123"
        modelName="test-model"
        destructionData={destructionData}
      />,
      { state },
    );
    expect(document.querySelector(".p-icon--success")).toBeInTheDocument();
  });

  it("hides the reviewed icon when the model is reviewed but skipped", () => {
    state.juju.modelsSelectedForDestruction = [
      modelSelectionParamsFactory.build({
        modelUUID: "abc123",
        reviewed: true,
        skipped: true,
      }),
    ];
    renderComponent(
      <AccordionTitle
        modelUUID="abc123"
        modelName="test-model"
        destructionData={destructionData}
      />,
      { state },
    );
    expect(document.querySelector(".p-icon--success")).not.toBeInTheDocument();
  });

  it("renders is-skipped class when the model is a controller model", async () => {
    renderComponent(
      <AccordionTitle
        modelUUID="abc123"
        modelName="test-model"
        destructionData={{
          ...destructionData,
          destroyBlockedReason: DestroyBlockedReason.IS_CONTROLLER,
        }}
      />,
      { state },
    );
    const icon = document.querySelector(".p-icon--help");
    expect(icon).toBeInTheDocument();
    await act(async () => {
      if (!icon) {
        throw new Error("Icon not found");
      }
      await userEventWithTimers.hover(icon);
      vi.runAllTimers();
    });
    expect(
      screen.getByRole("tooltip", { name: Label.TOOLTIP_CONTROLLER_MODEL }),
    ).toBeVisible();
  });

  it("renders is-skipped class when model has connected offers", async () => {
    renderComponent(
      <AccordionTitle
        modelUUID="abc123"
        modelName="test-model"
        destructionData={{
          ...destructionData,
          destroyBlockedReason: DestroyBlockedReason.CONNECTED_OFFERS,
        }}
      />,
      { state },
    );
    expect(
      document.querySelector(".accordion-title--is-skipped"),
    ).toBeInTheDocument();
    const icon = document.querySelector(".p-icon--help");
    expect(icon).toBeInTheDocument();
    await act(async () => {
      if (!icon) {
        throw new Error("Icon not found");
      }
      await userEventWithTimers.hover(icon);
      vi.runAllTimers();
    });
    expect(
      screen.getByRole("tooltip", { name: Label.TOOLTIP_CONNECTED_OFFERS }),
    ).toBeVisible();
  });

  it("renders is-skipped class when user does not have model access", async () => {
    renderComponent(
      <AccordionTitle
        modelUUID="abc123"
        modelName="test-model"
        destructionData={{
          ...destructionData,
          destroyBlockedReason: DestroyBlockedReason.NO_ACCESS,
        }}
      />,
      { state },
    );
    expect(
      document.querySelector(".accordion-title--is-skipped"),
    ).toBeInTheDocument();
    const icon = document.querySelector(".p-icon--help");
    expect(icon).toBeInTheDocument();
    await act(async () => {
      if (!icon) {
        throw new Error("Icon not found");
      }
      await userEventWithTimers.hover(icon);
      vi.runAllTimers();
    });
    expect(
      screen.getByRole("tooltip", { name: Label.TOOLTIP_NO_ACCESS }),
    ).toBeVisible();
  });
});
