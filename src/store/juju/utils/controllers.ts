import type { AdditionalController, Controller } from "store/juju/types";

export const JAAS_CONTROLLER_UUID = "a030379a-940f-4760-8fcf-3062b41a04e7";

export const isJAASFromUUID = (
  controllerData: Controller | AdditionalController
) => "uuid" in controllerData && controllerData.uuid === JAAS_CONTROLLER_UUID;
