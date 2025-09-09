import ReactGA from "react-ga4";

type EventParams = {
  dashboardVersion: string;
  controllerVersion: string;
  isJuju: string;
};

export type AnalyticsMessage = {
  path?: string;
  category?: string;
  action?: string;
};

// In components, the useAnalytics hook can be used to fetch additional event data
const analytics = (
  analyticsEnabled: boolean,
  eventParams: EventParams,
  { path = "", category = "", action = "" }: AnalyticsMessage,
) => {
  if (!analyticsEnabled) {
    return;
  }
  if (path) {
    ReactGA.send({ hitType: "pageview", page: path, ...eventParams });
  } else {
    ReactGA.event(action, {
      category,
      ...eventParams,
    });
  }
};

export default analytics;
