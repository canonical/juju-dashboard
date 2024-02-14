import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import useCanConfigureModel from "hooks/useCanConfigureModel";
import {
  getModelUUIDFromList,
  getCanManageSecrets,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";

const useCanManageSecrets = () => {
  const routeParams = useParams();
  const { userName, modelName } = routeParams;
  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));
  const canManageSecrets = useAppSelector((state) =>
    getCanManageSecrets(state, modelUUID),
  );
  const canConfigureModel = useCanConfigureModel();
  return canManageSecrets && canConfigureModel;
};

export default useCanManageSecrets;
