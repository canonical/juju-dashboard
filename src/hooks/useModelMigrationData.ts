import { useEffect } from "react";

import { getIsJIMM, getWSControllerURL } from "store/general/selectors";
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
  const isJIMM = useAppSelector(getIsJIMM);

  useEffect(() => {
    if (wsControllerURL && fetchData && isJIMM) {
      dispatch(jimmSupportedVersions.actions.start({ wsControllerURL }));
      if (modelUUID) {
        dispatch(
          modelMigrationTargets.actions.start({ modelUUID, wsControllerURL }),
        );
      }
    }
    return (): void => {
      if (wsControllerURL && isJIMM) {
        dispatch(jimmSupportedVersions.actions.stop({ wsControllerURL }));
        if (modelUUID) {
          dispatch(
            modelMigrationTargets.actions.stop({ modelUUID, wsControllerURL }),
          );
        }
      }
    };
  }, [dispatch, fetchData, isJIMM, modelUUID, wsControllerURL]);
};

export default useModelMigrationData;
