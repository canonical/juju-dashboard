import type { ModelDataList } from "store/juju/types";
import {
  extractCloudName,
  extractOwnerName,
  extractCredentialName,
} from "store/juju/utils/models";

export default function useModelAttributes(modelData: ModelDataList | null) {
  const clouds: string[] = [];
  const regions: string[] = [];
  const owners: string[] = [];
  const credentials: string[] = [];

  if (modelData) {
    // Loop the model data and pull out the available filters
    Object.values(modelData).forEach((model) => {
      if (!model.info) {
        // It's possible the info hasn't loaded yet.
        return;
      }
      // Extract cloud filters
      const cloudFilter = extractCloudName(model.info["cloud-tag"]);
      if (!clouds.includes(cloudFilter)) clouds.push(cloudFilter);

      // Extract region filters
      const regionFilter = model.info["cloud-region"];
      if (regionFilter && !regions.includes(regionFilter)) {
        regions.push(regionFilter);
      }

      // Extract owner filters
      const ownerFilter = extractOwnerName(model.info["owner-tag"]);
      if (!owners.includes(ownerFilter)) owners.push(ownerFilter);

      // Extract credential filters
      const credentialFilter = extractCredentialName(
        model.info["cloud-credential-tag"],
      );
      if (!credentials.includes(credentialFilter))
        credentials.push(credentialFilter);
    });
  }

  return { clouds, regions, owners, credentials };
}
