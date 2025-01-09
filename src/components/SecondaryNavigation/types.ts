import type { SideNavigationProps } from "@canonical/react-components";
import type { ReactNode } from "react";
import type { NavLinkProps } from "react-router-dom";

export type Props = {
  items: NonNullable<SideNavigationProps<NavLinkProps>["items"]>;
  title: ReactNode;
};
