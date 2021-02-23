import ReactGA from "react-ga";

type AnalyticMessage = {
  path?: string;
  category?: string;
  action?: string;
};

export default function useAnalytics() {
  return ({ path, category = "", action = "" }: AnalyticMessage) => {
    const disableAnalytics = localStorage.getItem("disableAnalytics");
    const isProduction = process.env.NODE_ENV === "production" ?? true;
    if (!isProduction || disableAnalytics === "true") {
      return;
    }

    if (path) {
      ReactGA.pageview(path);
    } else {
      ReactGA.event({
        category,
        action,
      });
    }
  };
}
