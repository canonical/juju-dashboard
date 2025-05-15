const flags = [["enable-flag", "rebac"]];

/**
 * Add required feature flags to a URL.
 */
export const addFeatureFlags = (url: string): string => {
  const [path, search] = url.split("?");
  const params = new URLSearchParams(search);
  flags.forEach(([flag, value]) => params.append(flag, value));
  return [path, params].join("?");
};
