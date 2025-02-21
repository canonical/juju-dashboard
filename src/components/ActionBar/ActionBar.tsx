import type { PropsWithChildren } from "react";

const ActionBar = ({ children }: PropsWithChildren) => {
  return <div className="action-bar">{children}</div>;
};

export default ActionBar;
