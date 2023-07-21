import { screen } from "@testing-library/react";

import { rootStateFactory } from "testing/factories";
import {
  charmApplicationFactory,
  charmInfoFactory,
} from "testing/factories/juju/Charms";
import { jujuStateFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import CharmActionsPanelTitle, { Label } from "./CharmActionsPanelTitle";

describe("CharmActionsPanelTitle", () => {
  it("should display a warning message if there are no selected applications", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        charms: [
          charmInfoFactory.build({
            url: "ch:ceph",
          }),
        ],
      }),
    });
    renderComponent(<CharmActionsPanelTitle charmURL="ch:ceph" />, { state });

    const title = screen.getByText(Label.NONE_SELECTED_TITLE);
    expect(title).toBeVisible();
  });

  it("should display a warning message if there is no selected charm", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        selectedApplications: [
          charmApplicationFactory.build({
            "charm-url": "ch:ceph",
          }),
        ],
      }),
    });
    renderComponent(<CharmActionsPanelTitle charmURL="ch:ceph" />, { state });

    const title = screen.getByText(Label.NONE_SELECTED_TITLE);
    expect(title).toBeVisible();
  });

  it("should display a warning message if there is nothing in store that corresponds to charmURL", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        selectedApplications: [
          charmApplicationFactory.build({
            "charm-url": "ch:ceph",
          }),
        ],
        charms: [
          charmInfoFactory.build({
            url: "ch:ceph",
          }),
        ],
      }),
    });
    renderComponent(<CharmActionsPanelTitle charmURL="other-charm-url" />, {
      state,
    });

    const title = screen.getByText(Label.NONE_SELECTED_TITLE);
    expect(title).toBeVisible();
  });

  it("should not display an icon if there is no info about it in selected charm", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        charms: [{ url: "ch:ceph", config: {}, revision: 0 }],
        selectedApplications: [
          charmApplicationFactory.build({
            "charm-url": "ch:ceph",
            "unit-count": 0,
          }),
        ],
      }),
    });
    const {
      result: { container },
    } = renderComponent(<CharmActionsPanelTitle charmURL="ch:ceph" />, {
      state,
    });

    const entityIcon = container.querySelector(".entity-icon");
    expect(entityIcon).not.toBeInTheDocument();
  });

  it("should display the title when no unit is selected", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        charms: [
          charmInfoFactory.build({
            url: "ch:ceph",
          }),
        ],
        selectedApplications: [
          charmApplicationFactory.build({
            "charm-url": "ch:ceph",
            "unit-count": 0,
          }),
        ],
      }),
    });
    renderComponent(<CharmActionsPanelTitle charmURL="ch:ceph" />, { state });

    const title = screen.getByText("1 application (0 units) selected");
    expect(title).toBeVisible();
    expect(title.tagName).toBe("H5");
  });

  it("should display the title and icon if a charm and applications are selected", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        charms: [
          charmInfoFactory.build({
            url: "ch:ceph",
          }),
        ],
        selectedApplications: [
          charmApplicationFactory.build({
            "charm-url": "ch:ceph",
          }),
        ],
      }),
    });
    const {
      result: { container },
    } = renderComponent(<CharmActionsPanelTitle charmURL="ch:ceph" />, {
      state,
    });

    const entityIcon = container.querySelector(".entity-icon");
    expect(entityIcon).toBeVisible();

    const title = screen.getByText("1 application (2 units) selected");
    expect(title).toBeVisible();
    expect(title.tagName).toBe("H5");
  });
});
