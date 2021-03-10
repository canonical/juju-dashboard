import { useQueryParam, StringParam } from "use-query-params";
import { AnimatePresence } from "framer-motion";
import useEventListener from "hooks/useEventListener";

import RegisterController from "components/RegisterController/RegisterController";

import "./_panels.scss";

// Close panel if Escape key is pressed when panel active
export const close = {
  onEscape: function (
    e: KeyboardEvent,
    queryStringSetter: (qs: undefined) => void
  ) {
    if (e.code === "Escape") {
      queryStringSetter(undefined);
    }
  },
};

export default function Panels() {
  const [panelQs, setPanelQs] = useQueryParam("panel", StringParam);

  useEventListener("keydown", (e: KeyboardEvent) =>
    close.onEscape(e, setPanelQs)
  );

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
