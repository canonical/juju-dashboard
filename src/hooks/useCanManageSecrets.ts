import { useParams } from "react-router";

import type { EntityDetailsRoute } from "components/Routes";
import useCanConfigureModel from "hooks/useCanConfigureModel";
import {
  getModelUUIDFromList,
  getCanManageSecrets,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";

const useCanManageSecrets = (): boolean => {
  const { qualifier, modelName } = useParams<EntityDetailsRoute>();
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, qualifier),
  );
  const canManageSecrets = useAppSelector((state) =>
    getCanManageSecrets(state, modelUUID),
  );
  const canConfigureModel = useCanConfigureModel();
  return (canManageSecrets && canConfigureModel) ?? false;
};

export default useCanManageSecrets;
