import { useIsJIMMAdmin } from "juju/api-hooks/permissions";
import { isReBACEnabled } from "store/general/selectors";
import { useAppSelector } from "store/store";
import { FeatureFlags } from "types";
import isFeatureFlagEnabled from "utils/isFeatureFlagEnabled";

/**
 * Check whether a user can access rebac admin.
 */
const useCanAccessReBACAdmin = (): boolean => {
  const rebacEnabled = useAppSelector(isReBACEnabled);
  const { permitted: isJIMMControllerAdmin } = useIsJIMMAdmin();
  return !!(
    rebacEnabled &&
    isJIMMControllerAdmin &&
    isFeatureFlagEnabled(FeatureFlags.REBAC)
  );
};

export default useCanAccessReBACAdmin;
