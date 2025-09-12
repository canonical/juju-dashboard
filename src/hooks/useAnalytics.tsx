import {
  getAnalyticsEnabled,
  getAppVersion,
  getControllerConnection,
  getIsJuju,
  getWSControllerURL,
} from "store/general/selectors";
import { useAppSelector } from "store/store";
import analytics, { type AnalyticsMessage } from "utils/analytics";

export default function useAnalytics() {
  const analyticsEnabled = useAppSelector(getAnalyticsEnabled);
  const isJuju = useAppSelector(getIsJuju);
  const appVersion = useAppSelector(getAppVersion);
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const controllerVersion = useAppSelector((state) =>
    getControllerConnection(state, wsControllerURL),
  )?.serverVersion;
  const eventParams = {
    dashboardVersion: appVersion ?? "",
    controllerVersion: controllerVersion ?? "",
    isJuju: (!!isJuju).toString(),
  };

  return (props: AnalyticsMessage): void => {
    analytics(!!analyticsEnabled, eventParams, props);
  };
}
