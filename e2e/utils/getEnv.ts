/**
 * Fetch a variable from the environment. If it is not present, an error will be thrown.
 */
export function getEnv(key: string): string {
  if (!(key in process.env) || !process.env[key]) {
    throw new Error(`${key} not present in environment`);
  }

  return process.env[key];
}
