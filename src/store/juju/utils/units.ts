import type {
  ApplicationStatus,
  MachineStatus,
  UnitStatus,
} from "@canonical/jujulib/dist/api/facades/client/ClientV7";

const isSubordinateApp = (app: ApplicationStatus): boolean =>
  !!app["subordinate-to"].length;

const getAppIdFromUnitId = (unitId: string): null | string =>
  unitId.split("/")[0];

/**
 * Get an application via its id.
 */
const getApp = (
  appId: string,
  applications: Record<string, ApplicationStatus>,
): ApplicationStatus | null =>
  appId in applications ? applications[appId] : null;

/**
 * Get the application for a unit.
 */
export const getUnitApp = (
  unitId: string,
  applications: Record<string, ApplicationStatus>,
): ApplicationStatus | null => {
  const appId = getAppIdFromUnitId(unitId);
  return appId ? getApp(appId, applications) : null;
};

/**
 * Calculate the scale (the number of units) of an application.
 * If it's a subordinate then count the number of parent units.
 */
export const getAppScale = (
  appId: string,
  applications: Record<string, ApplicationStatus>,
): number => {
  const app = getApp(appId, applications);
  if (!app) {
    return 0;
  }
  if (isSubordinateApp(app)) {
    return app["subordinate-to"].reduce<number>(
      (count, parentId) =>
        count +
        // A subordinate exists on every parent unit, so just count the parent units rather than
        // explicitly checking for the subordinates on each unit.
        (Object.keys(getApp(parentId, applications)?.units ?? {}).length ?? 0),
      0,
    );
  }
  return Object.keys(app.units ?? {}).length;
};

/**
 * Calculate the scale of all provided applications.
 */
export const getScale = (
  applicationIds: string[],
  applications: Record<string, ApplicationStatus>,
): number => {
  const appIds = [...applicationIds];
  let count = 0;
  for (const appId of appIds) {
    const app = getApp(appId, applications);
    if (!app) {
      continue;
    }
    if (isSubordinateApp(app)) {
      // If the application is a subordinate then add the parent to the list of app ids to be
      // counted (unless it's already in the list).
      for (const parentId of app["subordinate-to"]) {
        if (!appIds.includes(parentId)) {
          appIds.push(parentId);
        }
      }
    } else {
      count += getAppScale(appId, applications);
    }
  }
  return count;
};

/**
 * Get a unit's parent unit if it's a subordinate.
 */
export const getParentUnit = (
  unitId: string,
  applications: Record<string, ApplicationStatus>,
): null | UnitStatus => {
  const app = getUnitApp(unitId, applications);
  if (!app || !isSubordinateApp(app)) {
    return null;
  }
  for (const parentAppId of app["subordinate-to"]) {
    const parentApp = getApp(parentAppId, applications);
    if (!parentApp) {
      continue;
    }
    for (const parentUnit of Object.values(parentApp.units ?? {})) {
      for (const subordinateName in parentUnit.subordinates ?? {}) {
        if (subordinateName === unitId) {
          return parentUnit;
        }
      }
    }
  }
  return null;
};

const getSubordinateUnit = (
  unitId: string,
  applications: Record<string, ApplicationStatus>,
): null | UnitStatus => {
  const parent = getParentUnit(unitId, applications);
  return parent?.subordinates && unitId in parent.subordinates
    ? parent.subordinates[unitId]
    : null;
};

const getNonSubordinateUnit = (
  unitId: string,
  applications: Record<string, ApplicationStatus>,
): null | UnitStatus => {
  const app = getUnitApp(unitId, applications);
  return app && !isSubordinateApp(app) && app?.units && unitId in app.units
    ? app.units[unitId]
    : null;
};

/**
 * Get a unit's parent unit if it is a subordinate, or return the unit itself if it's not a subordinate.
 */
export const getParentOrUnit = (
  unitId: string,
  applications: Record<string, ApplicationStatus>,
): null | UnitStatus =>
  getNonSubordinateUnit(unitId, applications) ??
  getParentUnit(unitId, applications);

/**
 * Get a unit from its parent if it is a subordinate, or else get the unit from the unit's application.
 */
export const getUnit = (
  unitId: string,
  applications: Record<string, ApplicationStatus>,
): null | UnitStatus =>
  getSubordinateUnit(unitId, applications) ??
  getNonSubordinateUnit(unitId, applications);

/**
 * Get the machine for a unit.
 */
const getUnitDataMachine = (
  unit: UnitStatus,
  machines: Record<string, MachineStatus>,
): MachineStatus | null =>
  unit.machine in machines ? machines[unit.machine] : null;

/**
 * Get the machine for a unit id.
 */
export const getUnitMachine = (
  unitId: string,
  applications: Record<string, ApplicationStatus>,
  machines: Record<string, MachineStatus>,
): MachineStatus | null => {
  const unit = getParentOrUnit(unitId, applications);
  return unit ? getUnitDataMachine(unit, machines) : null;
};

/**
 * Get all machines for an application.
 */
export const getAppMachines = (
  appId: string,
  applications: Record<string, ApplicationStatus>,
  machines: Record<string, MachineStatus>,
): null | Record<string, MachineStatus> => {
  const application = getApp(appId, applications);
  if (!application) {
    return null;
  }
  let machinesForApp: Record<string, MachineStatus> = {};
  if (isSubordinateApp(application)) {
    for (const appName of application["subordinate-to"]) {
      machinesForApp = {
        ...machinesForApp,
        ...getAppMachines(appName, applications, machines),
      };
    }
  } else {
    for (const unitData of Object.values(application.units ?? {})) {
      const machine = getUnitDataMachine(unitData, machines);
      if (machine) {
        machinesForApp[unitData.machine] = machine;
      }
    }
  }
  return machinesForApp;
};

/**
 * Get all units for an application.
 */
export const getAppUnits = (
  appId: string,
  applications: Record<string, ApplicationStatus>,
): null | Record<string, UnitStatus> => {
  const application = getApp(appId, applications);
  if (!application) {
    return null;
  }
  if (isSubordinateApp(application)) {
    const unitsForApp: Record<string, UnitStatus> = {};
    for (const appName of application["subordinate-to"]) {
      const app = getApp(appName, applications);
      if (app) {
        for (const parentUnit of Object.values(app.units ?? {})) {
          for (const [subordinateName, subordinateUnit] of Object.entries(
            parentUnit.subordinates ?? {},
          )) {
            const subordinateAppId = getAppIdFromUnitId(subordinateName);
            if (subordinateAppId && subordinateAppId === appId) {
              unitsForApp[subordinateName] = subordinateUnit;
            }
          }
        }
      }
    }
    return unitsForApp;
  }
  return application.units;
};

/**
 * Get all units on a machine.
 */
export const getMachineUnits = (
  machineId: string,
  applications: Record<string, ApplicationStatus>,
  includeSubordinates = true,
): Record<string, UnitStatus> => {
  let unitsOnMachine: Record<string, UnitStatus> = {};
  for (const app of Object.values(applications)) {
    for (const [unitId, unitInfo] of Object.entries(app.units ?? {})) {
      if (machineId === unitInfo.machine) {
        unitsOnMachine[unitId] = unitInfo;
        if (includeSubordinates) {
          unitsOnMachine = {
            ...unitsOnMachine,
            ...(unitInfo.subordinates ?? {}),
          };
        }
        // Only one unit of each application can be on the machine
        // so exit the loop if a unit was found.
        break;
      }
    }
  }
  return unitsOnMachine;
};

/**
 * Get all applications on a machine.
 */
export const getMachineApps = (
  machineId: string,
  applications: Record<string, ApplicationStatus>,
): Record<string, ApplicationStatus> => {
  const units = getMachineUnits(machineId, applications);
  const appsOnMachine: Record<string, ApplicationStatus> = {};
  for (const unitId in units) {
    const appId = getAppIdFromUnitId(unitId);
    const app = getUnitApp(unitId, applications);
    if (appId && app && !(appId in appsOnMachine)) {
      appsOnMachine[appId] = app;
    }
  }
  return appsOnMachine;
};
