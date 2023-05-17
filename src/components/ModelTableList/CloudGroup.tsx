import { MainTable } from "@canonical/react-components";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import type { ReactNode } from "react";
import { useSelector } from "react-redux";

import Status from "components/Status";
import { useQueryParams } from "hooks/useQueryParams";
import {
  getActiveUsers,
  getControllerData,
  getGroupedByCloudAndFilteredModelData,
} from "store/juju/selectors";
import type { Filters } from "store/juju/utils/models";
import {
  canAdministerModelAccess,
  extractOwnerName,
  getModelStatusGroupData,
} from "store/juju/utils/models";

import AccessButton from "./AccessButton/AccessButton";
import ModelDetailsLink from "./ModelDetailsLink";
import ModelSummary from "./ModelSummary";
import {
  getControllerName,
  getCredential,
  getLastUpdated,
  getRegion,
} from "./shared";

type Props = {
  filters: Filters;
};

export enum TestId {
  CLOUD_GROUP = "cloud-group",
}

/**
  Generates the table headers for the cloud grouped table
  @param cloud The title of the table.
  @param count The number of elements in the status.
  @returns The headers for the table.
*/
function generateCloudTableHeaders(cloud: string, count: number) {
  return [
    {
      content: <Status status={cloud} count={count} />,
      sortKey: "name",
    },
    { content: "", sortKey: "summary" }, // The unit/machines/apps counts
    { content: "Owner", sortKey: "owner" },
    { content: "Status", sortKey: "status" },
    { content: "Region", sortKey: "region" },
    { content: "Credential", sortKey: "credential" },
    { content: "Controller", sortKey: "controller" },
    {
      content: "Last Updated",
      sortKey: "lastUpdated",
      className: "u-align--right",
    },
    {
      content: "",
      sortKey: "",
      className: "sm-screen-access-header",
    },
  ];
}

export default function CloudGroup({ filters }: Props) {
  const activeUsers = useSelector(getActiveUsers);
  const controllers = useSelector(getControllerData);

  const groupedAndFilteredData = useSelector(
    getGroupedByCloudAndFilteredModelData(filters)
  );

  const [, setPanelQs] = useQueryParams({
    model: null,
    panel: null,
  });

  const cloudTables: ReactNode[] = [];
  for (const cloud in groupedAndFilteredData) {
    const cloudModels: MainTableRow[] = [];
    Object.values(groupedAndFilteredData[cloud]).forEach((model) => {
      const activeUser = activeUsers[model.uuid];
      const { highestStatus } = getModelStatusGroupData(model);
      const owner = model.info
        ? extractOwnerName(model.info["owner-tag"])
        : null;
      const region = getRegion(model);
      const credential = getCredential(model);
      const controller = getControllerName(model, controllers);
      const lastUpdated = getLastUpdated(model);
      const row = {
        "data-testid": `model-uuid-${model?.uuid}`,
        columns: [
          {
            "data-testid": "column-name",
            content: model.info ? (
              <ModelDetailsLink
                modelName={model.info.name}
                ownerTag={model.info?.["owner-tag"]}
              >
                {model.info.name}
              </ModelDetailsLink>
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
            "data-testid": "column-owner",
            content: owner,
          },
          {
            "data-testid": "column-status",
            content: <Status status={highestStatus} />,
            className: "u-capitalise",
          },
          {
            "data-testid": "column-region",
            content: region,
          },
          {
            "data-testid": "column-credential",
            content: credential,
          },
          {
            "data-testid": "column-controller",
            content: controller,
          },
          // We're not currently able to get a last-accessed or updated from JAAS.
          {
            "data-testid": "column-updated",
            content: (
              <>
                {model?.info
                  ? canAdministerModelAccess(activeUser, model.info.users) && (
                      <AccessButton
                        setPanelQs={setPanelQs}
                        modelName={model.info.name}
                      />
                    )
                  : null}
                <span className="model-access-alt">{lastUpdated}</span>
              </>
            ),
            className: `u-align--right lrg-screen-access-cell ${
              canAdministerModelAccess(activeUser, model?.info?.users)
                ? "has-permission"
                : ""
            }`,
          },
          {
            content: (
              <>
                {model?.info
                  ? canAdministerModelAccess(activeUser, model.info.users) && (
                      <AccessButton
                        setPanelQs={setPanelQs}
                        modelName={model.info.name}
                      />
                    )
                  : null}
              </>
            ),
            className: "sm-screen-access-cell",
          },
        ],
        sortData: {
          name: model.info?.name,
          owner,
          status: highestStatus,
          region,
          credential,
          controller,
          lastUpdated,
        },
      };
      cloudModels.push(row);
    });

    cloudTables.push(
      <MainTable
        key={cloud}
        headers={generateCloudTableHeaders(cloud, cloudModels.length)}
        rows={cloudModels}
        sortable
      />
    );
  }
  return (
    <div
      className="cloud-group u-overflow--auto"
      data-testid={TestId.CLOUD_GROUP}
    >
      {cloudTables}
    </div>
  );
}
