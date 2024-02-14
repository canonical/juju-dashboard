import { AnimatePresence } from "framer-motion";

import useCanManageSecrets from "hooks/useCanManageSecrets";
import { useQueryParams } from "hooks/useQueryParams";
import ActionsPanel from "panels/ActionsPanel/ActionsPanel";
import SecretFormPanel from "panels/SecretFormPanel";
import ShareModel from "panels/ShareModelPanel/ShareModel";

import AuditLogsFilterPanel from "./AuditLogsFilterPanel";
import CharmsAndActionsPanel from "./CharmsAndActionsPanel/CharmsAndActionsPanel";
import ConfigPanel from "./ConfigPanel/ConfigPanel";
import GrantSecretPanel from "./GrantSecretPanel";
import RemoveSecretPanel from "./RemoveSecretPanel";

export default function Panels() {
  const [panelQs] = useQueryParams<{ panel: string | null }>({
    panel: null,
  });
  const canManageSecrets = useCanManageSecrets();

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
        return canManageSecrets ? <SecretFormPanel /> : null;
      case "update-secret":
        return canManageSecrets ? <SecretFormPanel update /> : null;
      case "grant-secret":
        return canManageSecrets ? <GrantSecretPanel /> : null;
      case "remove-secret":
        return canManageSecrets ? <RemoveSecretPanel /> : null;
      default:
        return null;
    }
  };
  return <AnimatePresence>{panelQs.panel && generatePanel()}</AnimatePresence>;
}
