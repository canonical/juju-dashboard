import childProcess from "node:child_process";

export function shell(command: string) {
  return exec("/bin/bash", "-c", "--", command);
}

export function exec(command: string, ...args: string[]) {
  const process = childProcess.spawn(command, args);
  process.stdout.setEncoding("utf8");
  process.stderr.setEncoding("utf8");

  const exit = new Promise<void>((resolve, reject) => {
    process.on("close", (code, signal) => {
      if (code === 0) {
        resolve();
      } else if (code !== null) {
        return reject(
          new Error(
            `Exit with non-zero status code (${code}): ${command} ${args.join(" ")}`,
          ),
        );
      } else {
        reject(
          new Error(
            `Process terminated with signal (${signal}): ${command} ${args.join(" ")}`,
          ),
        );
      }
    });
  });

  const output = async (stream: "stdout" | "stderr" = "stdout") => {
    let buf = "";
    process[stream].on("data", (data) => {
      buf += data;
    });
    await exit;
    return buf;
  };

  return {
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
    exit,
    output,
  };
}
