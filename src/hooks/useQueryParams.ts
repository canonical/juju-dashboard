import type { ValueOf } from "@canonical/react-components";
import cloneDeep from "clone-deep";
import DOMPurify from "dompurify";
import { useCallback } from "react";
import type { NavigateOptions } from "react-router";
import { useSearchParams } from "react-router";

import { logger } from "utils/logger";

export type SetParams<P> = (
  params?: null | Partial<P>,
  options?: NavigateOptions,
) => void;

export type QueryParams = Record<string, null | string | string[]>;

export const useQueryParams = <P extends QueryParams>(
  initialParams: P,
): [P, SetParams<P>] => {
  // Clone the params to prevent updating via reference.
  const params = cloneDeep(initialParams);
  const [searchParams, setSearchParams] = useSearchParams();

  const setParam = useCallback(
    (newParams?: null | Partial<P>, options?: NavigateOptions) => {
      if (!newParams) {
        // If this is call with no params then clear all.
        Array.from(searchParams.keys()).forEach((key) => {
          searchParams.delete(key);
        });
      } else {
        Object.entries(newParams).forEach(
          ([param, value]: [string, ValueOf<P>]) => {
            if (value === undefined || value === null) {
              // Clear a param if it has been provided with a null or undefined value.
              searchParams.delete(param);
            } else {
              searchParams.set(
                param,
                Array.isArray(value) ? value.join(",") : value,
              );
            }
          },
        );
        // Sanitize all query params keys and values to prevent XSS attacks.
        searchParams.forEach((value, key) => {
          const sanitizedKey = DOMPurify.sanitize(key);
          if (key !== sanitizedKey) {
            searchParams.delete(key);
            logger.log(
              `Query param key "${key}" has been changed to "${sanitizedKey}"` +
                " in order to prevent potential XSS Attacks.",
            );
          }
          searchParams.set(sanitizedKey, DOMPurify.sanitize(value));
        });
      }
      setSearchParams(searchParams, options);
    },
    [searchParams, setSearchParams],
  );

  searchParams.forEach((value, key) => {
    if (key in params) {
      const paramKey = key as keyof P;
      if (Array.isArray(params[paramKey])) {
        // Update any array params. If the key is in the URL without a value it
        // will be returned as an empty string.
        params[paramKey] = (
          value === "" ? [] : DOMPurify.sanitize(value).split(",")
        ) as P[keyof P];
      } else {
        params[paramKey] = DOMPurify.sanitize(value) as P[keyof P];
      }
    }
  });

  return [params, setParam];
};
