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

import CharmsPanel from "./CharmsPanel";

describe("CharmsPanel", () => {
  let state: RootState;
  const path = "*";
  const url = "/models/admin/tests?panel=choose-charm";

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

  it("renders the correct number of charms", () => {
    renderComponent(<CharmsPanel />, { path, url, state });
    expect(screen.getAllByRole("radio").length).toBe(2);
  });

  it("next button is disabled when no charm is selected", () => {
    renderComponent(<CharmsPanel />, { path, url, state });
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("next button is enabled when a charm is selected", () => {
    renderComponent(<CharmsPanel />, { path, url, state });
    act(() => screen.getAllByRole("radio")[0].click());
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });

  it("can open the actions panel", async () => {
    renderComponent(<CharmsPanel />, { path, url, state });
    await userEvent.click(screen.getAllByRole("radio")[0]);
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(window.location.search).toBe(
      "?panel=charm-actions&charm=ch%3Aamd64%2Ffocal%2Fpostgresql-k8s-20"
    );
  });
});
