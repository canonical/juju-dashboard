import { useSelector } from "react-redux";
import MainTable from "@canonical/react-components/dist/components/MainTable";

import awsLogo from "static/images/logo/cloud/aws.svg";
import azureLogo from "static/images/logo/cloud/azure.svg";
import gceLogo from "static/images/logo/cloud/gce.svg";
import kubernetesLogo from "static/images/logo/cloud/kubernetes.svg";

import {
  generateStatusElement,
  getModelStatusGroupData,
  extractOwnerName,
} from "app/utils/utils";

import { getGroupedByStatusAndFilteredModelData } from "app/selectors";

import { generateModelDetailsLink, getStatusValue } from "./shared";

/**
  Generates the table headers for the supplied table label.
  @param {String} label The title of the table.
  @param {Number} count The number of elements in the status.
  @returns {Array} The headers for the table.
*/
function generateStatusTableHeaders(label, count) {
  return [
    {
      content: generateStatusElement(label, count),
      sortKey: "name",
    },
    { content: "", sortKey: "summary" }, // The unit/machines/apps counts
    { content: "Owner", sortKey: "owner" },
    { content: "Cloud/Region", sortKey: "cloud" },
    { content: "Credential", sortKey: "credential" },
    { content: "Controller", sortKey: "controller" },
    {
      content: "Last Updated",
      sortKey: "lastUpdated",
      className: "u-align--right",
    },
  ];
}

/**
  Generates the warning message for the model name cell.
  @param {Object} model The full model data.
  @return {Object} The react component for the warning message.
*/
const generateWarningMessage = (model) => {
  const { messages } = getModelStatusGroupData(model);
  const title = messages.join("; ");
  const link = generateModelDetailsLink(
    model.model.name,
    model?.info?.ownerTag,
    title
  );
  return (
    <span className="model-table-list_error-message" title={title}>
      {link}
    </span>
  );
};

/**
  Generates the model name cell.
  @param {Object} model The model data.
  @param {String} groupLabel The status group the model belongs in.
    e.g. blocked, alert, running
  @returns {Object} The React element for the model name cell.
*/
const generateModelNameCell = (model, groupLabel) => {
  const link = generateModelDetailsLink(
    model.model.name,
    model.info && model.info["owner-tag"],
    model.model.name
  );
  return (
    <>
      <div>{link}</div>
      {groupLabel === "blocked" ? generateWarningMessage(model) : null}
    </>
  );
};

/**
  Generates the cloud and region info from model data.
  @param {Object} model The model data.
  @returns {Object} The React element for the model cloud and region cell.
*/
const generateCloudCell = (model) => {
  let provider = model?.info?.["provider-type"];
  let logo = null;
  switch (provider) {
    case "ec2":
      logo = (
        <img
          src={awsLogo}
          alt="AWS logo"
          className="p-table__logo"
          data-test="provider-logo"
        />
      );
      break;
    case "gce":
      logo = (
        <img
          src={gceLogo}
          alt="Google Cloud Platform logo"
          className="p-table__logo"
          data-test="provider-logo"
        />
      );
      break;
    case "azure":
      logo = (
        <img
          src={azureLogo}
          alt="Azure logo"
          className="p-table__logo"
          data-test="provider-logo"
        />
      );
      break;
    case "kubernetes":
      logo = (
        <img
          src={kubernetesLogo}
          alt="Kubernetes logo"
          className="p-table__logo"
          data-test="provider-logo"
        />
      );
      break;
  }

  const cloud = (
    <>
      {logo}
      {getStatusValue(model, "cloud-tag")}/{getStatusValue(model, "region")}
    </>
  );

  return cloud;
};

/**
  Returns the model info and statuses in the proper format for the table data.
  @param {Object} groupedModels The models grouped by state
  @returns {Object} The formatted table data.
*/
function generateModelTableDataByStatus(groupedModels) {
  const modelData = {
    blockedRows: [],
    alertRows: [],
    runningRows: [],
  };

  Object.keys(groupedModels).forEach((groupLabel) => {
    const models = groupedModels[groupLabel];
    models.forEach((model) => {
      let owner = "";
      if (model.info) {
        owner = extractOwnerName(model.info["owner-tag"]);
      }
      const cloud = generateCloudCell(model);
      const credential = getStatusValue(model.info, "cloud-credential-tag");
      const controller = getStatusValue(model.info, "controllerName");
      const lastUpdated = getStatusValue(model.info, "status.since");
      modelData[`${groupLabel}Rows`].push({
        "data-test-model-uuid": model?.uuid,
        columns: [
          {
            "data-test-column": "name",
            content: generateModelNameCell(model, groupLabel),
          },
          {
            "data-test-column": "summary",
            content: getStatusValue(model, "summary"),
            className: "u-overflow--visible",
          },
          {
            "data-test-column": "owner",
            content: <>{owner}</>,
          },
          {
            "data-test-column": "cloud",
            content: cloud,
          },
          {
            "data-test-column": "credential",
            content: credential,
          },
          {
            "data-test-column": "controller",
            content: controller,
          },
          // We're not currently able to get a last-accessed or updated from JAAS.
          {
            "data-test-column": "updated",
            content: lastUpdated,
            className: "u-align--right",
          },
        ],
        sortData: {
          name: model.model.name,
          owner,
          cloud,
          credential,
          controller,
          lastUpdated,
        },
      });
    });
  });

  return modelData;
}

export default function StatusGroup({ filters }) {
  const groupedAndFilteredData = useSelector(
    getGroupedByStatusAndFilteredModelData(filters)
  );

  const {
    blockedRows,
    alertRows,
    runningRows,
  } = generateModelTableDataByStatus(groupedAndFilteredData);

  const emptyStateMsg = "There are no models with this status";

  return (
    <div className="status-group u-overflow--scroll">
      {blockedRows.length ? (
        <MainTable
          headers={generateStatusTableHeaders("Blocked", blockedRows.length)}
          rows={blockedRows}
          sortable
          emptyStateMsg={emptyStateMsg}
        />
      ) : null}
      {alertRows.length ? (
        <MainTable
          headers={generateStatusTableHeaders("Alert", alertRows.length)}
          rows={alertRows}
          sortable
          emptyStateMsg={emptyStateMsg}
        />
      ) : null}
      {runningRows.length ? (
        <MainTable
          headers={generateStatusTableHeaders("Running", runningRows.length)}
          rows={runningRows}
          sortable
          emptyStateMsg={emptyStateMsg}
        />
      ) : null}
    </div>
  );
}
