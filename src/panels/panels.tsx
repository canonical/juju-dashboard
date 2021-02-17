import { useQueryParam, StringParam } from "use-query-params";
import { AnimatePresence } from "framer-motion";

import RegisterController from "components/RegisterController/RegisterController";

import "./_panels.scss";

export default function Panels() {
  const panelQs = useQueryParam("panel", StringParam)[0];

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
