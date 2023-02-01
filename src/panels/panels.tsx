import { useListener } from "@canonical/react-components";
import { useQueryParam, StringParam } from "use-query-params";
import { AnimatePresence } from "framer-motion";

import ActionsPanel from "panels/ActionsPanel/ActionsPanel";
import RegisterController from "panels/RegisterController/RegisterController";
import ShareModel from "panels/ShareModelPanel/ShareModel";

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

  useListener(
    window,
    (e: KeyboardEvent) => close.onEscape(e, setPanelQs),
    "keydown"
  );

  const generatePanel = () => {
    switch (panelQs) {
      case "register-controller":
        return <RegisterController />;
      case "execute-action":
        return <ActionsPanel />;
      case "share-model":
        return <ShareModel />;
      default:
        return null;
    }
  };
  return <AnimatePresence>{panelQs && generatePanel()}</AnimatePresence>;
}
