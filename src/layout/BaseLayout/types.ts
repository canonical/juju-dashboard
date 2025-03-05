import type { PanelProps } from "@canonical/react-components";
import type { ReactNode, PropsWithChildren } from "react";

import type { SecondaryNavigationProps } from "components/SecondaryNavigation";

export enum TestId {
  MAIN = "main-children",
}

export enum Label {
  OFFLINE = "Your dashboard is offline.",
  MOBILE_MENU_OPEN_BUTTON = "Open menu",
  MOBILE_MENU_CLOSE_BUTTON = "Close menu",
}

export type Props = {
  loading?: boolean;
  secondaryNav?: {
    title: ReactNode;
    items: SecondaryNavigationProps["items"];
  };
  status?: ReactNode;
  title?: ReactNode;
  titleClassName?: PanelProps["titleClassName"];
  titleComponent?: PanelProps["titleComponent"];
} & PropsWithChildren;
