import { screen } from "@testing-library/react";
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

import CharmApplicationsDetails from "./CharmApplicationsDetails";

describe("CharmApplicationsDetails", () => {
  let state: RootState;

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
          charmApplicationFactory.build(),
          charmApplicationFactory.build({
            name: "Mock app 1",
            "charm-url": "ch:amd64/focal/redis-k8s",
          }),
          charmApplicationFactory.build({
            name: "Mock app 2",
            "charm-url": "ch:amd64/focal/redis-k8s",
          }),
        ],
      }),
    });
  });

  it("should render correctly", () => {
    renderComponent(
      <CharmApplicationsDetails charmURL="ch:amd64/focal/redis-k8s" />,
      { state }
    );
    expect(document.querySelector(".p-form-help-text")).toHaveTextContent(
      "Mock app 1, Mock app 2"
    );
  });

  it("should show tooltip if more than 5 apps are available", async () => {
    for (let i = 3; i < 10; i++) {
      state.juju.selectedApplications.push(
        charmApplicationFactory.build({
          name: `Mock app ${i}`,
          "charm-url": "ch:amd64/focal/redis-k8s",
        })
      );
    }
    renderComponent(
      <CharmApplicationsDetails charmURL="ch:amd64/focal/redis-k8s" />,
      { state }
    );
    expect(document.querySelector(".p-form-help-text")).toHaveTextContent(
      "Mock app 1, Mock app 2, Mock app 3, Mock app 4, Mock app 5, +4 more..."
    );
    await userEvent.hover(
      screen.getByText(
        "Mock app 1, Mock app 2, Mock app 3, Mock app 4, Mock app 5"
      )
    );
    expect(
      screen.getByRole("tooltip", {
        name: "..., Mock app 6, Mock app 7, Mock app 8, Mock app 9",
      })
    ).toBeVisible();
  });
});
