import { screen } from "@testing-library/react";

import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { generalStateFactory } from "testing/factories/general";
import { charmApplicationFactory } from "testing/factories/juju/Charms";
import {
  applicationOfferStatusFactory,
  remoteApplicationStatusFactory,
} from "testing/factories/juju/ClientV6";
import {
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
        modelWatcherData: {
          test123: modelWatcherModelDataFactory.build({
            applications: {
              mysql1: charmApplicationFactory.build({
                name: "mysql1",
              }),
              mysql2: charmApplicationFactory.build({
                name: "mysql2",
              }),
              db2: charmApplicationFactory.build({
                name: "db2",
              }),
              db1: charmApplicationFactory.build({
                name: "db1",
              }),
              "jupyter-controller": charmApplicationFactory.build({
                name: "jupyter-controller",
              }),
              "jupyter-ui": charmApplicationFactory.build({
                name: "jupyter-ui",
              }),
              redis1: charmApplicationFactory.build({
                name: "redis1",
              }),
            },
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
    state.juju.modelWatcherData = {};
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
