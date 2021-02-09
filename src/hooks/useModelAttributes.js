import {
  extractCloudName,
  extractOwnerName,
  extractCredentialName,
} from "app/utils/utils";

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
    const cloudFilter = extractCloudName(model.info["cloud-tag"]);
    if (!clouds.includes(cloudFilter)) clouds.push(cloudFilter);

    // Extract region filters
    const regionFilter = model.info["cloud-region"];
    if (!regions.includes(regionFilter)) regions.push(regionFilter);

    // Extract owner filters
    const ownerFilter = extractOwnerName(model.info["owner-tag"]);
    if (!owners.includes(ownerFilter)) owners.push(ownerFilter);

    // Extract credential filters
    const credentialFilter = extractCredentialName(
      model.info["cloud-credential-tag"]
    );
    if (!credentials.includes(credentialFilter))
      credentials.push(credentialFilter);
  });

  return { clouds, regions, owners, credentials };
}
