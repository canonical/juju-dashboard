import { AnimatePresence } from "framer-motion";

import { useQueryParams } from "hooks/useQueryParams";
import ActionsPanel from "panels/ActionsPanel/ActionsPanel";
import RegisterController from "panels/RegisterController/RegisterController";
import ShareModel from "panels/ShareModelPanel/ShareModel";

import CharmActionsPanel from "./ActionsPanel/CharmActionsPanel";
import ChooseCharmsPanel from "./ChooseCharmsPanel/ChooseCharmsPanel";
import ConfigPanel from "./ConfigPanel/ConfigPanel";

export default function Panels() {
  const [panelQs] = useQueryParams<{ panel: string | null }>({
    panel: null,
  });

  const generatePanel = () => {
    switch (panelQs.panel) {
      case "register-controller":
        return <RegisterController />;
      case "execute-action":
        return <ActionsPanel />;
      case "share-model":
        return <ShareModel />;
      case "choose-charm":
        return <ChooseCharmsPanel />;
      case "charm-actions":
        return <CharmActionsPanel />;
      case "config":
        return <ConfigPanel />;
      default:
        return null;
    }
  };
  return <AnimatePresence>{panelQs.panel && generatePanel()}</AnimatePresence>;
}
