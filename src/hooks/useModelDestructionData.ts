import type { RemoteEndpoint } from "@canonical/jujulib/dist/api/facades/application/ApplicationV22";
import type {
  ApplicationOfferStatus,
  RemoteApplicationStatus,
  StorageDetails,
} from "@canonical/jujulib/dist/api/facades/client/ClientV8";

import { getModelData, getModelList } from "store/juju/selectors";
import { DestroyBlockedReason } from "store/juju/types";
import { useAppSelector } from "store/store";

type CrossModelRelation = {
  name: string;
  endpoints: RemoteEndpoint[];
  isConnectedOffer: boolean;
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
  storageIDs: string[];
  unitCount: number;
  destroyBlockedReason: DestroyBlockedReason | null;
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
        isConnectedOffer: data["total-connected-count"] > 0,
      }),
    ),
  );

  // Handle remote applications
  relations = relations.concat(
    Object.entries(remoteApplications).map(
      ([name, data]: [string, RemoteApplicationStatus]) => ({
        name,
        endpoints: data.endpoints,
        isConnectedOffer: false,
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
  const connectedEntries = Object.entries(offers).filter(
    ([, data]) => data["total-connected-count"] > 0,
  ) as [string, ApplicationOfferStatus][];

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
  modelUUIDs: string[],
): Record<string, ModelDestructionData> {
  const allModelData = useAppSelector(getModelData);
  const modelList = useAppSelector(getModelList);

  const result: Record<string, ModelDestructionData> = {};

  for (const modelUUID of modelUUIDs) {
    const data = allModelData[modelUUID];

    const offers = data?.offers ?? {};
    const remoteApplications = data?.["remote-applications"] ?? {};
    const applications = Object.keys(data?.applications ?? {});
    const machines = Object.keys(data?.machines ?? {});
    const crossModelRelations = getCrossModelRelations(
      offers,
      remoteApplications,
    );
    const storageIDs = getStorageIDs(data?.storage);
    const connectedOffers = getConnectedOffers(offers);
    const hasStorage = data?.storage !== undefined;
    const unitCount = applications.reduce((prev, key) => {
      const units = data?.applications?.[key]?.units ?? {};
      return prev + Object.keys(units).length;
    }, 0);

    let destroyBlockedReason = null;
    if (data?.info?.["is-controller"]) {
      destroyBlockedReason = DestroyBlockedReason.IS_CONTROLLER;
    } else if (!modelList[modelUUID]?.canConfigure) {
      destroyBlockedReason = DestroyBlockedReason.NO_ACCESS;
    } else if (connectedOffers.length > 0) {
      destroyBlockedReason = DestroyBlockedReason.CONNECTED_OFFERS;
    }

    result[modelUUID] = {
      hasStorage,
      applications,
      machines,
      crossModelRelations,
      connectedOffers,
      storageIDs,
      unitCount,
      destroyBlockedReason,
    };
  }

  return result;
}
