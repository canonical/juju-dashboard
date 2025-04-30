import child_process from "node:child_process";
import { promisify } from "node:util";

export const exec = promisify(child_process.exec);
