import type { ReactNode } from "react";

import type { HistoryItem } from "store/juju/types";

export type Block = {
  header: string;
  rows: string[];
};

export type Header = {
  content: string;
  ansiTitle: string;
  title: string;
  start: number;
  end?: number;
};

export type Column = {
  content: string;
  key: string;
  ansiValue: string;
  value: string;
  whitespaceBefore?: string;
  whitespaceAfter?: string;
};

export type TableLinksLink =
  | {
      externalLink: string;
    }
  | {
      link: string;
    };

type TableLinksGenerateLink = (column: Column, row: Column[]) => TableLinksLink;

type TableLinksBlocks = Record<string, TableLinksGenerateLink>;

export type CommandHandler = {
  /**
   * Wether the command needs to exactly match e.g. should it match `status` or
   * also match `status postgres`
   */
  exact?: boolean;
};

export type TableLinksCommand = {
  blocks: Record<string, TableLinksBlocks>;
} & CommandHandler;

export type TableLinks = Record<string, TableLinksCommand>;

export type ProcessCommand = {
  process: (messages: string[]) => ReactNode;
} & CommandHandler;

export type ProcessOutput = Record<string, ProcessCommand>;

export type Props = {
  content: HistoryItem[];
  helpMessage: ReactNode;
  loading?: boolean;
  processOutput?: null | ProcessOutput;
  tableLinks?: null | TableLinks;
  showHelp: boolean;
  setShouldShowHelp: (showHelp: boolean) => void;
};

export enum TestId {
  CODE = "output-code",
  CONTENT = "output-content",
  HELP = "output-help",
}
