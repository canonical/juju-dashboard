import type {
  ApplicationStatus,
  MachineStatus,
} from "@canonical/jujulib/dist/api/facades/client/ClientV7";

import type { Chip } from "components/ChipGroup";
import type { MachineChangeDelta } from "juju/types";
import type { ModelData } from "store/juju/types";
import { getAppMachines, getAppUnits } from "store/juju/utils/units";

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
  for (const offer of Object.entries(modelStatusData["offers"])) {
    const totalConnectedCount = offer[1]["total-connected-count"];
    if (totalConnectedCount > 0) {
      offerCount = offerCount + totalConnectedCount;
    }
  }
  return { joined: offerCount };
};

const generateSecondaryCounts = <M = ModelData>(
  modelStatusData: M,
  segment: keyof M,
  selector: string,
): Counts | void => {
  const data = modelStatusData[segment];
  if (data && typeof data === "object") {
    return Object.entries(data).reduce<Counts>((counts, section) => {
      const { status } = section[1][selector] as { status: string };
      return incrementCounts(status, counts);
    }, {});
  }
};

export function generateUnitCounts(
  applications?: null | Record<string, ApplicationStatus>,
  applicationName?: null | string,
): Counts {
  const counts: Counts = {};
  if (applications && applicationName) {
    for (const unitData of Object.values(
      getAppUnits(applicationName, applications) ?? {},
    )) {
      const { status } = unitData["agent-status"];
      if (status) {
        incrementCounts(status, counts);
      }
    }
  }
  return counts;
}

export function generateMachineCounts(
  machines?: null | Record<string, MachineStatus>,
  applications?: null | Record<string, ApplicationStatus>,
  applicationName?: null | string,
): Counts {
  const counts: Counts = {};
  if (
    machines &&
    applications &&
    applicationName &&
    applicationName in applications
  ) {
    const machineIds: MachineChangeDelta["id"][] = Object.keys(
      getAppMachines(applicationName, applications, machines) ?? {},
    );
    for (const id of machineIds) {
      const status = machines[id]?.["agent-status"]?.status;
      if (status) {
        incrementCounts(status, counts);
      }
    }
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
