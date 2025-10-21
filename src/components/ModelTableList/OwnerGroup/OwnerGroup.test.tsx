import { screen, within } from "@testing-library/react";

import { ModelActionsLabel } from "components/ModelActions";
import type { RootState } from "store/store";
import {
  configFactory,
  generalStateFactory,
  authUserInfoFactory,
} from "testing/factories/general";
import { modelStatusInfoFactory } from "testing/factories/juju/ClientV6";
import { modelUserInfoFactory } from "testing/factories/juju/ModelManagerV9";
import {
  jujuStateFactory,
  modelDataFactory,
  modelDataInfoFactory,
  modelListInfoFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import OwnerGroup from "./OwnerGroup";

describe("OwnerGroup", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              name: "test1",
              "controller-uuid": "controller123",
              "cloud-tag": "cloud-aws",
              "owner-tag": "user-eggman@external",
              uuid: "abc123",
            }),
            model: modelStatusInfoFactory.build({
              "cloud-tag": "cloud-aws",
              name: "test1",
            }),
            uuid: "abc123",
          }),
          def456: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              "cloud-tag": "cloud-aws",
              "owner-tag": "user-pizza@external",
            }),
            model: modelStatusInfoFactory.build({
              "cloud-tag": "cloud-aws",
            }),
          }),
          ghi789: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              "cloud-tag": "cloud-google",
              "owner-tag": "user-eggman@external",
            }),
            model: modelStatusInfoFactory.build({
              "cloud-tag": "cloud-google",
            }),
          }),
        },
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            name: "test1",
            wsControllerURL: "wss://jimm.jujucharms.com/api",
          }),
        },
      }),
    });
  });

  it("by default, renders no tables with no data", () => {
    renderComponent(<OwnerGroup filters={{}} />);
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("displays model data grouped by owner from the redux store", () => {
    renderComponent(<OwnerGroup filters={{}} />, { state });
    const tables = screen.getAllByRole("grid");
    expect(tables.length).toBe(2);
    expect(within(tables[0]).getAllByRole("row").length).toEqual(3);
    expect(within(tables[1]).getAllByRole("row").length).toEqual(2);
  });

  it("fetches filtered data if filters supplied", () => {
    const filters = {
      cloud: ["aws"],
    };
    renderComponent(<OwnerGroup filters={filters} />, { state });
    expect(screen.getAllByRole("row").length).toBe(4);
  });

  it("model actions menu is present in owners group", () => {
    state.general = generalStateFactory.build({
      config: configFactory.build({
        isJuju: true,
        controllerAPIEndpoint: "wss://jimm.jujucharms.com/api",
      }),
      controllerConnections: {
        "wss://jimm.jujucharms.com/api": {
          user: authUserInfoFactory.build({
            identity: "user-eggman@external",
          }),
        },
      },
    });
    state.juju.modelData.abc123.info = modelDataInfoFactory.build({
      "cloud-tag": "cloud-aws",
      "controller-uuid": "controller123",
      name: "test1",
      users: [
        modelUserInfoFactory.build({
          user: "eggman@external",
          access: "admin",
        }),
      ],
    });
    const filters = {
      cloud: ["aws"],
    };
    renderComponent(<OwnerGroup filters={filters} />, { state });
    const [_header, firstContentRow] = screen.getAllByRole("row");
    expect(
      within(firstContentRow).getByRole("button", {
        name: ModelActionsLabel.TOGGLE,
      }),
    ).toBeInTheDocument();
    expect(within(firstContentRow).getAllByRole("gridcell")[6]).toHaveClass(
      "lrg-screen-access-cell",
    );
  });
});
