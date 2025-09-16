import type { Chip } from "components/ChipGroup";
import type { MachineChangeDelta, MachineData, UnitData } from "juju/types";
import type { ModelData } from "store/juju/types";

type Counts = {
  [status: string]: number;
};

export const incrementCounts = (
  status: string,
  counts: { [status: string]: number },
): Counts => {
  if (counts[status]) {
    counts[status] = counts[status] += 1;
  } else {
    counts[status] = 1;
  }
  return counts;
};

const generateOfferCounts = (
  modelStatusData: ModelData,
): { joined: number } => {
  let offerCount = 0;
  Object.entries(modelStatusData["offers"]).forEach((offer) => {
    const totalConnectedCount = offer[1]["total-connected-count"];
    if (totalConnectedCount > 0) {
      offerCount = offerCount + totalConnectedCount;
    }
  });
  return { joined: offerCount };
};

const generateSecondaryCounts = <M extends ModelData>(
  modelStatusData: M,
  segment: keyof M,
  selector: string,
): Counts | void => {
  const data = segment in modelStatusData ? modelStatusData[segment] : null;
  if (data && typeof data === "object") {
    return Object.entries(data).reduce<Counts>((counts, section) => {
      const { status } = section[1][selector] as { status: string };
      return incrementCounts(status, counts);
    }, {});
  }
};

export function generateUnitCounts(
  units: null | UnitData,
  applicationName: null | string = null,
): Counts {
  const counts: Counts = {};
  if (units && applicationName !== null && applicationName) {
    Object.values(units).forEach((unitData): void => {
      if (unitData.application === applicationName) {
        const status = unitData["agent-status"].current;
        if (status) {
          incrementCounts(status, counts);
        }
      }
    });
  }
  return counts;
}

export function generateMachineCounts(
  machines: MachineData | null,
  units: null | UnitData,
  applicationName: null | string = null,
): Counts {
  const counts: Counts = {};
  if (machines && units && applicationName !== null && applicationName) {
    const machineIds: MachineChangeDelta["id"][] = [];
    Object.entries(units).forEach(([_unitName, unitData]) => {
      if (unitData.application === applicationName) {
        machineIds.push(unitData["machine-id"]);
      }
    });
    machineIds.forEach((id) => {
      const status = machines[id]?.["agent-status"]?.current;
      if (status) {
        incrementCounts(status, counts);
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
  countType: "localApps" | "offers" | "relations" | "remoteApps",
  modelStatusData?: ModelData | null,
): Chip | null => {
  if (!modelStatusData) {
    return null;
  }
  let chips = null;
  switch (countType) {
    case "localApps":
      chips = generateSecondaryCounts(
        modelStatusData,
        "applications",
        "status",
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
        "status",
      );
      break;
  }
  return chips as Chip;
};
