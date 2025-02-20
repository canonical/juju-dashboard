import ReactGA from "react-ga4";

type EventParams = {
  dashboardVersion: string;
  controllerVersion: string;
  isJuju: string;
};

type AnalyticsMessage = { path?: string; category?: string; action?: string };

const analytics = (
  analyticsEnabled: boolean,
  isProduction: boolean,
  eventParams: EventParams,
  { path, category = "", action = "" }: AnalyticsMessage,
) => {
  if (!isProduction || !analyticsEnabled) {
    return;
  }
  if (path) {
    ReactGA.send({ hitType: "pageview", page: path });
  } else {
    ReactGA.event(action, {
      category,
      ...eventParams,
    });
  }
};

export default analytics;
