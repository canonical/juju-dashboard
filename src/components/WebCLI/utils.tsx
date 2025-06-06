import Ansi from "@curvenote/ansi-to-react";
import hasAnsi from "has-ansi";
import type { ReactNode } from "react";
import { Link } from "react-router";
import sliceAnsi from "slice-ansi";
import stripAnsi from "strip-ansi";

import type {
  Block,
  Column,
  CommandHandler,
  Header,
  ProcessOutput,
  TableLinks,
  TableLinksCommand,
  TableLinksLink,
} from "./Output/types";

// Get the whitespace surrounding the contents of a column. This should only be used
// on content that has been stripped of ANSI codes as the ANSI codes interrupt
// the positions of the whitespace.
// The leading whitespace can be any number of characters where the content is
// right aligned, whereas the whitespace at the end must be at least two
// characters as columns are divided by two spaces.
const COLUMN_WHITESPACE_REGEX = /^(?<before>\s+)?(?:\S+)?(?<after>\s{2,}$)?/;

// Columns are separated by at least two spaces.
const COLUMN_DIVIDER_REGEX = /\s{2,}/;

/**
 * Get blocks with a table view. Each block starts with a header row.
 * The follow is an example of a table with two blocks:
 *
 * Model  Controller  Cloud/Region         Version    SLA          Timestamp
 * k8s    localhost   localhost/localhost  3.2-beta3  unsupported  12:03:39+10:00
 *
 * App                       Version  Status   Scale  Charm
 * calico                    3.21.4   error        2  calico
 * containerd                1.6.8    active       2  containerd
 *
 * @param messages The array of messages returned by the API.
 * @returns The processed blocks.
 */
export const getBlocks = (messages: string[]) => {
  const blocks: Block[] = [];
  let split = 0;
  while (split <= messages.length - 1) {
    // Start at the next line, unless this is the first item in the array.
    const start = split ? split + 1 : 0;
    // Each block is separated by a blank line so get the position at the end of
    // the block.
    split = messages.indexOf("", start);
    // If this is the last block get all the remaining lines.
    split = split < 0 ? messages.length : split;
    const block = messages.slice(start, split);
    // Ignore any empty blocks (this might happen if there are two empty lines
    // in a row).
    if (block.length) {
      blocks.push({
        // The first line is always the header.
        header: block[0],
        rows: block.slice(1),
      });
    }
  }
  return blocks;
};

/**
 * Replace spaces within ANSI codes as the library does not recognise these.
 * The original codes are in the format "[1; " and the returned codes will be "[1;".
 * @param text The text to process
 * @returns The fixed text.
 */
const fixANSI = (text: string) =>
  hasAnsi(text) ? text.replace(/(?<=\[\d+;) /g, "") : text;

/**
 * Get all the header columns for a table. The width of the headers is used to
 * extract the content, so this also stores the width data.
 * The following is an example of a table header:
 *
 * Model  Controller  Cloud/Region         Version    SLA          Timestamp
 *
 * @param row The string of row headers.
 * @returns The processed rows.
 */
export const getHeaders = (row: string) => {
  const columns: Header[] = [];
  let remainder = fixANSI(row);
  let end = 0;
  while (remainder.length > 0) {
    // Columns are separated by two spaces so get the position of the end of the column.
    let split = stripAnsi(remainder).search(/(?<=\s{2})\S/);
    // If this is the last column then get all the remaining characters.
    split = split < 0 ? remainder.length : split;
    // Use ANTSI code aware slicers as the ANTSI codes interrupt the column widths.
    const content = sliceAnsi(remainder, 0, split);
    remainder = sliceAnsi(remainder, split);
    const start = end ? end + 1 : 0;
    end += stripAnsi(content).length;
    // Extract the title including any ANSI codes, but without the whitespace.
    // When the column contains ANSI codes then the whitespace will occur before
    // the reset code.
    const ansiTitle = content.replace(COLUMN_DIVIDER_REGEX, "");
    const header: Header = {
      content,
      ansiTitle,
      title: stripAnsi(ansiTitle),
      start,
    };
    // If this is the last item then don't include the end as the columns in the
    // content rows can have more characters than the header column.
    if (remainder.length != 0) {
      header.end = end;
    }
    columns.push(header);
  }
  return columns;
};

/**
 * Extract all the content columns for the table.
 * The following is an example of the rows in a table (without the header):
 *
 * calico                    3.21.4   error        2  calico
 * containerd                1.6.8    active       2  containerd
 *
 * @param rows The content rows.
 * @param headers The table headers.
 * @returns The processed columns.
 */
export const getColumns = (rows: string[], headers: Header[]): Column[][] => {
  return rows.map((row) => {
    const columns: Column[] = [];
    row = fixANSI(row);
    headers.forEach((header) => {
      const content = sliceAnsi(
        row,
        // Use the width of the header to figure out where the column content is. This
        // is required so we know where empty columns are.
        header.start ? header.start - 1 : header.start,
        header.end ?? row.length,
      );
      // Get the content without the whitespace, this will be extracted below.
      const ansiValue = content
        .replace(new RegExp(COLUMN_DIVIDER_REGEX, "g"), "")
        .trim();
      const column: Column = {
        key: header.title,
        content,
        ansiValue,
        value: stripAnsi(ansiValue),
      };
      // This matches the whitespace after ANTSI codes have been removed other
      // the codes would interrupt the whitespace positions.
      const { before, after } =
        stripAnsi(content).match(COLUMN_WHITESPACE_REGEX)?.groups || {};
      if (before) {
        column.whitespaceBefore = before;
      }
      if (after) {
        column.whitespaceAfter = after;
      }
      columns.push(column);
    });
    return columns;
  });
};

/**
 * If this is an internal link then use the React Router Link
 * otherwise use a native link.
 * @param link The link object.
 * @param ansiValue The ANSI contents for the link.
 * @returns The generated link nodes.
 */
const generateLink = (link: TableLinksLink, ansiValue: string) =>
  "link" in link ? (
    <Link to={link.link}>
      <Ansi>{ansiValue}</Ansi>
    </Link>
  ) : (
    <a href={link.externalLink} target="_blank" rel="noopener noreferrer">
      <Ansi>{ansiValue}</Ansi>
    </a>
  );

/**
 * Insert links and construct the table.
 * @param command The link mapping for each block in the table.
 * @param messages The row messages returned by the API.
 * @returns The constructed nodes.
 */
const insertLinks = (command: TableLinksCommand, messages: string[]) => {
  const blocks = getBlocks(messages);
  const blockNodes: ReactNode[] = [...blocks].map((block) => {
    let rowNodes: ReactNode[] = [];
    const headers = getHeaders(block.header);
    const rows = getColumns(block.rows, headers);
    const blockTitle = headers[0].title;
    // Check if there is a mapping of links for this block.
    if (blockTitle in command.blocks) {
      const blockLinks = command.blocks[blockTitle];
      rowNodes = rows.map((columns) => {
        return (
          <div key={columns.map(({ value }) => value).join("-")}>
            {columns.map((column) => {
              let content: ReactNode;
              // Handle links for this column.
              if (column.key in blockLinks) {
                content = generateLink(
                  blockLinks[column.key](column, columns),
                  column.ansiValue,
                );
              } else {
                content = <Ansi>{column.ansiValue}</Ansi>;
              }
              // Reconstruct the column including its whitespace.
              return (
                <span key={`${column.key}-${column.value}`}>
                  {column.whitespaceBefore}
                  {content}
                  {column.whitespaceAfter}
                </span>
              );
            })}
          </div>
        );
      });
    } else {
      // If there is no mapping for this block then just construct the block.
      rowNodes = block.rows.map((row) => (
        <div key={row}>
          <Ansi key={row}>{row}</Ansi>
        </div>
      ));
    }
    return (
      <div key={block.header}>
        <Ansi>{block.header}</Ansi>
        <br />
        {rowNodes}
        <br />
      </div>
    );
  });
  return <>{blockNodes}</>;
};

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
 * Wrap column content in links as provided as a map between CLI commands, Any
 * commands that are not matched by a handler will fall through to the next
 * processor in Output.tsx.
 * @param command The command that was entered into the CLI.
 * @param messages The messages returned by the API.
 * @param tableLinks The link mapping for each command.
 * @returns The resulting nodes if the command matches a handler.
 */
export const processTableLinks = (
  command: string,
  messages: string[],
  tableLinks: TableLinks,
) => {
  const handler = getHandler(command, tableLinks);
  if (handler) {
    return insertLinks(handler, messages);
  }
};

/**
 * Process custom output for provided commands. Any commands that are not
 * matched by a handler will fall through to the default processor in Output.tsx.
 * @param command The command that was entered into the CLI.
 * @param messages The messages returned by the API.
 * @param processOutput The render function for each command.
 * @returns The resulting nodes if the command matches a handler.
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
