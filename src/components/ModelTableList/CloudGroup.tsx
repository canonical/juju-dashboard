import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { MainTable } from "@canonical/react-components";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";

import { useQueryParams } from "hooks/useQueryParams";
import {
  getModelStatusGroupData,
  extractOwnerName,
  canAdministerModelAccess,
  Filters,
} from "store/juju/utils/models";
import { generateStatusElement } from "components/utils";

import {
  getActiveUsers,
  getControllerData,
  getGroupedByCloudAndFilteredModelData,
} from "store/juju/selectors";

import {
  generateModelDetailsLink,
  getStatusValue,
  generateAccessButton,
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
      content: generateStatusElement(cloud, count, false),
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
      const region = getStatusValue(model, "region");
      const credential = getStatusValue(model, "cloud-credential-tag");
      const controller = getStatusValue(model, "controllerName", controllers);
      const statusSince = getStatusValue(model, "status.since");
      const lastUpdated =
        typeof statusSince === "string" ? statusSince.slice(2) : statusSince;
      const row = {
        "data-testid": `model-uuid-${model?.uuid}`,
        columns: [
          {
            "data-testid": "column-name",
            content: model.info
              ? generateModelDetailsLink(
                  model.info.name,
                  model.info && model.info["owner-tag"],
                  model.info.name
                )
              : null,
          },
          {
            "data-testid": "column-summary",
            content: getStatusValue(
              model,
              "summary",
              model.info?.["owner-tag"]
            ),
            className: "u-overflow--visible",
          },
          {
            "data-testid": "column-owner",
            content: owner,
          },
          {
            "data-testid": "column-status",
            content: generateStatusElement(highestStatus),
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
                  ? canAdministerModelAccess(activeUser, model.info.users) &&
                    generateAccessButton(setPanelQs, model.info.name)
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
                  ? canAdministerModelAccess(activeUser, model.info.users) &&
                    generateAccessButton(setPanelQs, model.info.name)
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
