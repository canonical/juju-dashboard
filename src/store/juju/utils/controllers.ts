import { checkForJujuUpdate } from "@canonical/jujulib";
import { AdditionalController, Controller } from "../types";

/**
 * Returns the number of controllers that have an update available.
 * @param controllers The list of controllers to check for updates.
 * @returns
 */
export const countUpdates = (
  controllers?: (Controller | AdditionalController)[]
) => {
  let count = 0;
  if (controllers) {
    controllers.forEach((controller) => {
      if (
        "version" in controller &&
        controller.version &&
        checkForJujuUpdate(controller.version)
      )
        count += 1;
    });
  }
  return count;
};
