import { useCallback } from "react";
import { NavigateOptions, useSearchParams } from "react-router-dom";

export type SetParams<P> = (
  params?: Partial<P> | null,
  options?: NavigateOptions
) => void;

export const useQueryParams = <
  P extends Record<string, null | string | string[]>
>(
  params: P
): [P, SetParams<P>] => {
  const [searchParams, setSearchParams] = useSearchParams();

  const setParam = useCallback(
    (newParams?: Partial<P> | null, options?: NavigateOptions) => {
      if (!newParams) {
        // If this is call with no params then clear all.
        Array.from(searchParams.keys()).forEach((key) =>
          searchParams.delete(key)
        );
      } else {
        Object.entries(newParams).forEach(([param, value]) => {
          if (value === undefined || value === null) {
            // Clear a param if it has been provided with a null or undefined value.
            searchParams.delete(param);
          } else {
            searchParams.set(param, value);
          }
        });
      }
      setSearchParams(searchParams, options);
    },
    [searchParams, setSearchParams]
  );

  searchParams.forEach((value, key) => {
    if (key in params) {
      const paramKey = key as keyof P;
      if (Array.isArray(params[paramKey])) {
        // Update any array params. If the key is in the URL without a value it
        // will be returned as an empty string.
        params[paramKey] = (value === "" ? [] : value.split(",")) as P[keyof P];
      } else {
        params[paramKey] = value as P[keyof P];
      }
    }
  });
  return [params, setParam];
};
