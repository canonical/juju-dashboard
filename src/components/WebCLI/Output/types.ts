import type { ReactNode } from "react";

export type CommandHandler = {
  /**
   * Wether the command needs to exactly match e.g. should it match `status` or
   * also match `status postgres`
   */
  exact?: boolean;
};

export type ProcessCommand = {
  process: (messages: string[]) => ReactNode;
} & CommandHandler;

export type ProcessOutput = Record<string, ProcessCommand>;

export type Props = {
  content: string[];
  command?: string | null;
  helpMessage: ReactNode;
  loading?: boolean;
  processOutput?: ProcessOutput;
  showHelp: boolean;
  setShouldShowHelp: (showHelp: boolean) => void;
};

export enum TestId {
  CODE = "output-code",
  CONTENT = "output-content",
  HELP = "output-help",
}
