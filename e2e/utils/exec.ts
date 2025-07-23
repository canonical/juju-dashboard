import childProcess from "node:child_process";

export class CommandError extends Error {
  constructor(message: string, command: string, args: string[]) {
    super(`${message}: ${command} ${args.join(" ")}`);
  }
}

export class StatusError extends CommandError {
  constructor(status: number, command: string, args: string[]) {
    super(`Exit with non-zero status code (${status})`, command, args);
  }
}

export class SignalError extends CommandError {
  constructor(signal: string, command: string, args: string[]) {
    super(`Process terminated with signal (${signal})`, command, args);
  }
}

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
        return reject(new StatusError(code, command, args));
      } else if (signal) {
        reject(new SignalError(signal, command, args));
      } else {
        reject(new CommandError("Unknown process error", command, args));
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
