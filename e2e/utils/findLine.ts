import type { Readable } from "node:stream";

export function findLine(
  stream: Readable,
  filter: (line: string, allLines: string[]) => boolean,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const allLines: string[] = [];
    let prefix: string = "";

    function onData(data: string) {
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
          return resolve(line);
        }
      }
    }

    function onEnd() {
      removeListeners();

      allLines.push(prefix);

      if (filter(prefix, allLines)) {
        return resolve(prefix);
      }

      reject(
        new Error("no line found matching filter", {
          cause: { lines: allLines },
        }),
      );
    }

    function removeListeners() {
      stream.off("data", onData);
      stream.off("end", onEnd);
    }

    stream.on("data", onData).on("end", onEnd);
  });
}
