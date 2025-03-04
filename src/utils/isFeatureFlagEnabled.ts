import { ENABLED_FLAGS } from "consts";

const isFeatureFlagEnabled = (featureName: string) =>
  JSON.parse(window.localStorage.getItem(ENABLED_FLAGS) ?? "[]").includes(
    featureName,
  );

export default isFeatureFlagEnabled;
