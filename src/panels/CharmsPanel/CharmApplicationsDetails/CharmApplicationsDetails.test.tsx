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
            name: "First Mock application",
            "charm-url": "ch:amd64/focal/redis-k8s",
          }),
          charmApplicationFactory.build({
            name: "Second Mock application",
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
      "First Mock application, Second Mock application"
    );
  });
});
