import awsLogo from "static/images/logo/cloud/aws.svg";
import azureLogo from "static/images/logo/cloud/azure.svg";
import gceLogo from "static/images/logo/cloud/gce.svg";
import kubernetesLogo from "static/images/logo/cloud/kubernetes.svg";

import { Link } from "react-router-dom";
import { extractCloudName, extractCredentialName } from "app/utils/utils";

/**
  Generates the model details link for the table cell. If no ownerTag can be
  provided then it'll return raw text for the model name.
  @param {String} modelName The name of the model.
  @param {String} ownerTag The ownerTag of the model.
  @param {String} label The contents of the link.
  @returns {Object} The React component for the link.
*/
export function generateModelDetailsLink(modelName, ownerTag, label) {
  // Because we get some data at different times based on the multiple API calls
  // we need to check for their existence and supply reasonable fallbacks if it
  // isn't available. Once we have a single API call for all the data this check
  // can be removed.
  if (!ownerTag) {
    // We will just return an unclickable name until we get an owner tag as
    // without it we can't create a reliable link.
    return label;
  }
  // If the owner isn't the logged in user then we need to use the
  // fully qualified path name.
  const modelDetailsPath = `/models/${ownerTag.replace(
    "user-",
    ""
  )}/${modelName}`;
  return <Link to={modelDetailsPath}>{label}</Link>;
}

/**
  Used to fetch the values from status as it won't be defined when the
  modelInfo data is.
  @param {Object|undefined} status The status for the model.
  @param {String} key The key to fetch.
  @returns {String} The computed value for the requested field if defined, or
    an empty string.
*/
export function getStatusValue(status, key) {
  let returnValue = "";
  if (typeof status === "object" && status !== null) {
    switch (key) {
      case "summary":
        const applicationKeys = Object.keys(status.applications);
        const applicationCount = applicationKeys.length;
        const machineCount = Object.keys(status.machines).length;
        const unitCount = applicationKeys.reduce((prev, key) => {
          const units = status.applications[key].units || {};
          return prev + Object.keys(units).length;
        }, 0);

        returnValue = (
          <>
            <div className="u-flex">
              <div
                className="u-flex--block p-tooltip--top-center"
                aria-describedby="tp-cntr"
              >
                <div className="has-icon">
                  <i className="p-icon--applications"></i>
                  <span>{applicationCount}</span>
                </div>
                <span
                  className="p-tooltip__message"
                  role="tooltip"
                  id="tp-cntr"
                >
                  Applications
                </span>
              </div>
              <div
                className="u-flex--block p-tooltip--top-center"
                aria-describedby="tp-cntr"
              >
                <div className="has-icon">
                  <i className="p-icon--units"></i>
                  <span>{unitCount}</span>
                </div>
                <span
                  className="p-tooltip__message"
                  role="tooltip"
                  id="tp-cntr"
                >
                  Units
                </span>
              </div>
              <div
                className="u-flex--block p-tooltip--top-center"
                aria-describedby="tp-cntr"
              >
                <div className="has-icon">
                  <i className="p-icon--machines"></i>
                  <span>{machineCount}</span>
                </div>
                <span
                  className="p-tooltip__message"
                  role="tooltip"
                  id="tp-cntr"
                >
                  Machines
                </span>
              </div>
            </div>
          </>
        );
        break;
      case "cloud-tag":
        returnValue = extractCloudName(status.model["cloud-tag"]);
        break;
      case "region":
        returnValue = status.model.region;
        break;
      case "cloud-credential-tag":
        returnValue = extractCredentialName(status["cloud-credential-tag"]);
        break;
      case "controllerUuid":
        returnValue = status["controller-uuid"];
        break;
      case "controllerName":
        returnValue = status.controllerName;
        break;
      case "status.since":
        returnValue = status.status.since?.split("T")[0];
        break;
      default:
        console.log(`unsupported status value key: ${key}`);
        break;
    }
  }
  return returnValue;
}

/**
  Generates the cloud and region info from model data.
  @param {Object} model The model data.
  @returns {Object} The React element for the model cloud and region cell.
*/
export function generateCloudCell(model) {
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
      {generateCloudAndRegion(model)}
    </>
  );

  return cloud;
}

/**
  Returns the model cloud and region data formatted as {cloud}/{region}.
  @param {Object} model The model data
  @returns {String} The formatted cloud and region data.
*/
export function generateCloudAndRegion(model) {
  return `${getStatusValue(model, "cloud-tag")}/${getStatusValue(
    model,
    "region"
  )}`;
}

/**
  Returns the model access button or an alternative value
  @param {Function} setPanelQs A function to set query strings
  @param {String} modelName the name of the model
  @returns {Object} The markup for the table cell
*/
export function generateAccessButton(setPanelQs, modelName) {
  return (
    <>
      <button
        onClick={() => {
          setPanelQs({
            model: modelName,
            panel: "share-model",
          });
        }}
        className="model-access  p-button--neutral is-dense"
      >
        Access
      </button>
    </>
  );
}
