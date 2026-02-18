import { screen } from "@testing-library/react";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { charmInfoFactory } from "testing/factories/juju/Charms";
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

import CharmActionsPanelTitle from "./CharmActionsPanelTitle";
import { Label } from "./types";

describe("CharmActionsPanelTitle", () => {
  let state: RootState;
  const path = "/models/:qualifier/:modelName/app/:appName";
  const url =
    "/models/eggman@external/test-model/app/kubernetes-master?panel=select-charms-and-actions";

  beforeEach(() => {
    state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        charms: [
          charmInfoFactory.build({
            url: "ch:ceph",
          }),
        ],
        modelData: {
          abc123: modelDataFactory.build({
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
            uuid: "abc123",
          }),
        },
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            name: "test-model",
            qualifier: "user-eggman@external",
          }),
        },
      }),
    });
  });

  it("should display a warning message if there are no selected applications", () => {
    renderComponent(<CharmActionsPanelTitle charmURL="ch:ceph" />, {
      path,
      url,
      state,
    });

    const title = screen.getByText(Label.NONE_SELECTED_TITLE);
    expect(title).toBeVisible();
  });

  it("should display a warning message if there is no selected charm", () => {
    state.juju.charms = [];
    state.juju.modelData.abc123.applications = state.juju.selectedApplications =
      {
        ceph: applicationStatusFactory.build({ charm: "ch:ceph" }),
      };
    renderComponent(<CharmActionsPanelTitle charmURL="ch:ceph" />, {
      path,
      url,
      state,
    });

    const title = screen.getByText(Label.NONE_SELECTED_TITLE);
    expect(title).toBeVisible();
  });

  it("should display a warning message if there is nothing in store that corresponds to charmURL", () => {
    state.juju.modelData.abc123.applications = state.juju.selectedApplications =
      {
        ceph: applicationStatusFactory.build({ charm: "ch:ceph" }),
      };
    renderComponent(<CharmActionsPanelTitle charmURL="other-charm-url" />, {
      path,
      url,
      state,
    });

    const title = screen.getByText(Label.NONE_SELECTED_TITLE);
    expect(title).toBeVisible();
  });

  it("should not display an icon if there is no info about it in selected charm", () => {
    state.juju.charms = [{ url: "ch:ceph", config: {}, revision: 0 }];
    state.juju.modelData.abc123.applications = state.juju.selectedApplications =
      {
        ceph: applicationStatusFactory.build({
          charm: "ch:ceph",
          units: {
            "ceph/0": unitStatusFactory.build(),
            "ceph/1": unitStatusFactory.build(),
          },
        }),
      };
    renderComponent(<CharmActionsPanelTitle charmURL="ch:ceph" />, {
      path,
      url,
      state,
    });

    const entityIcon = screen.queryByRole("img");
    expect(entityIcon).not.toBeInTheDocument();

    const title = screen.getByText("1 application (2 units) selected");
    expect(title).toBeVisible();
  });

  it("should display the title when no unit is selected", () => {
    state.juju.modelData.abc123.applications = state.juju.selectedApplications =
      {
        ceph: applicationStatusFactory.build({
          charm: "ch:ceph",
          units: {},
        }),
      };
    renderComponent(<CharmActionsPanelTitle charmURL="ch:ceph" />, {
      path,
      url,
      state,
    });

    const title = screen.getByText("1 application (0 units) selected");
    expect(title).toBeVisible();
  });

  it("should display the title and icon if a charm and applications are selected", () => {
    state.juju.modelData.abc123.applications = state.juju.selectedApplications =
      {
        ceph: applicationStatusFactory.build({
          charm: "ch:ceph",
          units: {
            "ceph/0": unitStatusFactory.build(),
            "ceph/1": unitStatusFactory.build(),
          },
        }),
      };
    renderComponent(<CharmActionsPanelTitle charmURL="ch:ceph" />, {
      path,
      url,
      state,
    });

    const entityIcon = screen.queryByRole("img");
    expect(entityIcon).toBeVisible();

    const title = screen.getByText("1 application (2 units) selected");
    expect(title).toBeVisible();
  });
});
