import { screen, within } from "@testing-library/react";
import { vi } from "vitest";

import * as appSelectors from "store/juju/selectors";
import type { RootState } from "store/store";
import {
  controllerFactory,
  jujuStateFactory,
  modelDataFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import { TestId as CloudTestId } from "./CloudGroup";
import ModelTableList from "./ModelTableList";
import { TestId as OwnerTestId } from "./OwnerGroup";
import { TestId as StatusTestId } from "./StatusGroup";

describe("ModelTableList", () => {
  let state: RootState;
  const tables = [
    ["status", StatusTestId.STATUS_GROUP],
    ["owner", OwnerTestId.OWNER_GROUP],
    ["cloud", CloudTestId.CLOUD_GROUP],
  ];

  beforeEach(() => {
    state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelDataFactory.build({
            uuid: "abc123",
          }),
        },
      }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("by default, renders the status table", () => {
    renderComponent(<ModelTableList filters={{}} groupedBy="" />, { state });
    expect(screen.getByTestId(StatusTestId.STATUS_GROUP)).toBeInTheDocument();
    expect(
      screen.queryByTestId(OwnerTestId.OWNER_GROUP),
    ).not.toBeInTheDocument();
  });

  tables.forEach((table) => {
    it(`displays all data from redux store when grouping by ${table[0]}`, () => {
      renderComponent(<ModelTableList filters={{}} groupedBy={table[0]} />);
      expect(screen.getByTestId(table[1])).toBeInTheDocument();
      tables.forEach((otherTable) => {
        if (otherTable[0] !== table[0]) {
          expect(screen.queryByTestId(otherTable[1])).not.toBeInTheDocument();
        }
      });
    });
  });

  it("passes the filters to the group components", () => {
    const getGroupedByStatusAndFilteredModelData = vi.spyOn(
      appSelectors,
      "getGroupedByStatusAndFilteredModelData",
    );
    const tables = [
      { groupedBy: "status", component: StatusTestId.STATUS_GROUP },
      { groupedBy: "status", component: StatusTestId.STATUS_GROUP },
      { groupedBy: "status", component: StatusTestId.STATUS_GROUP },
    ];
    const filters = { cloud: ["aws"] };
    tables.forEach((table) => {
      renderComponent(
        <ModelTableList groupedBy={table.groupedBy} filters={filters} />,
      );
      expect(getGroupedByStatusAndFilteredModelData).toHaveBeenCalledWith(
        filters,
      );
    });
  });

  it("renders the controller name as UUID if unknown", () => {
    const unknownUUID = "unknown-6245-2134-1325-ee33ee55dd66";
    const testModelUUID = "abc123";
    const modelInfo = state.juju.modelData[testModelUUID].info;
    if (modelInfo) {
      modelInfo["controller-uuid"] = unknownUUID;
    }
    renderComponent(<ModelTableList filters={{}} groupedBy="" />, { state });
    const row = screen.getByTestId(`model-uuid-${testModelUUID}`);
    expect(within(row).getByTestId("column-controller")).toHaveTextContent(
      unknownUUID,
    );
  });

  it("renders the controller name if known controller", () => {
    // override existing data mock while using as much real content as possible.
    const knownUUID = "086f0bf8-da79-4ad4-8d73-890721332c8b";
    const testModelUUID = "abc123";
    state.juju.controllers = {
      "wss://jimm.jujucharms.com/api": [
        controllerFactory.build({
          path: "admins/1-eu-west-1-aws-jaas",
          uuid: knownUUID,
        }),
      ],
    };
    const modelDataInfo = state.juju.modelData?.[testModelUUID].info;
    if (modelDataInfo) {
      modelDataInfo["controller-uuid"] = knownUUID;
    }
    renderComponent(<ModelTableList filters={{}} groupedBy="" />, { state });
    const row = screen.getByTestId(`model-uuid-${testModelUUID}`);
    expect(within(row).getByTestId("column-controller")).toHaveTextContent(
      "admins/1-eu-west-1-aws-jaas",
    );
  });
});
