import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import * as juju from "juju/api";
import { getCharmsURLFromApplications } from "juju/api";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { applicationCharmActionParamsFactory } from "testing/factories/juju/ActionV7";
import {
  charmActionSpecFactory,
  charmActionsFactory,
  charmInfoFactory,
} from "testing/factories/juju/Charms";
import {
  applicationStatusFactory,
  unitStatusFactory,
} from "testing/factories/juju/ClientV7";
import { modelInfoFactory } from "testing/factories/juju/ModelManagerV9";
import {
  jujuStateFactory,
  modelDataFactory,
  modelListInfoFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";
import urls from "urls";

import { CharmsPanelLabel } from "../CharmsPanel";

import CharmsAndActionsPanel from "./CharmsAndActionsPanel";
import { Label as CharmsAndActionsPanelLabel } from "./types";

describe("CharmsAndActionsPanel", () => {
  let state: RootState;
  const path = urls.model.index(null);
  const url = urls.model.index({
    userName: "test@external",
    modelName: "test-model",
  });

  beforeEach(() => {
    vi.resetAllMocks();

    state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        models: {
          test123: modelListInfoFactory.build({
            ownerTag: "test@external",
            name: "test-model",
            uuid: "test123",
          }),
        },
        modelData: {
          test123: modelDataFactory.build({
            applications: {
              ceph: applicationStatusFactory.build({
                charm: "ch:ceph",
                units: {
                  0: unitStatusFactory.build(),
                  1: unitStatusFactory.build(),
                },
              }),
            },
            info: modelInfoFactory.build({
              name: "test-model",
            }),
            uuid: "test123",
          }),
        },
        charms: [
          charmInfoFactory.build({
            url: "ch:ceph",
          }),
        ],
        selectedApplications: {
          ceph: applicationStatusFactory.build({
            charm: "ch:ceph",
            units: {
              0: unitStatusFactory.build(),
              1: unitStatusFactory.build(),
            },
          }),
        },
      }),
    });
  });

  it("should display the spinner before loading the panel", async () => {
    vi.spyOn(juju, "getCharmsURLFromApplications").mockImplementation(
      vi.fn().mockResolvedValue([]),
    );
    const {
      result: { getSpinnerByLabel },
    } = renderComponent(<CharmsAndActionsPanel />, { path, url, state });
    expect(getSpinnerByLabel("Loading")).toBeVisible();
    await waitFor(() => {
      expect(getCharmsURLFromApplications).toHaveBeenCalledTimes(1);
    });
  });

  it("should render CharmActionsPanel when there is a unique charm", async () => {
    vi.spyOn(juju, "getCharmsURLFromApplications").mockImplementation(
      vi.fn().mockResolvedValue(["ch:ceph"]),
    );
    state.juju.charms = [
      charmInfoFactory.build({
        url: "ch:ceph",
        actions: charmActionsFactory.build({
          specs: {
            action1: charmActionSpecFactory.build({
              description: "Mock description for Action 1",
              params: applicationCharmActionParamsFactory.build(),
            }),
            action2: charmActionSpecFactory.build({
              description: "Mock description for Action 2",
              params: applicationCharmActionParamsFactory.build(),
            }),
          },
        }),
      }),
    ];
    renderComponent(<CharmsAndActionsPanel />, { path, url, state });
    await waitFor(() => {
      expect(getCharmsURLFromApplications).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByRole("heading")).toHaveTextContent(
      "1 application (2 units) selected",
    );
    const charmActionsOptions = screen.getAllByRole("radio");
    expect(charmActionsOptions).toHaveLength(2);
    await userEvent.click(charmActionsOptions[0]);
    expect(
      await screen.findByRole("button", { name: "Run action" }),
    ).toBeEnabled();
  });

  it("should render CharmsPanel when there is no unique charm", async () => {
    vi.spyOn(juju, "getCharmsURLFromApplications").mockImplementation(
      vi.fn().mockResolvedValue(["ch:ceph", "ch:ceph2"]),
    );
    state.juju.modelData.test123.applications.ceph2 =
      state.juju.selectedApplications.ceph2 = applicationStatusFactory.build({
        charm: "ch:ceph2",
      });
    state.juju.charms = [
      ...state.juju.charms,
      charmInfoFactory.build({
        url: "ch:ceph2",
        actions: charmActionsFactory.build({
          specs: { "apt-update": charmActionSpecFactory.build() },
        }),
      }),
    ];
    const {
      result: { container },
    } = renderComponent(<CharmsAndActionsPanel />, { path, url, state });
    await waitFor(() => {
      expect(getCharmsURLFromApplications).toHaveBeenCalledTimes(1);
    });
    expect(container.querySelector(".p-panel__title")).toContainHTML(
      CharmsPanelLabel.PANEL_TITLE,
    );
    const charmOptions = screen.getAllByRole("radio");
    expect(charmOptions).toHaveLength(2);
    await userEvent.click(charmOptions[1]);
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });

  it("should show should show error in CharmsPanel", async () => {
    state.juju.charms = [];
    vi.spyOn(juju, "getCharmsURLFromApplications").mockImplementation(
      vi
        .fn()
        .mockRejectedValue(
          new Error("Error while calling getCharmsURLFromApplications"),
        ),
    );
    const {
      result: { container },
    } = renderComponent(<CharmsAndActionsPanel />, { path, url, state });
    expect(juju.getCharmsURLFromApplications).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(container.querySelector(".p-panel__title")).toContainHTML(
        CharmsPanelLabel.PANEL_TITLE,
      ),
    );
    const getCharmsURLErrorNotification = screen.getByText(
      CharmsAndActionsPanelLabel.GET_URL_ERROR,
      { exact: false },
    );
    expect(getCharmsURLErrorNotification).toBeInTheDocument();
    expect(getCharmsURLErrorNotification.childElementCount).toBe(1);
    const [refetchButton] = getCharmsURLErrorNotification.children;
    expect(refetchButton).toHaveTextContent("refetch");
    await userEvent.click(refetchButton);
    expect(juju.getCharmsURLFromApplications).toHaveBeenCalledTimes(2);
  });
});
