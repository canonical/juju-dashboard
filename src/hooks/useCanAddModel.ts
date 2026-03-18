import { useEffect } from "react";

import { useClouds } from "juju/api-hooks/clouds";
import { getControllerUserTag } from "store/general/selectors";
import { getCloudInfoState } from "store/juju/selectors";
import { useAppSelector } from "store/store";

const useCanAddModel = (): boolean => {
  const activeUser = useAppSelector(getControllerUserTag) ?? "";
  const clouds = useClouds(activeUser);
  const cloudInfo = useAppSelector(getCloudInfoState);
  useEffect(() => {
    if (activeUser) {
      clouds();
    }
  }, [activeUser, clouds]);

  const userClouds = cloudInfo.clouds;
  return !!userClouds && Object.keys(userClouds).length > 0;
};

export default useCanAddModel;
