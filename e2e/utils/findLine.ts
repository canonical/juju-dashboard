import type { Readable } from "node:stream";

export async function findLine(
  stream: Readable,
  filter: (line: string, allLines: string[]) => boolean,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const allLines: string[] = [];
    let prefix: string = "";

    function removeListeners(): void {
      // There are circular dependencies between the listener and handlers that gets resolved at run time.
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      stream.off("data", onData);
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      stream.off("end", onEnd);
    }

    function onData(data: string): void {
      const lines = data.split("\n");

      if (lines.length > 0) {
        lines[0] = prefix + lines[0];
      }

      prefix = lines.pop() ?? "";

      for (const line of lines) {
        allLines.push(line);

        if (filter(line, allLines)) {
          removeListeners();

          // Produce the line
          resolve(line);
          return;
        }
      }
    }

    function onEnd(): void {
      removeListeners();

      allLines.push(prefix);

      if (filter(prefix, allLines)) {
        resolve(prefix);
        return;
      }

      reject(
        new Error("no line found matching filter", {
          cause: { lines: allLines },
        }),
      );
    }

    stream.on("data", onData).on("end", onEnd);
  });
}
