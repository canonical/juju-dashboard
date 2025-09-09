import Ansi from "@curvenote/ansi-to-react";
import fastDeepEqual from "fast-deep-equal/es6";
import React from "react";
import type { ReactNode } from "react";

import { processTableLinks, processCommandOutput } from "../../utils";

import type { Props } from "./types";

const defaultProcessOutput = (_command: string, messages: string[]) => (
  <Ansi>{messages.map((message) => `${message}\n`).join("")}</Ansi>
);

const OutputCommand = ({
  command,
  messages,
  tableLinks,
  processOutput,
}: Props) => {
  let response: ReactNode = null;
  // Handle custom renders. If a renderer doesn't return anything then it
  // falls through to the next handler.
  try {
    if (tableLinks) {
      response = processTableLinks(command, messages, tableLinks);
    }
    if (!response && processOutput) {
      response = processCommandOutput(command, messages, processOutput);
    }
    const hasResponse = Boolean(response);
    if (!hasResponse) {
      response = defaultProcessOutput(command, messages);
    }
  } catch (err) {
    // If the provided processor fails (e.g. if the data isn't what was expected) then fall back to the default.
    response = defaultProcessOutput(command, messages);
  }

  return (
    <div className="webcli__output-content-response">
      <div>$ {command}</div>
      {response}
    </div>
  );
};

export default React.memo(OutputCommand, fastDeepEqual);
