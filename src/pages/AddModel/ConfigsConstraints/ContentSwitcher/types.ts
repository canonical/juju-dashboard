import type { ReactNode } from "react";

export enum InputMode {
  LIST = "List",
  YAML = "YAML",
}

export type Props = {
  showPrimary?: boolean;
  docsLabel: string;
  docsLink: string;
  primaryContent: ReactNode;
  secondaryContent: ReactNode;
  onModeChange: (isListMode: boolean) => void;
  title: string;
};
