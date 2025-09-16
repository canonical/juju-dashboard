import { useParams } from "react-router";

import useCanConfigureModel from "hooks/useCanConfigureModel";
import {
  getModelUUIDFromList,
  getCanManageSecrets,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";

const useCanManageSecrets = (): boolean => {
  const routeParams = useParams();
  const { userName, modelName } = routeParams;
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, userName),
  );
  const canManageSecrets = useAppSelector((state) =>
    getCanManageSecrets(state, modelUUID),
  );
  const canConfigureModel = useCanConfigureModel();
  return (canManageSecrets && canConfigureModel) ?? false;
};

export default useCanManageSecrets;
