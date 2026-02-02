import { screen, within } from "@testing-library/react";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { remoteApplicationStatusFactory } from "testing/factories/juju/ClientV7";
import { modelInfoFactory } from "testing/factories/juju/ModelManagerV9";
import { modelDataFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import RemoteAppsTable from "./RemoteAppsTable";
import { Label } from "./types";

describe("ApplicationsTab", () => {
  let state: RootState;
  const path = "/models/:userName/:modelName";
  const url = "/models/test@external/test-model";

  beforeEach(() => {
    state = rootStateFactory.build({});
  });

  it("should show empty message", () => {
    renderComponent(<RemoteAppsTable />, { path, url, state });
    expect(within(screen.getByRole("grid")).getAllByRole("row")).toHaveLength(
      1,
    );
    expect(screen.getByText(Label.NO_REMOTE_APPS)).toBeInTheDocument();
  });

  it("should show remote applications", () => {
    state.juju.modelData = {
      test123: modelDataFactory.build({
        info: modelInfoFactory.build({
          uuid: "test123",
          name: "test-model",
        }),
        "remote-applications": {
          mysql: remoteApplicationStatusFactory.build({
            relations: { mockRelation: [] },
          }),
        },
      }),
    };
    renderComponent(<RemoteAppsTable />, { path, url, state });
    const rows = within(screen.getByRole("grid")).getAllByRole("row");
    expect(rows).toHaveLength(2);
    const headers = within(rows[0]).getAllByRole("columnheader");
    expect(headers).toHaveLength(5);
    expect(headers[0]).toHaveTextContent("remote apps");
    expect(headers[1]).toHaveTextContent("status");
    expect(headers[2]).toHaveTextContent("interface");
    expect(headers[3]).toHaveTextContent("offer url");
    expect(headers[4]).toHaveTextContent("store");
    const remoteAppsRow = within(rows[1]).getAllByRole("gridcell");
    expect(remoteAppsRow).toHaveLength(5);
    expect(remoteAppsRow[0]).toHaveTextContent("mysql");
    expect(remoteAppsRow[1]).toHaveTextContent("active");
    expect(remoteAppsRow[2]).toHaveTextContent("mockRelation");
    expect(remoteAppsRow[3]).toHaveTextContent(
      "juju-controller:admin/cmr.mysql",
    );
    expect(remoteAppsRow[4]).toHaveTextContent("-");
  });
});
