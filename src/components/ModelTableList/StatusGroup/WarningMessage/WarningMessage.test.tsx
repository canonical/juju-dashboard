import { screen, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { UserEvent } from "@testing-library/user-event";
import { vi } from "vitest";

import { detailedStatusFactory } from "testing/factories/juju/ClientV6";
import {
  modelDataApplicationFactory,
  modelDataFactory,
  modelDataUnitFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import WarningMessage from "./WarningMessage";

describe("WarningMessage", () => {
  let userEventWithTimers: UserEvent;

  beforeEach(() => {
    vi.useFakeTimers();
    userEventWithTimers = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should display nothing if there are no messages", () => {
    const model = modelDataFactory.build();
    renderComponent(<WarningMessage model={model} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("should display links to blocked apps and units", async () => {
    const model = modelDataFactory.build({
      applications: {
        calico: modelDataApplicationFactory.build({
          status: detailedStatusFactory.build({
            info: "app blocked",
            status: "blocked",
          }),
        }),
        etcd: modelDataApplicationFactory.build({
          units: {
            "etcd/0": modelDataUnitFactory.build({
              "agent-status": detailedStatusFactory.build({
                info: "unit blocked",
                status: "lost",
              }),
            }),
          },
        }),
      },
    });
    renderComponent(<WarningMessage model={model} />);
    const error = screen.getByRole("link", { name: "app blocked" });
    expect(error).toHaveAttribute("href", "/models/eggman@external/sub-test");
    await act(async () => {
      await userEventWithTimers.hover(error);
      vi.runAllTimers();
    });
    const tooltip = screen.getAllByRole("tooltip")[0];
    expect(error).toHaveAttribute("href", "/models/eggman@external/sub-test");
    const appError = within(tooltip).getByRole("link", {
      name: "app blocked",
    });
    expect(appError).toHaveAttribute(
      "href",
      "/models/eggman@external/sub-test/app/calico",
    );
    const unitError = within(tooltip).getByRole("link", {
      name: "unit blocked",
    });
    expect(unitError).toHaveAttribute(
      "href",
      "/models/eggman@external/sub-test/app/etcd/unit/etcd-0",
    );
  });
});
