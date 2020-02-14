import ReactGA from "react-ga";
import { analyticsEnabled } from "app/utils";

export default function useSendAnalytics() {
  return ({ path, category, action }) => {
    if (!analyticsEnabled()) {
      return;
    }

    if (path) {
      ReactGA.pageview(path);
    } else {
      ReactGA.event({
        category,
        action
      });
    }
  };
}
