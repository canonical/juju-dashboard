import { getActiveUserTag } from "store/general/selectors";
import { getModelList } from "store/juju/selectors";
import { useAppSelector, useAppStore } from "store/store";

export default function useActiveUsers() {
  const store = useAppStore();
  const models = useAppSelector(getModelList);
  const activeUsers: Record<string, string> = {};
  Object.entries(models).forEach(([modelUUID, model]) => {
    activeUsers[modelUUID] = getActiveUserTag(
      store.getState(),
      model.wsControllerURL
    )?.replace("user-", "");
  });
  return activeUsers;
}
