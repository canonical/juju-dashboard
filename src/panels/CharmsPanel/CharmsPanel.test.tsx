import { act, screen } from "@testing-library/react";
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
import {
  applicationStatusFactory,
  unitStatusFactory,
} from "testing/factories/juju/ClientV8";
import { renderComponent } from "testing/utils";

import CharmsPanel from "./CharmsPanel";
import { Label } from "./types";

describe("CharmsPanel", () => {
  let state: RootState;
  const path = "*";
  const url = "/models/admin/tests?panel=charm-actions";
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
            url: "ch:amd64/focal/postgresql-k8s-20",
          }),
          charmInfoFactory.build({
            meta: { name: "Redis k8s" },
            url: "ch:amd64/focal/redis-k8s",
          }),
        ],
        selectedApplications: {
          "mock-app-1": applicationStatusFactory.build({
            charm: "ch:amd64/focal/postgresql-k8s-20",
          }),
          redis: applicationStatusFactory.build({
            charm: "ch:amd64/focal/redis-k8s",
            units: {
              0: unitStatusFactory.build(),
              1: unitStatusFactory.build(),
            },
          }),
        },
      }),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the correct number of charms", () => {
    renderComponent(
      <CharmsPanel
        onCharmURLChange={vi.fn()}
        onRemovePanelQueryParams={vi.fn()}
        isLoading={false}
        inlineErrors={[]}
      />,
      {
        path,
        url,
        state,
      },
    );
    expect(screen.getAllByRole("radio").length).toBe(2);
  });

  it("next button is disabled when no charm is selected", () => {
    renderComponent(
      <CharmsPanel
        onCharmURLChange={vi.fn()}
        onRemovePanelQueryParams={vi.fn()}
        isLoading={false}
        inlineErrors={[]}
      />,
      {
        path,
        url,
        state,
      },
    );
    expect(screen.getByRole("button", { name: "Next" })).toHaveAttribute(
      "aria-disabled",
    );
  });

  it("next button is enabled when a charm is selected", async () => {
    renderComponent(
      <CharmsPanel
        onCharmURLChange={vi.fn()}
        onRemovePanelQueryParams={vi.fn()}
        isLoading={false}
        inlineErrors={[]}
      />,
      {
        path,
        url,
        state,
      },
    );
    await userEventWithTimers.click(screen.getAllByRole("radio")[0]);
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });

  it("can open the actions panel", async () => {
    const mockHandleCharmURLChange = vi.fn();
    renderComponent(
      <CharmsPanel
        onCharmURLChange={mockHandleCharmURLChange}
        onRemovePanelQueryParams={vi.fn()}
        isLoading={false}
        inlineErrors={[]}
      />,
      { path, url, state },
    );
    await userEventWithTimers.click(screen.getAllByRole("radio")[0]);
    await userEventWithTimers.click(
      screen.getByRole("button", { name: "Next" }),
    );
    expect(mockHandleCharmURLChange).toHaveBeenCalledTimes(1);
  });

  it("should show tooltip and have charm button disabled if no action is available", async () => {
    renderComponent(
      <CharmsPanel
        onCharmURLChange={vi.fn()}
        onRemovePanelQueryParams={vi.fn()}
        isLoading={false}
        inlineErrors={[]}
      />,
      { path, url, state },
    );
    const [_radioButton, disabledRadioButton] = screen.getAllByRole("radio");
    expect(disabledRadioButton).toBeDisabled();
    await act(async () => {
      await userEventWithTimers.hover(disabledRadioButton);
      vi.runAllTimers();
    });
    expect(
      screen.getByRole("tooltip", { name: Label.NO_ACTIONS }),
    ).toBeVisible();
  });

  it("should show applications details of charms", () => {
    renderComponent(
      <CharmsPanel
        onCharmURLChange={vi.fn()}
        onRemovePanelQueryParams={vi.fn()}
        isLoading={false}
        inlineErrors={[]}
      />,
      { path, url, state },
    );
    const charmHelperMessages = document.querySelectorAll(".p-form-help-text");
    expect(charmHelperMessages).toHaveLength(2);
    expect(charmHelperMessages[0]).toHaveTextContent("mock-app-1");
    expect(charmHelperMessages[1]).toHaveTextContent("redis");
  });

  it("should show tooltip with additional applications details if there are more than 5 apps", async () => {
    state.juju.selectedApplications = {};
    for (let i = 2; i < 10; i++) {
      state.juju.selectedApplications[`mock-app-${i}`] =
        applicationStatusFactory.build({
          charm: "ch:amd64/focal/redis-k8s",
        });
    }
    renderComponent(
      <CharmsPanel
        onCharmURLChange={vi.fn()}
        onRemovePanelQueryParams={vi.fn()}
        isLoading={false}
        inlineErrors={[]}
      />,
      { path, url, state },
    );
    expect(document.querySelectorAll(".p-form-help-text")[0]).toHaveTextContent(
      "mock-app-2, mock-app-3, mock-app-4, mock-app-5, mock-app-6 + 3 more",
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

  it("should show errors", () => {
    state.juju.charms = [];
    renderComponent(
      <CharmsPanel
        onCharmURLChange={vi.fn()}
        onRemovePanelQueryParams={vi.fn()}
        isLoading={false}
        inlineErrors={["Oops, there is an error!"]}
      />,
      { path, url, state },
    );
    expect(screen.getByText("Oops, there is an error!")).toBeInTheDocument();
  });
});
