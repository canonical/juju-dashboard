import ReactGA from "react-ga";

export default function useSendAnalytics() {
  return ({ path, category, action }) => {
    const disableAnalytics = localStorage.getItem("disableAnalytics");
    if (
      process.env.NODE_ENV !== "production" ||
      (disableAnalytics !== "false" && disableAnalytics !== undefined)
    ) {
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
