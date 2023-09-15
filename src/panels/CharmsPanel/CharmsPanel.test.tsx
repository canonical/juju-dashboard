import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { generalStateFactory } from "testing/factories/general";
import {
  charmActionSpecFactory,
  charmActionsFactory,
  charmApplicationFactory,
  charmInfoFactory,
} from "testing/factories/juju/Charms";
import { renderComponent } from "testing/utils";

import CharmsPanel, { Label } from "./CharmsPanel";

describe("CharmsPanel", () => {
  let state: RootState;
  const path = "*";
  const url = "/models/admin/tests?panel=charm-actions";

  beforeEach(() => {
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
        selectedApplications: [
          charmApplicationFactory.build({
            name: "Mock app 1",
          }),
          charmApplicationFactory.build({
            "charm-url": "ch:amd64/focal/redis-k8s",
          }),
        ],
      }),
    });
  });

  it("renders the correct number of charms", () => {
    renderComponent(
      <CharmsPanel
        onCharmURLChange={jest.fn()}
        onRemovePanelQueryParams={jest.fn()}
        isLoading={false}
      />,
      {
        path,
        url,
        state,
      }
    );
    expect(screen.getAllByRole("radio").length).toBe(2);
  });

  it("next button is disabled when no charm is selected", () => {
    renderComponent(
      <CharmsPanel
        onCharmURLChange={jest.fn()}
        onRemovePanelQueryParams={jest.fn()}
        isLoading={false}
      />,
      {
        path,
        url,
        state,
      }
    );
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("next button is enabled when a charm is selected", () => {
    renderComponent(
      <CharmsPanel
        onCharmURLChange={jest.fn()}
        onRemovePanelQueryParams={jest.fn()}
        isLoading={false}
      />,
      {
        path,
        url,
        state,
      }
    );
    act(() => screen.getAllByRole("radio")[0].click());
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });

  it("can open the actions panel", async () => {
    const mockHandleCharmURLChange = jest.fn();
    renderComponent(
      <CharmsPanel
        onCharmURLChange={mockHandleCharmURLChange}
        onRemovePanelQueryParams={jest.fn()}
        isLoading={false}
      />,
      { path, url, state }
    );
    await userEvent.click(screen.getAllByRole("radio")[0]);
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(mockHandleCharmURLChange).toHaveBeenCalledTimes(1);
  });

  it("should show tooltip and have charm button dissabled if no action is available", async () => {
    renderComponent(
      <CharmsPanel
        onCharmURLChange={jest.fn()}
        onRemovePanelQueryParams={jest.fn()}
        isLoading={false}
      />,
      { path, url, state }
    );
    const disabledRadioButton = screen.getAllByRole("radio")[1];
    expect(disabledRadioButton).toBeDisabled();
    await userEvent.hover(disabledRadioButton);
    expect(
      screen.getByRole("tooltip", { name: Label.NO_ACTIONS })
    ).toBeVisible();
  });

  it("should show applications details of charms", () => {
    renderComponent(
      <CharmsPanel
        onCharmURLChange={jest.fn()}
        onRemovePanelQueryParams={jest.fn()}
        isLoading={false}
      />,
      { path, url, state }
    );
    const charmHelperMessages = document.querySelectorAll(".p-form-help-text");
    expect(charmHelperMessages).toHaveLength(2);
    expect(charmHelperMessages[0]).toHaveTextContent("Mock app 1");
    expect(charmHelperMessages[1]).toHaveTextContent("db2");
  });

  it("should show tooltip with additional applications details if there are more than 5 apps", async () => {
    for (let i = 2; i < 10; i++) {
      state.juju.selectedApplications.push(
        charmApplicationFactory.build({
          name: `Mock app ${i}`,
        })
      );
    }
    renderComponent(
      <CharmsPanel
        onCharmURLChange={jest.fn()}
        onRemovePanelQueryParams={jest.fn()}
        isLoading={false}
      />,
      { path, url, state }
    );
    expect(document.querySelectorAll(".p-form-help-text")[0]).toHaveTextContent(
      "Mock app 1, Mock app 2, Mock app 3, Mock app 4, Mock app 5 + 4 more"
    );
    await userEvent.hover(screen.getByText("4 more"));
    expect(
      screen.getByRole("tooltip", {
        name: "Mock app 6, Mock app 7, Mock app 8, Mock app 9",
      })
    ).toBeVisible();
  });
});
