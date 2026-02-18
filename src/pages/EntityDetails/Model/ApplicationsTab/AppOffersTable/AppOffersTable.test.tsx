import { screen, within } from "@testing-library/react";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { applicationOfferStatusFactory } from "testing/factories/juju/ClientV7";
import { modelInfoFactory } from "testing/factories/juju/ModelManagerV9";
import { modelDataFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import AppOffersTable from "./AppOffersTable";
import { Label } from "./types";

describe("ApplicationsTab", () => {
  let state: RootState;
  const path = "/models/:qualifier/:modelName";
  const url = "/models/test@external/test-model";

  beforeEach(() => {
    state = rootStateFactory.build({});
  });

  it("should show empty message", () => {
    renderComponent(<AppOffersTable />, { path, url, state });
    expect(within(screen.getByRole("grid")).getAllByRole("row")).toHaveLength(
      1,
    );
    expect(screen.getByText(Label.NO_OFFERS)).toBeInTheDocument();
  });

  it("should show application offers", () => {
    state.juju.modelData = {
      test123: modelDataFactory.build({
        info: modelInfoFactory.build({
          uuid: "test123",
          name: "test-model",
        }),
        offers: {
          db: applicationOfferStatusFactory.build({
            endpoints: {
              mockEndpoint: {
                interface: "mockInterface",
                limit: 1,
                name: "mockName",
                role: "mockRole",
              },
            },
          }),
        },
      }),
    };
    renderComponent(<AppOffersTable />, { path, url, state });
    const rows = within(screen.getByRole("grid")).getAllByRole("row");
    expect(rows).toHaveLength(2);
    const headers = within(rows[0]).getAllByRole("columnheader");
    expect(headers).toHaveLength(4);
    expect(headers[0]).toHaveTextContent("offers");
    expect(headers[1]).toHaveTextContent("interface");
    expect(headers[2]).toHaveTextContent("connection");
    expect(headers[3]).toHaveTextContent("offer url");
    const appOffersRow = within(rows[1]).getAllByRole("gridcell");
    expect(appOffersRow).toHaveLength(4);
    expect(appOffersRow[0]).toHaveTextContent("db");
    expect(appOffersRow[1]).toHaveTextContent("mockEndpoint");
    expect(appOffersRow[2]).toHaveTextContent("1 / 2");
    expect(appOffersRow[3]).toHaveTextContent("-");
  });
});
