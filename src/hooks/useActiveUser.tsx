import { getActiveUserTag } from "store/general/selectors";
import { getModelByUUID } from "store/juju/selectors";
import { useAppSelector } from "store/store";

export default function useActiveUser(modelUUID: string) {
  const model = useAppSelector((state) => getModelByUUID(state, modelUUID));
  return useAppSelector((state) =>
    getActiveUserTag(state, model?.wsControllerURL)
  )?.replace("user-", "");
}
