import { screen } from "@testing-library/react";

import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { generalStateFactory } from "testing/factories/general";
import {
  applicationOfferStatusFactory,
  applicationStatusFactory,
  remoteApplicationStatusFactory,
} from "testing/factories/juju/ClientV7";
import { modelInfoFactory } from "testing/factories/juju/ModelManagerV9";
import { modelDataFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import ApplicationsTab from "./ApplicationsTab";

describe("ApplicationsTab", () => {
  let state: RootState;
  const path = "/models/:userName/:modelName";
  const url = "/models/test@external/test-model";

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({}),
      juju: jujuStateFactory.build({
        models: {
          test123: {
            name: "test-model",
            uuid: "test123",
            ownerTag: "test@external",
            type: "iaas",
          },
        },
        modelData: {
          test123: modelDataFactory.build({
            applications: {
              mysql1: applicationStatusFactory.build(),
              mysql2: applicationStatusFactory.build(),
              db2: applicationStatusFactory.build(),
              db1: applicationStatusFactory.build(),
              "jupyter-controller": applicationStatusFactory.build(),
              "jupyter-ui": applicationStatusFactory.build(),
              redis1: applicationStatusFactory.build(),
            },
          }),
        },
      }),
    });
  });

  it("displays a message when there are no applications", () => {
    state.juju.modelData = {};
    renderComponent(<ApplicationsTab />, { path, url, state });
    expect(
      screen.queryByText(
        /There are no applications associated with this model/i,
      ),
    ).toBeInTheDocument();
  });

  it("shows the applications table when there are applications", () => {
    renderComponent(<ApplicationsTab />, { path, url, state });
    expect(
      screen.queryByText(
        /There are no applications associated with this model/i,
      ),
    ).not.toBeInTheDocument();
    expect(screen.queryAllByText(/db1/i)).toHaveLength(1);
  });

  it("can show the offers table", () => {
    state.juju.modelData = {
      test123: modelDataFactory.build({
        info: modelInfoFactory.build({
          uuid: "test123",
          name: "test-model",
        }),
        offers: {
          db: applicationOfferStatusFactory.build(),
        },
      }),
    };
    renderComponent(<ApplicationsTab />, { path, url, state });
    expect(
      document.querySelector(".entity-details__offers"),
    ).toBeInTheDocument();
  });

  it("can show the remote apps table", () => {
    state.juju.modelData = {
      test123: modelDataFactory.build({
        info: modelInfoFactory.build({
          uuid: "test123",
          name: "test-model",
        }),
        "remote-applications": {
          mysql: remoteApplicationStatusFactory.build(),
        },
      }),
    };
    renderComponent(<ApplicationsTab />, { path, url, state });
    expect(
      document.querySelector(".entity-details__remote-apps"),
    ).toBeInTheDocument();
  });
});
