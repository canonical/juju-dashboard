import type { Controller, Controllers } from "../types";

/**
    Finds a controller by UUID. In the case where there are multiple controllers for the same address
    i.e. JAAS, only the specific controller with the matching UUID will be returned.
  */
export const getControllerByUUID = (
  controllers: Controllers,
  controllerUUID: string,
): Controller | null => {
  for (const controllerAddress in controllers) {
    // Loop through the sub controllers for each primary controller.
    // This is typically only seen in JAAS. Outside of JAAS there is only ever
    // a single sub controller.
    for (const controller of controllers[controllerAddress]) {
      if (controllerUUID === controller.uuid) {
        return controller;
      }
    }
  }
  return null;
};

/**
    Get the Juju version for a controller.
  */
export const getControllerVersion = (controller: Controller): null | string => {
  if ("agent-version" in controller && controller["agent-version"]) {
    return controller["agent-version"];
  }
  if ("version" in controller && controller.version) {
    return controller.version;
  }
  return null;
};
