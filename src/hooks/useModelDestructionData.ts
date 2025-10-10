import type { RemoteEndpoint } from "@canonical/jujulib/dist/api/facades/application/ApplicationV19";
import type {
  ApplicationOfferStatus,
  RemoteApplicationStatus,
  StorageDetails,
} from "@canonical/jujulib/dist/api/facades/client/ClientV7";

import useModelStatus from "hooks/useModelStatus";

type CrossModelRelation = {
  name: string;
  endpoints: RemoteEndpoint[];
  isOffer: boolean;
};

type ConnectedOffer = {
  offerName: string;
  applicationName: string;
  endpoint: { name: string; interface: string };
};

type ModelDestructionData = {
  hasStorage: boolean;
  applications: string[];
  machines: string[];
  crossModelRelations: CrossModelRelation[];
  connectedOffers: ConnectedOffer[];
  showInfoTable: boolean;
  storageIDs: string[];
};

// Helper function to extract and format cross-model relations
const getCrossModelRelations = (
  offers: Record<string, ApplicationOfferStatus>,
  remoteApplications: Record<string, RemoteApplicationStatus>,
): CrossModelRelation[] => {
  let relations: CrossModelRelation[] = [];

  // Handle offers
  relations = relations.concat(
    Object.entries(offers).map(
      ([name, data]: [string, ApplicationOfferStatus]) => ({
        name,
        // Convert endpoints object to an array of endpoint values
        endpoints: Object.values(data.endpoints),
        isOffer: true,
      }),
    ),
  );

  // Handle remote applications
  relations = relations.concat(
    Object.entries(remoteApplications).map(
      ([name, data]: [string, RemoteApplicationStatus]) => ({
        name,
        endpoints: data.endpoints,
        isOffer: false,
      }),
    ),
  );

  return relations;
};

// Helper function to create list of storage IDs from storage tags
const getStorageIDs = (storage: StorageDetails[] | undefined): string[] => {
  return (storage ?? []).map((storageItem) =>
    storageItem["storage-tag"].split("storage-")[1].replace("-", "/"),
  );
};

const getConnectedOffers = (
  offers: Record<string, ApplicationOfferStatus>,
): ConnectedOffer[] => {
  // This filtering is disabled due to this bug in Juju: https://github.com/juju/juju/issues/20725
  const connectedEntries = Object.entries(offers);
  // .filter(
  //   ([, data]) => data["total-connected-count"] > 0,
  // ) as [string, ApplicationOfferStatus][];

  return connectedEntries.map(([offerName, data]) => {
    const endpointDetails = Object.values(data.endpoints)[0] ?? {
      name: "unknown",
      interface: "unknown",
    };

    return {
      offerName,
      applicationName: data["application-name"],
      endpoint: {
        name: endpointDetails.name,
        interface: endpointDetails.interface,
      },
    };
  });
};

// Custom hook to prepare all data needed by the component
export default function useModelDestructionData(
  modelUUID: string,
): ModelDestructionData {
  const modelStatusData = useModelStatus(modelUUID);

  const offers = modelStatusData?.offers ?? {};
  const remoteApplications = modelStatusData?.["remote-applications"] ?? {};
  const applications = Object.keys(modelStatusData?.applications ?? {});
  const machines = Object.keys(modelStatusData?.machines ?? {});
  const crossModelRelations = getCrossModelRelations(
    offers,
    remoteApplications,
  );
  const storageIDs = getStorageIDs(modelStatusData?.storage);
  const connectedOffers = getConnectedOffers(offers);
  const showInfoTable =
    applications.length > 0 ||
    machines.length > 0 ||
    crossModelRelations.length > 0;
  const hasStorage = modelStatusData?.storage !== undefined;

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
