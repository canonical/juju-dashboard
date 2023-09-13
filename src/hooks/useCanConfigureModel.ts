import { useParams } from "react-router-dom";

import type { EntityDetailsRoute } from "components/Routes/Routes";
import useModelStatus from "hooks/useModelStatus";
import { getActiveUser, getModelUUIDFromList } from "store/juju/selectors";
import { canAdministerModel } from "store/juju/utils/models";
import { useAppSelector } from "store/store";

const useCanConfigureModel = () => {
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const modelUUID = useAppSelector(getModelUUIDFromList(modelName, userName));
  const activeUser = useAppSelector((state) => getActiveUser(state, modelUUID));
  const modelStatusData = useModelStatus();
  return (
    !!activeUser && canAdministerModel(activeUser, modelStatusData?.info?.users)
  );
};

export default useCanConfigureModel;
