import { pageview, event } from "react-ga";

import { getAnalyticsEnabled } from "store/general/selectors";
import { useAppSelector } from "store/store";

type AnalyticMessage = {
  path?: string;
  category?: string;
  action?: string;
};

export default function useAnalytics() {
  const analyticsEnabled = useAppSelector(getAnalyticsEnabled);
  return ({ path, category = "", action = "" }: AnalyticMessage) => {
    const isProduction = process.env.NODE_ENV === "production" ?? true;
    if (!isProduction || !analyticsEnabled) {
      return;
    }
    if (path) {
      pageview(path);
    } else {
      event({
        category,
        action,
      });
    }
  };
}
