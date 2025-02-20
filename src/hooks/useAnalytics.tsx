import { useSelector } from "react-redux";

import {
  getAnalyticsEnabled,
  getAppVersion,
  getControllerConnection,
  getIsJuju,
  getWSControllerURL,
} from "store/general/selectors";
import { useAppSelector } from "store/store";
import analytics from "utils/analytics";

type AnalyticMessage = {
  path?: string;
  category?: string;
  action?: string;
};

export default function useAnalytics() {
  const analyticsEnabled = useAppSelector(getAnalyticsEnabled);
  const isProduction = import.meta.env.PROD;
  const isJuju = useSelector(getIsJuju);
  const appVersion = useSelector(getAppVersion);
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const controllerVersion = useAppSelector((state) =>
    getControllerConnection(state, wsControllerURL),
  )?.serverVersion;
  const eventParams = {
    dashboardVersion: appVersion ?? "",
    controllerVersion: controllerVersion ?? "",
    isJuju: (!!isJuju).toString(),
  };

  return (props: AnalyticMessage) =>
    analytics(!!analyticsEnabled, isProduction, eventParams, props);
}
