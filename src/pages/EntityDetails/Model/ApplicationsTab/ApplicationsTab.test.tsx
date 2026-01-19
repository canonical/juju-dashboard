import { screen } from "@testing-library/react";

import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { generalStateFactory } from "testing/factories/general";
import {
  applicationOfferStatusFactory,
  remoteApplicationStatusFactory,
} from "testing/factories/juju/ClientV6";
import {
  modelDataApplicationFactory,
  modelDataFactory,
  modelDataInfoFactory,
} from "testing/factories/juju/juju";
import { modelWatcherModelDataFactory } from "testing/factories/juju/model-watcher";
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
              mysql1: modelDataApplicationFactory.build(),
              mysql2: modelDataApplicationFactory.build(),
              db2: modelDataApplicationFactory.build(),
              db1: modelDataApplicationFactory.build(),
              "jupyter-controller": modelDataApplicationFactory.build(),
              "jupyter-ui": modelDataApplicationFactory.build(),
              redis1: modelDataApplicationFactory.build(),
            },
          }),
        },
        modelWatcherData: {
          test123: modelWatcherModelDataFactory.build({
            charms: {
              "ch:amd64/focal/postgresql-k8s-20": {
                "model-uuid": "test123",
                "charm-url": "ch:amd64/focal/postgresql-k8s-20",
                "charm-version": "",
                life: "alive",
                profile: null,
              },
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
        info: modelDataInfoFactory.build({
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
        info: modelDataInfoFactory.build({
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
