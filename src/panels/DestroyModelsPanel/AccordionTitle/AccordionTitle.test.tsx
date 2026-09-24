import { screen } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { act } from "react";

import type { RootState } from "store/store";
import { configFactory, generalStateFactory } from "testing/factories/general";
import {
  applicationStatusFactory,
  machineStatusFactory,
  applicationOfferStatusFactory,
  unitStatusFactory,
} from "testing/factories/juju/ClientV8";
import { modelInfoFactory } from "testing/factories/juju/ModelManagerV10";
import {
  jujuStateFactory,
  modelDataFactory,
  modelListInfoFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import { Label } from "../types";

import AccordionTitle from "./AccordionTitle";

describe("AccordionTitle", () => {
  let state: RootState;
  let userEventWithTimers: UserEvent;

  beforeEach(() => {
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
        modelData: {
          abc123: modelDataFactory.build({
            uuid: "abc123",
            info: modelInfoFactory.build({ name: "test-model" }),
            applications: {
              easyrsa: applicationStatusFactory.build({
                units: {
                  "easyrsa/0": unitStatusFactory.build(),
                  "easyrsa/1": unitStatusFactory.build(),
                },
              }),
              mysql: applicationStatusFactory.build({
                units: { "mysql/0": unitStatusFactory.build() },
              }),
            },
            machines: {
              "0": machineStatusFactory.build(),
              "1": machineStatusFactory.build(),
            },
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
      <AccordionTitle modelUUID="abc123" modelName="test-model" />,
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

  it("renders is-skipped class when the model is a controller model", async () => {
    state.juju.modelData["abc123"].info = modelInfoFactory.build({
      "is-controller": true,
    });
    renderComponent(
      <AccordionTitle modelUUID="abc123" modelName="test-model" />,
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
    state.juju.models["abc123"] = modelListInfoFactory.build({
      uuid: "abc123",
      canConfigure: true,
    });
    state.juju.modelData["abc123"] = modelDataFactory.build({
      uuid: "abc123",
      info: modelInfoFactory.build({ name: "test-model" }),
      offers: {
        db: applicationOfferStatusFactory.build({
          "total-connected-count": 1,
        }),
      },
    });
    renderComponent(
      <AccordionTitle modelUUID="abc123" modelName="test-model" />,
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
    state.juju.models["abc123"] = modelListInfoFactory.build({
      uuid: "abc123",
      canConfigure: false,
    });
    renderComponent(
      <AccordionTitle modelUUID="abc123" modelName="test-model" />,
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
