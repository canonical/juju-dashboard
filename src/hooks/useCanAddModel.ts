import { getIsJuju } from "store/general/selectors";
import { getCloudInfoState, getControllersCount } from "store/juju/selectors";
import { useAppSelector } from "store/store";

export const useCanAddModel = (): boolean => {
  const isJuju = useAppSelector(getIsJuju);
  const cloudInfo = useAppSelector(getCloudInfoState).clouds;
  const controllersCount = useAppSelector(getControllersCount);

  const hasCloudAccess = !!cloudInfo && Object.keys(cloudInfo).length > 0;
  if (isJuju) {
    return hasCloudAccess;
  }

  const hasControllerAccess = controllersCount > 0;
  return hasCloudAccess && hasControllerAccess;
};
