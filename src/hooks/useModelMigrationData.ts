import { useEffect } from "react";

import { getWSControllerURL } from "store/general/selectors";
import { getModelUUIDFromList } from "store/juju/selectors";
import jimmSupportedVersions from "store/middleware/source/jimm-supported-versions";
import modelMigrationTargets from "store/middleware/source/migration-targets";
import { useAppDispatch, useAppSelector } from "store/store";

/**
 * Fetch the data needed for model migrations.
 */
const useModelMigrationData = (
  modelName: null | string,
  qualifier: null | string,
  fetchData = true,
): void => {
  const dispatch = useAppDispatch();
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, qualifier),
  );

  useEffect(() => {
    if (wsControllerURL && fetchData) {
      dispatch(jimmSupportedVersions.actions.start({ wsControllerURL }));
      if (modelUUID) {
        dispatch(
          modelMigrationTargets.actions.start({ modelUUID, wsControllerURL }),
        );
      }
    }
    return (): void => {
      if (wsControllerURL) {
        dispatch(jimmSupportedVersions.actions.stop({ wsControllerURL }));
        if (modelUUID) {
          dispatch(
            modelMigrationTargets.actions.stop({ modelUUID, wsControllerURL }),
          );
        }
      }
    };
  }, [dispatch, fetchData, modelUUID, wsControllerURL]);
};

export default useModelMigrationData;
