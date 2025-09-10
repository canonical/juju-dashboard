import { ENABLED_FLAGS } from "consts";

const isFeatureFlagEnabled = (featureName: string): boolean => {
  const flags = JSON.parse(window.localStorage.getItem(ENABLED_FLAGS) ?? "[]");
  return Array.isArray(flags) ? flags.includes(featureName) : false;
};

export default isFeatureFlagEnabled;
