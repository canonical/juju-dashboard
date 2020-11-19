import {
  extractCloudName,
  extractOwnerName,
  extractCredentialName,
} from "app/utils";

export default function useModelAttributes(modelData) {
  const clouds = [];
  const regions = [];
  const owners = [];
  const credentials = [];

  // Loop the model data and pull out the available filters
  Object.values(modelData).forEach((model) => {
    if (!model.info) {
      return;
    }
    // Extract cloud filters
    const cloudFilter = extractCloudName(model.info.cloudTag);
    if (!clouds.includes(cloudFilter)) clouds.push(cloudFilter);

    // Extract region filters
    const regionFilter = model.info.cloudRegion;
    if (!regions.includes(regionFilter)) regions.push(regionFilter);

    // Extract owner filters
    const ownerFilter = extractOwnerName(model.info.ownerTag);
    if (!owners.includes(ownerFilter)) owners.push(ownerFilter);

    // Extract credential filters
    const credentialFilter = extractCredentialName(
      model.info.cloudCredentialTag
    );
    if (!credentials.includes(credentialFilter))
      credentials.push(credentialFilter);
  });

  return { clouds, regions, owners, credentials };
}
