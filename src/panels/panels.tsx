import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useQueryParam, StringParam } from "use-query-params";
import { AnimatePresence } from "framer-motion";

import RegisterController from "components/RegisterController/RegisterController";

import { togglePanel } from "ui/selectors";

import "./_panels.scss";

export default function Panels() {
  const panelId = useSelector(togglePanel) || null;
  const [panelQs, setPanelQs] = useQueryParam("panel", StringParam);

  useEffect(() => {
    panelId ? setPanelQs(panelId) : setPanelQs(undefined);
    return () => {
      panelQs && setPanelQs(undefined);
    };
  }, [panelId, panelQs, setPanelQs]);

  const generatePanel = () => {
    switch (panelId) {
      case "registerController":
        return <RegisterController />;
      default:
        return null;
    }
  };
  return <AnimatePresence>{panelId && generatePanel()}</AnimatePresence>;
}
