import type { PanelProps } from "@canonical/react-components";
import type { ReactNode, PropsWithChildren } from "react";

import type { SecondaryNavigationProps } from "components/SecondaryNavigation";

export enum TestId {
  MAIN = "main-children",
}

export type Props = {
  loading?: boolean;
  secondaryNav?: {
    title: ReactNode;
    items: SecondaryNavigationProps["items"];
  } | null;
  title?: ReactNode;
  titleClassName?: PanelProps["titleClassName"];
  titleComponent?: PanelProps["titleComponent"];
} & PropsWithChildren;
