export type EntityDetailsRoute = {
  userName: string;
  modelName: string;
  appName: string;
  unitId: string;
  machineId: string;
};

/**
 * Parameters available at `/models/:userName/:modelName` (`urls.model.index`).
 */
export type ModelIndexRoute = {
  userName: string;
  modelName: string;
};

/**
 * Parameters available at `/models/:userName/:modelName/app/:appName` (`urls.model.app.index`).
 */
export type ModelAppRoute = ModelIndexRoute & {
  appName: string;
};
