import { AdditionalController, Controller } from "store/juju/types";

export const isJAASFromPath = (
  controllerData: Controller | AdditionalController
) => "path" in controllerData && controllerData?.path === "admin/jaas";
