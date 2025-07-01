import { MainTable } from "@canonical/react-components";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import type { ReactNode } from "react";

import ModelDetailsLink from "components/ModelDetailsLink";
import Status from "components/Status";
import TruncatedTooltip from "components/TruncatedTooltip";
import {
  getActiveUsers,
  getControllerData,
  getGroupedByOwnerAndFilteredModelData,
} from "store/juju/selectors";
import type { Filters } from "store/juju/utils/models";
import { getModelStatusGroupData } from "store/juju/utils/models";
import { useAppSelector } from "store/store";

import AccessColumn from "../AccessColumn";
import CloudCell from "../CloudCell/CloudCell";
import ModelSummary from "../ModelSummary";
import {
  generateCloudAndRegion,
  generateTableHeaders,
  getControllerName,
  getCredential,
  getLastUpdated,
} from "../shared";

import { TestId } from "./types";

type Props = {
  filters: Filters;
};

export default function OwnerGroup({ filters }: Props) {
  const groupedAndFilteredData = useAppSelector((state) =>
    getGroupedByOwnerAndFilteredModelData(state, filters),
  );
  const activeUsers = useAppSelector(getActiveUsers);
  const controllers = useAppSelector(getControllerData);

  const ownerTables: ReactNode[] = [];
  for (const owner in groupedAndFilteredData) {
    const ownerModels: MainTableRow[] = [];
    Object.values(groupedAndFilteredData[owner]).forEach((model) => {
      const activeUser = activeUsers[model.uuid];
      const { highestStatus } = getModelStatusGroupData(model);
      const cloud = <CloudCell model={model} />;
      const credential = getCredential(model);
      const controller = getControllerName(model, controllers);
      const lastUpdated = getLastUpdated(model);
      const row = {
        "data-testid": `model-uuid-${model?.uuid}`,
        columns: [
          {
            "data-testid": "column-name",
            content: model.info ? (
              <TruncatedTooltip message={model.info.name}>
                <ModelDetailsLink
                  modelName={model.info.name}
                  ownerTag={model.info?.["owner-tag"]}
                >
                  {model.info.name}
                </ModelDetailsLink>
              </TruncatedTooltip>
            ) : null,
          },
          {
            "data-testid": "column-summary",
            content: (
              <ModelSummary
                modelData={model}
                ownerTag={model.info?.["owner-tag"]}
              />
            ),
            className: "u-overflow--visible",
          },
          {
            "data-testid": "column-status",
            content: <Status status={highestStatus} />,
            className: "u-capitalise",
          },
          {
            "data-testid": "column-cloud",
            content: (
              <TruncatedTooltip message={generateCloudAndRegion(model)}>
                {cloud}
              </TruncatedTooltip>
            ),
          },
          {
            "data-testid": "column-credential",
            content: (
              <TruncatedTooltip message={credential}>
                {credential}
              </TruncatedTooltip>
            ),
          },
          {
            "data-testid": "column-controller",
            content: (
              <TruncatedTooltip message={controller}>
                {controller}
              </TruncatedTooltip>
            ),
          },
          {
            "data-testid": "column-updated",
            content: (
              <AccessColumn
                modelName={model?.info?.name}
                activeUser={activeUser}
              >
                {lastUpdated}
              </AccessColumn>
            ),
            className: "u-align--right lrg-screen-access-cell",
          },
        ],
        sortData: {
          name: model.info?.name,
          status: highestStatus,
          cloud,
          credential,
          controller,
          lastUpdated,
        },
      };
      ownerModels.push(row);
    });

    ownerTables.push(
      <MainTable
        key={owner}
        headers={generateTableHeaders(owner, ownerModels.length, {
          showCloud: true,
          showStatus: true,
        })}
        rows={ownerModels}
        sortable
        className="p-main-table"
      />,
    );
  }
  return (
    <div className="owners-group" data-testid={TestId.OWNER_GROUP}>
      {ownerTables}
    </div>
  );
}
