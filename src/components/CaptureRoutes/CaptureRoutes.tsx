import type { JSX } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router";

import useAnalytics from "hooks/useAnalytics";
import useFeatureFlags from "hooks/useFeatureFlags";

const CaptureRoutes = (): JSX.Element | null => {
  useFeatureFlags();
  const sendAnalytics = useAnalytics();
  const location = useLocation();

  useEffect(() => {
    // Send an analytics event when the URL changes.
    sendAnalytics({
      path: window.location.href.replace(window.location.origin, ""),
    });
  }, [location, sendAnalytics]);

  return null;
};

export default CaptureRoutes;
