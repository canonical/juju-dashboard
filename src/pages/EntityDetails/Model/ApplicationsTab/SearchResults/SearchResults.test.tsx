import { screen, within } from "@testing-library/react";

import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { generalStateFactory } from "testing/factories/general";
import { applicationStatusFactory } from "testing/factories/juju/ClientV7";
import { modelDataFactory } from "testing/factories/juju/juju";
import { createStore, renderComponent } from "testing/utils";

import SearchResults from "./SearchResults";

describe("SearchResults", () => {
  let state: RootState;
  const path = "/models/:qualifier/:modelName";
  const url = "/models/test@external/test-model";

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({}),
      juju: jujuStateFactory.build({
        models: {
          test123: {
            name: "test-model",
            uuid: "test123",
            qualifier: "test@external",
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
          mysql1: applicationStatusFactory.build({
            charm: "ch:mysql",
          }),
          mysql2: applicationStatusFactory.build({
            charm: "ch:mysql",
          }),
          db2: applicationStatusFactory.build(),
          db1: applicationStatusFactory.build(),
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
      mysql1: applicationStatusFactory.build(),
      mysql2: applicationStatusFactory.build(),
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
