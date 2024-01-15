import { AnimatePresence } from "framer-motion";

import { useQueryParams } from "hooks/useQueryParams";
import ActionsPanel from "panels/ActionsPanel/ActionsPanel";
import ShareModel from "panels/ShareModelPanel/ShareModel";

import AuditLogsFilterPanel from "./AuditLogsFilterPanel";
import CharmsAndActionsPanel from "./CharmsAndActionsPanel/CharmsAndActionsPanel";
import ConfigPanel from "./ConfigPanel/ConfigPanel";

export default function Panels() {
  const [panelQs] = useQueryParams<{ panel: string | null }>({
    panel: null,
  });

  const generatePanel = () => {
    switch (panelQs.panel) {
      case "execute-action":
        return <ActionsPanel />;
      case "share-model":
        return <ShareModel />;
      case "select-charms-and-actions":
        return <CharmsAndActionsPanel />;
      case "config":
        return <ConfigPanel />;
      case "audit-log-filters":
        return <AuditLogsFilterPanel />;
      default:
        return null;
    }
  };
  return <AnimatePresence>{panelQs.panel && generatePanel()}</AnimatePresence>;
}
