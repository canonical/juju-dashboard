import { useEffect } from "react";

import { useListCloudInfo } from "juju/api-hooks/clouds";
import { getControllerUserTag } from "store/general/selectors";
import { getCloudInfoState } from "store/juju/selectors";
import { useAppSelector } from "store/store";

const useCanAddModel = (): boolean => {
  const activeUser = useAppSelector(getControllerUserTag) ?? "";
  const listCloudInfo = useListCloudInfo(activeUser);
  const cloudInfo = useAppSelector(getCloudInfoState);
  useEffect(() => {
    if (activeUser) {
      listCloudInfo(activeUser);
    }
  }, [activeUser, listCloudInfo]);

  const clouds = cloudInfo[activeUser]?.clouds ?? [];
  return clouds.some((cloud) => {
    const access = cloud?.result?.["user-access"];
    return access === "add-model" || access === "admin";
  });
};

export default useCanAddModel;
