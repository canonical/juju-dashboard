import { useListener } from "@canonical/react-components";
import { AnimatePresence } from "framer-motion";
import { StringParam, useQueryParam } from "use-query-params";

import ActionsPanel from "panels/ActionsPanel/ActionsPanel";
import RegisterController from "panels/RegisterController/RegisterController";
import ShareModel from "panels/ShareModelPanel/ShareModel";

import CharmActionsPanel from "./CharmActionsPanel/CharmActionsPanel";
import CharmsPanel from "./CharmsPanel/ChamsPanel";
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
      case "choose-charm":
        return <CharmsPanel />;
      case "charm-actions":
        return <CharmActionsPanel />;
      default:
        return null;
    }
  };
  return <AnimatePresence>{panelQs && generatePanel()}</AnimatePresence>;
}
