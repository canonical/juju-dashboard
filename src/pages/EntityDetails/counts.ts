import type { Chip } from "components/ChipGroup/ChipGroup";
import type { MachineChangeDelta, MachineData, UnitData } from "juju/types";
import type { ModelData } from "store/juju/types";

export const incrementCounts = (
  status: string,
  counts: { [status: string]: number }
) => {
  if (counts[status]) {
    counts[status] = counts[status] += 1;
  } else {
    counts[status] = 1;
  }
  return counts;
};

const generateOfferCounts = (modelStatusData: ModelData) => {
  let offerCount = 0;
  Object.entries(modelStatusData["offers"]).forEach((offer) => {
    const totalConnectedCount = offer[1]["total-connected-count"];
    if (totalConnectedCount > 0) {
      offerCount = offerCount + totalConnectedCount;
    }
  });
  return { joined: offerCount };
};

const generateSecondaryCounts = <M = ModelData>(
  modelStatusData: M,
  segment: keyof M,
  selector: string
) => {
  const data = modelStatusData[segment];
  if (data && typeof data === "object") {
    return Object.entries(data).reduce((counts, section) => {
      const status = section[1][selector].status;
      return incrementCounts(status, counts);
    }, {});
  }
};

export function generateUnitCounts(
  units: UnitData | null,
  applicationName?: string | null
) {
  const counts = {};
  if (units && applicationName) {
    Object.entries(units).forEach(([unitId, unitData]) => {
      if (unitData.application === applicationName) {
        const status = unitData["agent-status"].current;
        if (status) {
          return incrementCounts(status, counts);
        }
      }
    });
  }
  return counts;
}

export function generateMachineCounts(
  machines: MachineData | null,
  units: UnitData | null,
  applicationName?: string | null
) {
  const counts = {};
  if (machines && units && applicationName) {
    const machineIds: MachineChangeDelta["id"][] = [];
    Object.entries(units).forEach(([, unitData]) => {
      if (unitData.application === applicationName) {
        machineIds.push(unitData["machine-id"]);
      }
    });
    machineIds.forEach((id) => {
      const status = machines[id]?.["agent-status"]?.current;
      if (status) {
        return incrementCounts(status, counts);
      }
    });
  }
  return counts;
}

/**
  Generates a list of counts from the modelStatusData.
  @param countType The type of count to generate
  @param modelStatusData The modelStatusData from the redux store.
*/
export const renderCounts = (
  countType: "localApps" | "relations" | "offers" | "remoteApps",
  modelStatusData?: ModelData | null
) => {
  if (!modelStatusData) return null;
  let chips = null;
  switch (countType) {
    case "localApps":
      chips = generateSecondaryCounts(
        modelStatusData,
        "applications",
        "status"
      );
      break;
    case "relations":
      chips = null;
      break;
    case "offers":
      chips = generateOfferCounts(modelStatusData);
      break;
    case "remoteApps":
      chips = generateSecondaryCounts(
        modelStatusData,
        "remote-applications",
        "status"
      );
      break;
  }
  return chips as Chip;
};
