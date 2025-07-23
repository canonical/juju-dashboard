import childProcess from "node:child_process";

export function shell(command: string) {
  return exec("/bin/bash", "-c", "--", command);
}

export function exec(command: string, ...args: string[]) {
  const process = childProcess.spawn(command, args);

  const exit = new Promise((resolve, reject) => {
    process.on("close", (code, signal) => {
      if (code !== null) {
        return resolve(code);
      }

      reject(signal);
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
