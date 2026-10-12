import type { ModelData } from "store/juju/types";
import {
  extractCloudName,
  extractCredentialName,
} from "store/juju/utils/models";

export const getCloudName = (model: ModelData): string =>
  extractCloudName(model.model["cloud-tag"]);

export const getRegion = (model: ModelData): string | undefined =>
  model.model.region;

export const getCredential = (model: ModelData): string =>
  extractCredentialName(model.info?.["cloud-credential-tag"]);

/**
  Returns the model cloud and region data formatted as {cloud}/{region}.
  @param model The model data
  @returns The formatted cloud and region data.
*/
export function generateCloudAndRegion(model: ModelData): string {
  return `${getCloudName(model)}/${getRegion(model)}`;
}
