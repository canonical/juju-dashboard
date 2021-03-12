import { useQueryParam, StringParam } from "use-query-params";
import { AnimatePresence } from "framer-motion";
import useEventListener from "hooks/useEventListener";
import { TSFixMe } from "types";

import RegisterController from "components/RegisterController/RegisterController";

import "./_panels.scss";

// Close panel if Escape key is pressed when panel active
export const close = {
  onEscape: function (e: TSFixMe, queryStringSetter: (qs: undefined) => void) {
    const targetType = e.target?.tagName.toLowerCase();
    let isTargetFormElement;
    switch (targetType) {
      case "form":
      case "input":
      case "textarea":
      case "select":
      case "option":
        isTargetFormElement = true;
    }

    if (e.code === "Escape" && !isTargetFormElement) {
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
