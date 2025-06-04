import type { CommandHandler, ProcessOutput } from "./Output/types";

/**
 * Get the handler for the command, if any.
 * @param command The command that was run.
 * @param handlers The handlers to search through.
 * @returns A matching handler, if it exists.
 */
const getHandler = <Handlers extends Record<string, CommandHandler>>(
  command: string,
  handlers: Handlers,
) => {
  for (const handlerCommand in handlers) {
    const handler = handlers[handlerCommand];
    if (
      handlerCommand === command ||
      // If the command allows non-exact matches then check if the base command
      // matches e.g. match `status` or also match `status postgres` and `status --color`
      (!handler.exact && command.startsWith(`${handlerCommand} `))
    ) {
      return handler;
    }
  }
};

/**
 * Process custom output for provided commands.
 * @param command The command that was entered into the CLI.
 * @param messages The messages returned by the API.
 * @param processOutput The render function for each command.
 * @returns The resulting nodes.
 */
export const processCommandOutput = (
  command: string,
  messages: string[],
  processOutput: ProcessOutput,
) => {
  const handler = getHandler(command, processOutput);
  if (handler) {
    return handler.process(messages);
  }
};
