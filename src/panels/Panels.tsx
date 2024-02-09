import { AnimatePresence } from "framer-motion";

import { useQueryParams } from "hooks/useQueryParams";
import ActionsPanel from "panels/ActionsPanel/ActionsPanel";
import SecretFormPanel from "panels/SecretFormPanel";
import ShareModel from "panels/ShareModelPanel/ShareModel";

import AuditLogsFilterPanel from "./AuditLogsFilterPanel";
import CharmsAndActionsPanel from "./CharmsAndActionsPanel/CharmsAndActionsPanel";
import ConfigPanel from "./ConfigPanel/ConfigPanel";
import RemoveSecretPanel from "./RemoveSecretPanel";

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
      case "add-secret":
        return <SecretFormPanel />;
      case "update-secret":
        return <SecretFormPanel update />;
      case "remove-secret":
        return <RemoveSecretPanel />;
      default:
        return null;
    }
  };
  return <AnimatePresence>{panelQs.panel && generatePanel()}</AnimatePresence>;
}
