import type { FC, PropsWithChildren } from "react";

const ActionBar: FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
  return <div className="action-bar">{children}</div>;
};

export default ActionBar;
