import type { Controllers, ModelData } from "store/juju/types";
import {
  extractCloudName,
  extractCredentialName,
} from "store/juju/utils/models";

export const JAAS_CONTROLLER_UUID = "a030379a-940f-4760-8fcf-3062b41a04e7";

export const getCloudName = (model: ModelData) =>
  extractCloudName(model.model["cloud-tag"]);

export const getRegion = (model: ModelData) => model.model.region;

export const getCredential = (model: ModelData) =>
  extractCredentialName(model.info?.["cloud-credential-tag"]);

export const getControllerUUID = (model: ModelData) =>
  model.info?.["controller-uuid"];

export const getControllerName = (
  model: ModelData,
  controllers?: Controllers | null
) => {
  const controllerUUID = getControllerUUID(model);
  if (controllerUUID === JAAS_CONTROLLER_UUID) {
    return "JAAS";
  }
  let controllerName: string | null = null;
  Object.entries(controllers ?? {}).some(
    (controller) =>
      !!controller[1].some((controller) => {
        if ("uuid" in controller && controllerUUID === controller.uuid) {
          controllerName = controller.path;
        }
        return !!controllerName;
      })
  );
  return controllerName ?? controllerUUID;
};

export const getLastUpdated = (model: ModelData) => {
  // .slice(2) here will make the year 2 characters instead of 4
  // e.g. 2021-01-01 becomes 21-01-01
  return model.info?.status?.since?.split("T")[0].slice(2);
};

/**
  Returns the model cloud and region data formatted as {cloud}/{region}.
  @param model The model data
  @returns The formatted cloud and region data.
*/
export function generateCloudAndRegion(model: ModelData) {
  return `${getCloudName(model)}/${getRegion(model)}`;
}
