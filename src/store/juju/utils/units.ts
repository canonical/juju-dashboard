import type {
  ApplicationStatus,
  MachineStatus,
  UnitStatus,
} from "@canonical/jujulib/dist/api/facades/client/ClientV7";

/**
 * Calculate the scale (the number of units) of an application.
 * If it's a subordinate then count the number of parent units.
 */
export const getAppScale = (
  appId: string,
  applications: Record<string, ApplicationStatus>,
): number => {
  const app = appId in applications ? applications[appId] : null;
  if (!app) {
    return 0;
  }
  return app["subordinate-to"].length
    ? app["subordinate-to"].reduce<number>(
        (count, parentId) =>
          count +
          (parentId in applications
            ? // A subordinate exists on every parent unit, so just count the parent units rather than
              // checking for the subordinate id.
              Object.keys(applications[parentId].units ?? {}).length
            : 0),
        0,
      )
    : Object.keys(app.units ?? {}).length;
};

/**
 * Calculate the scale of all provided applications.
 */
export const getScale = (
  applicationIds: string[],
  applications: null | Record<string, ApplicationStatus>,
): number => {
  if (!applications) {
    return 0;
  }
  const counted: string[] = [];
  return applicationIds.reduce((count, appId) => {
    if (!(appId in applications) || counted.includes(appId)) {
      return count;
    }
    counted.push(appId);
    // If the app is a subordinate and its parent is in the list then
    // don't count the subordinate units otherwise they will be counted twice.
    if (applications[appId]["subordinate-to"].length) {
      return (
        count +
        getAppScale(
          appId,
          // Only include the parent if its id is not in the applicationIds list.
          applications[appId]["subordinate-to"].reduce<
            Record<string, ApplicationStatus>
          >(
            (parents, subordinateTo) => {
              if (
                applicationIds.includes(subordinateTo) ||
                counted.includes(subordinateTo)
              ) {
                // Ignore it if the parent application will be counted.
                return parents;
              }
              counted.push(subordinateTo);
              parents[subordinateTo] = applications[subordinateTo];
              return parents;
            },
            { [appId]: applications[appId] },
          ),
        )
      );
    }
    return count + getAppScale(appId, applications);
  }, 0);
};

/**
 * Get all applications on a machine.
 */
export const getMachineApps = (
  machineId: string,
  applications: null | Record<string, ApplicationStatus>,
): Record<string, ApplicationStatus> => {
  const appsOnMachine: Record<string, ApplicationStatus> = {};
  if (!applications) {
    return appsOnMachine;
  }
  Object.entries(applications).forEach(([appName, app]) => {
    if (appName in appsOnMachine) {
      // This application has already been found (e.g. through a subordinate).
      return;
    }
    for (const unitInfo of Object.values(app.units ?? {})) {
      if (machineId === unitInfo.machine) {
        appsOnMachine[appName] = app;
        Object.keys(unitInfo.subordinates ?? {}).forEach((subordinateName) => {
          const [parentAppName] = subordinateName.split("/");
          const parentApp =
            parentAppName in applications ? applications[parentAppName] : null;
          if (
            parentApp &&
            parentAppName in applications &&
            !(parentAppName in appsOnMachine)
          ) {
            appsOnMachine[parentAppName] = parentApp;
          }
        });
        // Only one unit of each application can be on the machine
        // so exit the loop if a unit was found.
        break;
      }
    }
  });
  return appsOnMachine;
};

/**
 * Get all units on a machine.
 */
export const getMachineUnits = (
  machineId: string,
  applications: null | Record<string, ApplicationStatus>,
  includeSubordinates = true,
): Record<string, UnitStatus> => {
  const unitsOnMachine: Record<string, UnitStatus> = {};
  if (!applications) {
    return unitsOnMachine;
  }
  Object.values(applications).forEach((app) => {
    for (const [unitId, unitInfo] of Object.entries(app.units ?? {})) {
      if (machineId === unitInfo.machine) {
        unitsOnMachine[unitId] = unitInfo;
        if (includeSubordinates) {
          Object.entries(unitInfo.subordinates ?? {}).forEach(
            ([subordinateId, subordinate]) => {
              unitsOnMachine[subordinateId] = subordinate;
            },
          );
        }
        // Only one unit of each application can be on the machine
        // so exit the loop if a unit was found.
        break;
      }
    }
  });
  return unitsOnMachine;
};

/**
 * Get a unit's parent unit if it's a subordinate.
 */
export const getParentUnit = (
  unitId: string,
  applications: null | Record<string, ApplicationStatus>,
): null | UnitStatus => {
  if (!applications) {
    return null;
  }
  const [appId] = unitId.split("/");
  const app = appId in applications ? applications[appId] : null;
  if (!app?.["subordinate-to"].length) {
    return null;
  }
  for (const parentAppId of app["subordinate-to"]) {
    const parentApp =
      parentAppId in applications ? applications[parentAppId] : null;
    if (!parentApp) {
      continue;
    }
    for (const parentUnit of Object.values(parentApp.units ?? {})) {
      for (const subordinateName of Object.keys(
        parentUnit.subordinates ?? {},
      )) {
        if (subordinateName === unitId) {
          return parentUnit;
        }
      }
    }
  }
  return null;
};

/**
 * Get a unit's parent unit if it is a subordinate, or return the unit itself if it's not a subordinate.
 */
export const getParentOrUnit = (
  unitId: string,
  applications: null | Record<string, ApplicationStatus>,
): null | UnitStatus => {
  if (!applications) {
    return null;
  }
  const [appId] = unitId.split("/");
  const app = appId in applications ? applications[appId] : null;
  if (!app?.["subordinate-to"].length) {
    return app?.units && unitId in app.units ? app.units[unitId] : null;
  }
  return getParentUnit(unitId, applications);
};

/**
 * Get a unit from its parent if it is a subordinate, or else get the unit from the unit's application.
 */
export const getUnit = (
  unitId: string,
  applications: null | Record<string, ApplicationStatus>,
): null | UnitStatus => {
  if (!applications) {
    return null;
  }
  const [appId] = unitId.split("/");
  const app = appId in applications ? applications[appId] : null;
  if (!app?.["subordinate-to"].length) {
    return app?.units && unitId in app.units ? app.units[unitId] : null;
  }
  const parent = getParentUnit(unitId, applications);
  return parent?.subordinates && unitId in parent.subordinates
    ? parent.subordinates[unitId]
    : null;
};

/**
 * Get the application for a unit.
 */
export const getUnitApp = (
  unitId: string,
  applications: null | Record<string, ApplicationStatus>,
): ApplicationStatus | null => {
  if (!applications) {
    return null;
  }
  const [appId] = unitId.split("/");
  return appId in applications ? applications[appId] : null;
};

/**
 * Get a unit from its parent if it is a subordinate, or else get the unit from the unit's application.
 */
export const getUnitMachine = (
  unitId: string,
  applications: null | Record<string, ApplicationStatus>,
  machines: null | Record<string, MachineStatus>,
): MachineStatus | null => {
  if (!applications || !machines) {
    return null;
  }
  const unit = getParentOrUnit(unitId, applications);
  return unit && unit.machine in machines ? machines[unit.machine] : null;
};

/**
 * Get all machines for an application.
 */
export const getAppMachines = (
  appId: string,
  applications: null | Record<string, ApplicationStatus>,
  machines: null | Record<string, MachineStatus>,
): Record<string, MachineStatus> => {
  const machinesForApp: Record<string, MachineStatus> = {};
  const application =
    applications && appId in applications ? applications[appId] : null;
  if (!applications || !machines || !application) {
    return machinesForApp;
  }
  if (application["subordinate-to"].length) {
    application["subordinate-to"].forEach((appName) => {
      const app = appName in applications ? applications[appName] : null;
      if (app) {
        Object.values(app.units ?? {}).forEach((parentUnit) => {
          if (parentUnit.machine in machines) {
            machinesForApp[parentUnit.machine] = machines[parentUnit.machine];
          }
        });
      }
    });
  } else {
    Object.values(application.units ?? {}).forEach((unitData) => {
      if (unitData.machine in machines) {
        machinesForApp[unitData.machine] = machines[unitData.machine];
      }
    });
  }
  return machinesForApp;
};

/**
 * Get all units for an application.
 */
export const getAppUnits = (
  appId: string,
  applications: null | Record<string, ApplicationStatus>,
): Record<string, UnitStatus> => {
  const application =
    applications && appId in applications ? applications[appId] : null;
  if (!applications || !application) {
    return {};
  }
  if (application["subordinate-to"].length) {
    const unitsForApp: Record<string, UnitStatus> = {};
    application["subordinate-to"].forEach((appName) => {
      const app = appName in applications ? applications[appName] : null;
      if (app) {
        Object.values(app.units ?? {}).forEach((parentUnit) => {
          Object.entries(parentUnit.subordinates ?? {}).forEach(
            ([subordinateName, subordinateUnit]) => {
              if (subordinateName.split("/")[0] === appId) {
                unitsForApp[subordinateName] = subordinateUnit;
              }
            },
          );
        });
      }
    });
    return unitsForApp;
  }
  return application.units;
};
