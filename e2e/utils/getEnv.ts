/**
 * Fetch a variable from the environment. If it is not present and no fallback is provided, an error will be thrown.
 */
export function getEnv(key: string): string;
export function getEnv<F>(key: string, fallback?: F): F | string;
export function getEnv<F>(key: string, fallback?: F): F | string {
  if (!(key in process.env) || !process.env[key]) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`${key} not present in environment`);
  }

  return process.env[key];
}
