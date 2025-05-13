/**
 * Add required feature flags to a URL.
 */
export const addFeatureFlags = (url: string): string =>
  [url, "enable-flag=rebac"].join(url.includes("?") ? "&" : "?");
