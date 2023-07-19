import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { generalStateFactory } from "testing/factories/general";
import {
  charmApplicationFactory,
  charmInfoFactory,
} from "testing/factories/juju/Charms";
import { renderComponent } from "testing/utils";

import type { Props } from "./CharmsPanel";
import CharmsPanel from "./CharmsPanel";

describe("CharmsPanel", () => {
  let state: RootState;
  const path = "*";
  const url = "/models/admin/tests?panel=charm-actions";

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({}),
      juju: jujuStateFactory.build({
        charms: [
          charmInfoFactory.build(),
          charmInfoFactory.build({
            meta: { name: "Redis k8s" },
            url: "ch:amd64/focal/redis-k8s",
          }),
        ],
        selectedApplications: [
          charmApplicationFactory.build(),
          charmApplicationFactory.build({
            "charm-url": "ch:amd64/focal/redis-k8s",
          }),
        ],
      }),
    });
  });

  const mockHandleCharmURLChange = jest.fn((charmURL: string | null) => {});
  const mockRenderCharmsPanel = ({ isLoading = false }: Partial<Props>) =>
    renderComponent(
      <CharmsPanel
        isLoading={isLoading}
        onCharmURLChange={mockHandleCharmURLChange}
      />,
      { path, url, state }
    );

  it("renders the correct number of charms", () => {
    mockRenderCharmsPanel({});
    expect(screen.getAllByRole("radio").length).toBe(2);
  });

  it("next button is disabled when no charm is selected", () => {
    mockRenderCharmsPanel({});
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("next button is enabled when a charm is selected", () => {
    mockRenderCharmsPanel({});
    act(() => screen.getAllByRole("radio")[0].click());
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });

  it("can open the actions panel", async () => {
    mockRenderCharmsPanel({});
    await userEvent.click(screen.getAllByRole("radio")[0]);
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(mockHandleCharmURLChange).toHaveBeenCalledTimes(1);
  });

  it("should display spinner when panel is loading", () => {
    const {
      result: { container },
    } = mockRenderCharmsPanel({ isLoading: true });
    expect(
      container.querySelector(".l-aside")?.querySelector(".p-icon--spinner")
    ).toBeVisible();
  });
});
