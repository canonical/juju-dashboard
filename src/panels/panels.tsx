import { useQueryParam, StringParam } from "use-query-params";
import { AnimatePresence } from "framer-motion";
import useEventListener from "hooks/useEventListener";

import RegisterController from "components/RegisterController/RegisterController";

import "./_panels.scss";

export default function Panels() {
  const [panelQs, setPanelQs] = useQueryParam("panel", StringParam);

  // Close panel if Escape key is pressed when panel active
  const closeOnEscape = (e: KeyboardEvent) => {
    if (e.code === "Escape") {
      setPanelQs(undefined);
    }
  };
  useEventListener("keydown", closeOnEscape);

  const generatePanel = () => {
    switch (panelQs) {
      case "register-controller":
        return <RegisterController />;
      default:
        return null;
    }
  };
  return <AnimatePresence>{panelQs && generatePanel()}</AnimatePresence>;
}
