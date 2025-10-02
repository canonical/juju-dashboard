// Flags that should be enabled for all tests should be added to this array.
const defaultFlags: string[] = [];

/**
 * Add required feature flags to a URL.
 */
export const addFeatureFlags = (url: string, flags: string[] = []): string => {
  const [path, search] = url.split("?");
  const params = new URLSearchParams(search);
  // Use a Set to dedupe.
  Array.from(new Set([...defaultFlags, ...flags])).forEach((flag) => {
    params.append("enable-flag", flag);
  });
  return [path, params].join("?");
};
