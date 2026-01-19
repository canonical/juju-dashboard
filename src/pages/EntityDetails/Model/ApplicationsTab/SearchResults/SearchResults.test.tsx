import { screen, within } from "@testing-library/react";

import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { generalStateFactory } from "testing/factories/general";
import { charmApplicationFactory } from "testing/factories/juju/Charms";
import {
  modelDataApplicationFactory,
  modelDataFactory,
} from "testing/factories/juju/juju";
import { modelWatcherModelDataFactory } from "testing/factories/juju/model-watcher";
import { createStore, renderComponent } from "testing/utils";

import SearchResults from "./SearchResults";

describe("SearchResults", () => {
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
          }),
        },
      }),
    });
  });

  it("can filter applications by name", () => {
    renderComponent(<SearchResults />, {
      path,
      url: `${url}?filterQuery=mysql`,
      state,
    });
    const rows = screen.queryAllByRole("row");
    expect(rows).toHaveLength(3);
    expect(
      within(rows[1]).getByRole("gridcell", { name: "mysql1 icon mysql1" }),
    ).toBeInTheDocument();
    expect(
      within(rows[2]).getByRole("gridcell", { name: "mysql2 icon mysql2" }),
    ).toBeInTheDocument();
  });

  it("can filter applications by charm", () => {
    state.juju.modelData = {
      test123: modelDataFactory.build({
        applications: {
          mysql1: modelDataApplicationFactory.build({
            charm: "ch:mysql",
          }),
          mysql2: modelDataApplicationFactory.build({
            charm: "ch:mysql",
          }),
          db2: modelDataApplicationFactory.build(),
          db1: modelDataApplicationFactory.build(),
        },
      }),
    };
    renderComponent(<SearchResults />, {
      path,
      url: `${url}?filterQuery=ch:mysql`,
      state,
    });
    const rows = screen.queryAllByRole("row");
    expect(rows).toHaveLength(3);
    expect(
      within(rows[1]).getByRole("gridcell", { name: "ch:mysql" }),
    ).toBeInTheDocument();
    expect(
      within(rows[2]).getByRole("gridcell", { name: "ch:mysql" }),
    ).toBeInTheDocument();
  });

  it("cleans up selected applications when unmounting", () => {
    state.juju.selectedApplications = {
      mysql1: modelDataApplicationFactory.build(),
      mysql2: modelDataApplicationFactory.build(),
    };
    const [store, actions] = createStore(state, { trackActions: true });
    const { result } = renderComponent(<SearchResults />, {
      path,
      url,
      store,
    });
    result.unmount();
    expect(
      actions.find(
        (action) => action.type === "juju/updateSelectedApplications",
      ),
    ).toMatchObject(
      jujuActions.updateSelectedApplications({
        selectedApplications: {},
      }),
    );
  });
});
