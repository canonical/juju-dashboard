import { useCallback, useEffect, useMemo } from "react";

import { ENABLED_FLAGS } from "consts";

import useLocalStorage from "./useLocalStorage";
import { useQueryParams } from "./useQueryParams";

type FlagQueryParams = {
  "enable-flag": string[] | null;
  "disable-flag": string[] | null;
};

export default function useFeatureFlags() {
  const [queryParams] = useQueryParams<FlagQueryParams>({
    "enable-flag": [],
    "disable-flag": [],
  });
  const [enabledFlags, setEnabledFlags] = useLocalStorage<string[]>(
    ENABLED_FLAGS,
    [],
  );

  const getFinalFlags = useCallback(() => {
    const enabledParams = queryParams["enable-flag"] ?? [];
    const disabledParams = queryParams["disable-flag"] ?? [];

    // remove disabled params from flag list
    let result = enabledFlags.filter((flag) => !disabledParams.includes(flag));

    // append enabled params to flag list
    result = enabledParams.reduce((acc, param) => {
      if (!disabledParams.includes(param) && !acc.includes(param)) {
        return [...acc, param];
      }
      return acc;
    }, result);
    return result;
  }, [queryParams, enabledFlags]);

  const finalFlags = useMemo(() => getFinalFlags(), [getFinalFlags]);

  useEffect(() => {
    // deep comparison to prevent unnecessary re-renders
    if (JSON.stringify(finalFlags) !== JSON.stringify(enabledFlags)) {
      setEnabledFlags(finalFlags);
    }
  }, [setEnabledFlags, finalFlags, enabledFlags]);
}
