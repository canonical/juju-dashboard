import { useCallback } from "react";

import {
  type SetParams,
  type QueryParams,
  useQueryParams,
} from "hooks/useQueryParams";

export const usePanelQueryParams = <P extends QueryParams>(
  defaultQueryParams: P
): [P, SetParams<P>, () => void] => {
  const [queryParams, setQueryParams] = useQueryParams<P>(defaultQueryParams);

  const handleRemovePanelQueryParams = useCallback(() => {
    const paramsToClear: Partial<P> = {};
    Object.keys(defaultQueryParams).forEach((param: keyof P) => {
      paramsToClear[param] = undefined;
    });
    setQueryParams(paramsToClear, { replace: true });
  }, [defaultQueryParams, setQueryParams]);

  return [queryParams, setQueryParams, handleRemovePanelQueryParams];
};
