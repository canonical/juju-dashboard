import type { PropsWithChildren } from "react";

import "./_action-bar.scss";

const ActionBar = ({ children }: PropsWithChildren) => {
  return <div className="action-bar">{children}</div>;
};

export default ActionBar;
