import { screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { UserEvent } from "@testing-library/user-event";
import { vi } from "vitest";

import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { generalStateFactory } from "testing/factories/general";
import {
  charmActionSpecFactory,
  charmActionsFactory,
  charmInfoFactory,
} from "testing/factories/juju/Charms";
import { applicationStatusFactory } from "testing/factories/juju/ClientV8";
import { renderComponent } from "testing/utils";

import CharmApplicationsDetails from "./CharmApplicationsDetails";

describe("CharmApplicationsDetails", () => {
  let state: RootState;
  let userEventWithTimers: UserEvent;

  beforeEach(() => {
    vi.useFakeTimers();
    userEventWithTimers = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });
    state = rootStateFactory.build({
      general: generalStateFactory.build({}),
      juju: jujuStateFactory.build({
        charms: [
          charmInfoFactory.build({
            actions: charmActionsFactory.build({
              specs: { "apt-update": charmActionSpecFactory.build() },
            }),
          }),
          charmInfoFactory.build({
            meta: { name: "Redis k8s" },
            url: "ch:amd64/focal/redis-k8s",
          }),
        ],
        selectedApplications: {
          app1: applicationStatusFactory.build(),
          app2: applicationStatusFactory.build({
            charm: "ch:amd64/focal/redis-k8s",
          }),
          app3: applicationStatusFactory.build({
            charm: "ch:amd64/focal/redis-k8s",
          }),
        },
      }),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render correctly", () => {
    renderComponent(
      <CharmApplicationsDetails charmURL="ch:amd64/focal/redis-k8s" />,
      { state },
    );
    expect(document.querySelector(".p-form-help-text")).toHaveTextContent(
      "app2, app3",
    );
  });

  it("should show tooltip if more than 5 apps are available", async () => {
    for (let i = 4; i < 10; i++) {
      state.juju.selectedApplications[`mock-app-${i}`] =
        applicationStatusFactory.build({
          charm: "ch:amd64/focal/redis-k8s",
        });
    }
    renderComponent(
      <CharmApplicationsDetails charmURL="ch:amd64/focal/redis-k8s" />,
      { state },
    );
    expect(document.querySelector(".p-form-help-text")).toHaveTextContent(
      "app2, app3, mock-app-4, mock-app-5, mock-app-6 + 3 more",
    );
    await act(async () => {
      await userEventWithTimers.hover(screen.getByText("3 more"));
      vi.runAllTimers();
    });
    expect(
      screen.getByRole("tooltip", {
        name: "mock-app-7, mock-app-8, mock-app-9",
      }),
    ).toBeVisible();
  });
});
