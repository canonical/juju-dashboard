export type EntityDetailsRoute = {
  qualifier: string;
  modelName: string;
  appName: string;
  unitId: string;
  machineId: string;
};

/**
 * Parameters available at `/models/:qualifier/:modelName` (`urls.model.index`).
 */
export type ModelIndexRoute = {
  qualifier: string;
  modelName: string;
};

/**
 * Parameters available at `/models/:qualifier/:modelName/app/:appName` (`urls.model.app.index`).
 */
export type ModelAppRoute = {
  appName: string;
} & ModelIndexRoute;
