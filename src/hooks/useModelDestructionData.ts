import type { RemoteEndpoint } from "@canonical/jujulib/dist/api/facades/application/ApplicationV19";
import type {
  ApplicationOfferStatus,
  RemoteApplicationStatus,
  StorageDetails,
} from "@canonical/jujulib/dist/api/facades/client/ClientV7";

import useModelStatus from "hooks/useModelStatus";
import type { ModelData } from "store/juju/types";

// Helper function to extract and format cross-model relations
const getCrossModelRelations = (
  modelStatusData: ModelData | null,
): {
  name: string;
  endpoints: RemoteEndpoint[];
}[] => {
  const relations = [];
  const offers = modelStatusData?.offers ?? {};
  const remoteApplications = modelStatusData?.["remote-applications"] ?? {};

  // Handle offers
  relations.push(
    ...Object.entries(offers).map(
      ([name, data]: [string, ApplicationOfferStatus]) => ({
        name,
        // Convert endpoints object to an array of endpoint values
        endpoints: Object.values(data.endpoints),
      }),
    ),
  );

  // Handle remote applications
  relations.push(
    ...Object.entries(remoteApplications).map(
      ([name, data]: [string, RemoteApplicationStatus]) => ({
        name,
        endpoints: data.endpoints,
      }),
    ),
  );

  return relations;
};

// Helper function to create list of storage IDs from storage tags
const getStorageIDs = (storage: StorageDetails[] | undefined): string[] => {
  const storageIDs = [];
  if (storage) {
    storageIDs.push(
      ...storage.map((storageItem) =>
        storageItem["storage-tag"].split("storage-")[1].replace("-", "/"),
      ),
    );
  }
  return storageIDs;
};

// Custom hook to prepare all data needed by the component
export default function useModelDestructionData(modelUUID: string): {
  hasStorage: boolean;
  applications: string[];
  machines: string[];
  crossModelRelations: {
    name: string;
    endpoints: RemoteEndpoint[];
  }[];
  connectedOffers: [string, ApplicationOfferStatus][];
  showInfoTable: boolean;
  storageIDs: string[];
} {
  const modelStatusData = useModelStatus(modelUUID);

  const applications = Object.keys(modelStatusData?.applications ?? {});
  const machines = Object.keys(modelStatusData?.machines ?? {});
  const crossModelRelations = getCrossModelRelations(modelStatusData);
  const connectedOffers = Object.entries(modelStatusData?.offers ?? {}).filter(
    ([, data]) => data["total-connected-count"] > 0,
  );
  const showInfoTable =
    applications.length > 0 ||
    machines.length > 0 ||
    crossModelRelations.length > 0;
  const hasStorage = modelStatusData?.storage !== undefined;
  const storageIDs = getStorageIDs(modelStatusData?.storage);

  return {
    hasStorage,
    applications,
    machines,
    crossModelRelations,
    connectedOffers,
    showInfoTable,
    storageIDs,
  };
}
